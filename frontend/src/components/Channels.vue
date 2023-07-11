<script setup lang="ts">
import { ref, onMounted } from "vue";
import WindowCreateChannel from './CreateChannel.vue'
import axios from "axios";

const emit = defineEmits<{
	(e: 'GetChannelId', chennelId: number): void
}>()

const WindowForCreateChannel = ref<number>(0);

async function CreateChannel() {
	WindowForCreateChannel.value = 1;
}
async function EmitCloseWindow() {
	channels.value = (await axios.get('chat/')).data
	WindowForCreateChannel.value = 0
}

interface Channel {
	id: number,
	chat_name: string,
	isPrivate: boolean,
	have_password: boolean,
	password: string
}

const channels = ref<Channel[]>()

async function GetAllAccessChannels() {
	channels.value = (await axios.get('chat/')).data
}

async function GetChannelIdFromClick(clickChannelId: number) {
	emit("GetChannelId", clickChannelId)
}

async function DelChannel(ChannelId: number) {
	await axios.post('chat/deleteChannel', { 'chat_id': ChannelId }).catch((e) => {
		console.log(e.response.data.message)
	})
	channels.value = (await axios.get('chat/')).data
}

onMounted(async () => {
	await GetAllAccessChannels()
})

</script>

<template>
	<WindowCreateChannel v-if="WindowForCreateChannel" @CreateChannelWindowIsClose='EmitCloseWindow' />
	<div class='Channels'>
		<div class="buttonCreateChannel">
			<button @click="CreateChannel()">
				Create
			</button>
		</div>
		<h1>Channels</h1>
		<div v-for="channel in channels">
			<p class="channel">
				<span @click="GetChannelIdFromClick(channel.id)"> {{ channel.chat_name }} </span>
				<button @click="DelChannel(channel.id)">Delete</button>
			</p>
		</div>
	</div>
</template>

<style scoped>
.Channels {
	position: absolute;
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
	right: 5%;
}
</style>
