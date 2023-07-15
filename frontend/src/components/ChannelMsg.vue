<script setup lang="ts">
import axios from "axios";
import { onMounted, ref, watch } from "vue";
import { io } from "socket.io-client";
const props = defineProps<{
	channelId?: number
}>()

const sendMsg = ref<string>('')

async function SendMsg(channelId: number | undefined, msg: string) {
	console.log('channelId')
	console.log(channelId)
	console.log('msg')
	console.log(msg)
	await axios.post('chat/sendMessage', { chat_id: channelId, message: msg }).catch((e) => {
		console.log(e)
	}).then(() => {
		sendMsg.value = ''
	})
	if (channelId) {
		GetMsg(channelId)
	}
}

interface Msg {
	player_id?: number,
	sender_name?: string,
	isOwnerOfMsg?: boolean,
	message?: string,
	sent_ts?: Date,
}

const msgs = ref<Msg[]>()

async function GetMsg(channelId: number) {
	await axios.post('chat/GetChatMessages', { chat_id: channelId }).catch((e) => {
		console.log(e)
	}).then((res: any) => {
		msgs.value = res.data
	})
}

onMounted(async () => {
	if (props.channelId) {
		await GetMsg(props.channelId)
	}
})

watch(props, (newProps) => {
	if (newProps.channelId) {
		GetMsg(newProps.channelId)
	}
})

</script>

<template>
	<div class="Chat">
		<h1>Msg in the channel {{ channelId }}</h1>
		<span style="position: absolute; top: 100% " v-if="channelId">
			<input type="text" v-model="sendMsg" placeholder="write msg" style="width: 390px;">
			<button @click="SendMsg(channelId, sendMsg)">
				Send
			</button>
		</span>
		<div class="Msgs" v-for="msg in msgs">
			<p>
				{{ msg.sender_name }} {{ msg.isOwnerOfMsg }} {{ msg.message }} {{ msg.sent_ts?.getDate }} {{
					msg.sent_ts?.getTime }}
			</p>
		</div>

	</div>
</template>

<style>
.Chat {
	position: fixed;
	top: 10px;
	left: 35%;
	right: 35%;
	background-color: antiquewhite;
	height: 90%;
}
</style>
