<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import ChannelWindow from './ChannelWindow.vue'
import axios from "axios";
const props = defineProps<{
	leave?: boolean
}>()
const emit = defineEmits<{
	(e: 'GetChannelId', chennelId: number): void
}>()

watch(props, async (newProps) => {
	console.log('watch')
	if (newProps.leave === true) {
		console.log('I leave')
		await GetAllAccessChannels()
	}
})

const WindowForChannel = ref<{
	isOpen: boolean,
	type: string,
	channelId?: number
}>({ isOpen: false, type: '' });

async function WindowChannel(type: string, channelId?: number) {
	WindowForChannel.value = { isOpen: true, type: type, channelId: channelId }
}
async function EmitCloseWindow() {
	channels.value = (await axios.get('chat/')).data
	WindowForChannel.value = { isOpen: false, type: '' }
}

interface Channel {
	id: number,
	chat_name: string,
	isPrivate: boolean,
	have_password: boolean,
	password: string,
	isMember: boolean,
	isAdmin: boolean,
	isOwner: boolean,
}

const channels = ref<Channel[]>()

async function GetAllAccessChannels() {
	channels.value = (await axios.get('chat/')).data
}

let msg: string

async function GetChannelIdFromClick(channelId: number, isMember: boolean, have_password: boolean) {
	console.log('isMember')
	console.log(isMember)
	msg = ''
	if (isMember) {
		emit("GetChannelId", channelId)
	}
	else if (!have_password) {
		await axios.post('chat/joinToChannel', { chat_id: channelId }).catch((e) => {
			console.log(e.response.data.message)
			msg = e.response.data.message
			WindowChannel('msg', channelId)
		})
		if (!msg) {
			emit("GetChannelId", channelId)
		}

	}
	else {
		WindowChannel('checkPassword', channelId)
	}
	GetAllAccessChannels()
}

async function DelChannel(channelId: number) {
	await axios.post('chat/deleteChannel', { 'chat_id': channelId }).catch((e) => {
		console.log(e.response.data.message)
	})
	GetAllAccessChannels()
}

onMounted(async () => {
	await GetAllAccessChannels()
})

</script>

<template>
	<ChannelWindow :type=WindowForChannel.type :chanelId=WindowForChannel.channelId :msg=msg v-if="WindowForChannel.isOpen"
		@ChannelWindowIsClose='EmitCloseWindow' />
	<div class='Channels'>
		<div class="buttonCreateChannel">
			<button @click="WindowChannel('create')">
				Create
			</button>
		</div>
		<h1>Channels</h1>
		<div style="position: absolute; overflow: scroll;height: 90%;width: 288px;">
			<div v-for="channel in channels">
				<p class="channel">
					<span @click="GetChannelIdFromClick(channel.id, channel.isMember, channel.have_password)">
						{{ channel.chat_name }} </span>
					<button v-show="channel.isOwner" @click="DelChannel(channel.id)">Delete</button>
				</p>
			</div>
		</div>

	</div>
</template>

<style scoped>
.Channels {
	position: fixed;
	top: 10px;
	left: 10%;
	right: 70%;
	background-color: antiquewhite;
	height: 90%;
}

.channel {
	cursor: pointer;
	color: blue;
	width: 200px;
}

.Channels button {
	position: absolute;
	overflow: scroll;
	right: 0%;
}
</style>
