<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import ChannelWindow from './ChannelWindow.vue'
import axios from "axios";
import { useRoute } from "vue-router";
import { ElInput, ElButton } from 'element-plus'
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
const route = useRoute();

async function GetAllAccessChannels() {
	channels.value = (await axios.get('chat/')).data
}

let msg: string

async function GetChannelIdFromClick(channelId: number, isMember: boolean, have_password: boolean) {
	console.log('isMember')
	console.log(isMember)
	msg = ''
	if (!route.params.id || channelId !== Number(route.params.id)) {
		window.history.pushState('http://' + window.location.host + '/chat/' + channelId, 'http://' + window.location.host + '/chat/', 'http://' + window.location.host + '/chat/' + channelId)
	}
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
	document.location.assign('http://' + window.location.host + '/chat/')
	GetAllAccessChannels()
}

onMounted(async () => {
	if (route.params.id) {
		GetChannelIdFromClick(Number(route.params.id), true, false)
	}
	else {
		await GetAllAccessChannels()
	}

})

</script>

<template>
	<ChannelWindow :type=WindowForChannel.type :chanelId=WindowForChannel.channelId :msg=msg v-if="WindowForChannel.isOpen"
		@ChannelWindowIsClose='EmitCloseWindow' />
	<div class='Channels'>
		<el-button style="width: 20%;" color="green" @click="WindowChannel('create')">
			Create
		</el-button>
		<h1>Channels</h1>
		<div style="position: relative; height: 95%; width: 100%; overflow: auto;">
			<div v-for=" channel in channels">
				<li class="channel">
					<span style="font-size: 21px;"
						@click="GetChannelIdFromClick(channel.id, channel.isMember, channel.have_password)">
						{{ channel.chat_name }} </span>
					<el-button color="red" size="small" v-show="channel.isOwner"
						@click="DelChannel(channel.id)">Delete</el-button>
				</li>
			</div>
		</div>

	</div>
</template>

<style scoped>
.Channels {
	position: fixed;
	top: 2%;
	left: 11%;
	width: 22%;
	height: max-content;
	max-height: 95%;
	border-radius: 10px;
	z-index: 1;
	overflow: auto;
}

.Channels:after {
	content: "";
	position: fixed;
	background: inherit;
	z-index: -1;
	top: 2%;
	left: 11%;
	width: 22%;
	height: auto;
	max-height: 95%;
	right: 0;
	bottom: 0;
	border-radius: 10px;
	box-shadow: inset 0 10000px 200px rgba(255, 255, 255, .5);
	filter: blur(2px);
	margin: 0px;
	overflow: auto;
}

.channel {
	cursor: pointer;
	color: blue;
	width: 200px;
}

.Channels button {
	position: absolute;
	padding: 0%;
	/*overflow: scroll;*/
	right: 1%;
}
</style>
