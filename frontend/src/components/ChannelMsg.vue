<script setup lang="ts">
import axios from "axios";
import { onMounted, ref, watch } from "vue";
import { socket } from '@/socket'
const props = defineProps<{
	channelId?: number
}>()

const sendMsg = ref<string>('')
const actualChannel = ref<number>()

async function SendMsg(channelId: number | undefined, msg: string) {
	console.log('channelId')
	console.log(channelId)
	console.log('msg')
	console.log(msg)
	socket.emit('SendMsg', channelId, msg, () => {
		console.log('emit SendMsg')
	})
	//await axios.post('chat/sendMessage', { chat_id: channelId, message: msg }).catch((e) => {
	//	console.log(e)
	//}).then(() => {
	//	sendMsg.value = ''
	//})
	//if (channelId) {
	//	GetMsg(channelId)
	//}
	socket.on('msgToClient', (res) => {
		console.log('1111')
		console.log(res)
	})
}

interface Msg {
	player_id?: number,
	sender_name?: string,
	isOwnerOfMsg?: boolean,
	message?: string,
	sent_ts: string,
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
		actualChannel.value = newProps.channelId
		GetMsg(actualChannel.value)
	}
	else {
		actualChannel.value = undefined
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
				<span style="color: blue;">
					{{ msg.sender_name }}

				</span>
				{{ msg.message }}
				<span style="color: rgb(251, 56, 241); position: relative; right: %0;">
					<span>
						{{ (new Date(msg.sent_ts)).getHours() }}:
						{{ (new Date(msg.sent_ts)).getMinutes() }}:{{ (new Date(msg.sent_ts)).getSeconds() }}
					</span>
					<span>
						{{ (new Date(msg.sent_ts)).getDate() }}.{{ (new Date(msg.sent_ts)).getMonth() + 1 }}
					</span>

				</span>

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
