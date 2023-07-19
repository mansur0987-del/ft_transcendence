<script setup lang="ts">
import axios from "axios";
import { onMounted, ref, watch } from "vue";
import { Socket } from 'socket.io-client';
import { ElInput, ElButton } from 'element-plus'
const props = defineProps<{
	channelId?: number,
	socket?: Socket
}>()

const sendMsg = ref<string>('')
const actualChannel = ref<number>()
const error = ref<string>('')
async function SendMsg(channelId: number | undefined, msg: string) {
	error.value = ''
	if (msg) {
		socket?.emit('msgToServer', { chat_id: channelId, message: msg })
		sendMsg.value = ''
	}
}

interface Msg {
	player_id?: number,
	sender_name?: string,
	isOwnerOfMsg?: boolean,
	message?: string,
	sent_ts: string,
}
interface GetMsgSocket {
	sender_name?: string,
	message?: string,
	error?: string
}

const WindowForChannel = ref<{
	isOpen: boolean,
	type: string,
}>({ isOpen: false, type: '' });

async function WindowChannel(type: string) {
	WindowForChannel.value = { isOpen: true, type: type }
}

async function EmitCloseWindow(str: any) {
	WindowForChannel.value = { isOpen: false, type: '' }
}

const msgs = ref<Msg[]>()
let errorMsg: string
async function GetMsg(channelId: number) {
	errorMsg = ''
	await axios.post('chat/GetChatMessages', { chat_id: channelId }).catch((e) => {
		errorMsg = e.response.data.message
		WindowChannel('msg')
	}).then((res: any) => {
		msgs.value = res.data
	})
	const document_chat = document.body.getElementsByClassName('Chat')
	const elemet_chat = document_chat[0]
	elemet_chat.scrollTop = elemet_chat.scrollHeight
	socket?.on('msgFromServer', (res: GetMsgSocket) => {
		error.value = ''
		console.log('res')
		console.log(res.error)
		if (res.error) {
			error.value = res.error
		}
		else {
			const currentDate = (new Date()).toISOString()
			msgs.value?.push({ sender_name: res.sender_name, message: res.message, sent_ts: currentDate })
			setTimeout(() => {
				elemet_chat.scrollTop = elemet_chat.scrollHeight + 20
			}, 100)
		}
	})
}

let socket: Socket
async function ConnectChannel(channelId: number) {
	socket?.emit('connectToChat', { chat_id: channelId })
	await GetMsg(channelId)
}

const key = ref<string>()
async function keyFunc(e: any) {
	if (e.code === 'Enter') {
		SendMsg(actualChannel.value, sendMsg.value)
	}
}

onMounted(async () => {
	document.addEventListener('keydown', keyFunc)
	if (props.channelId) {
		actualChannel.value = props.channelId;
		await ConnectChannel(actualChannel.value)
	}
})

watch(props, async (newProps) => {
	if (!newProps.channelId) {
		actualChannel.value = undefined
		socket?.off('msgFromServer')
	}
	else if (newProps.channelId) {
		if (newProps.socket) {
			socket = newProps.socket
		}
		socket?.off('msgFromServer')
		actualChannel.value = newProps.channelId
		await ConnectChannel(actualChannel.value)
	}
})

</script>

<template>
	<ChannelWindow :type=WindowForChannel.type :msg=errorMsg v-if="WindowForChannel.isOpen"
		@ChannelWindowIsClose='EmitCloseWindow' />
	<div class="Chat" v-if="channelId">
		<h2>Msg in the channel {{ channelId }}</h2>
		<div class="Msgs" v-for="msg in msgs">
			<p style="width: 75%; word-wrap: break-word;">
				<span style="color: blue;">
					{{ msg.sender_name }}:

				</span>
				{{ msg.message }}
				<span style="color:red; position: absolute; right: 0px;">
					<span>
						{{ (new Date(msg.sent_ts)).getHours() }}:{{ (new Date(msg.sent_ts)).getMinutes() }}:{{ (new
							Date(msg.sent_ts)).getSeconds() }}
					</span>
					<span style="padding-left: 5px;">
						{{ (new Date(msg.sent_ts)).getDate() }}.{{ (new Date(msg.sent_ts)).getMonth() + 1 }}
					</span>

				</span>
			</p>
		</div>
	</div>
	<p style="position: fixed; top: 90%; width: 30%;left: 35%" v-show="channelId">
		<el-input style="width: 80%;" type="text" v-model="sendMsg" placeholder="write msg" />
		<el-button @click="SendMsg(channelId, sendMsg)" style="position: absolute; right: 0%;">
			Send
		</el-button>
	</p>
	<p style="position: fixed; top: 95%; width: 30%; right: 30%; color: red;">
		{{ error }}
	</p>
</template>

<style>
.Chat {
	position: fixed;
	top: 2%;
	left: 35%;
	width: 30%;
	height: max-content;
	max-height: 85%;
	border-radius: 10px;
	z-index: 1;
	overflow: auto;
	scroll-margin-top: 0;
	scroll-padding-top: 0;
}

.Chat:after {
	content: "";
	position: fixed;
	background: inherit;
	z-index: -1;
	top: 2%;
	left: 35%;
	width: 30%;
	height: auto;
	max-height: 85%;
	right: 0;
	bottom: 0;
	border-radius: 10px;
	box-shadow: inset 0 10000px 200px rgba(255, 255, 255, .5);
	filter: blur(2px);
	margin: 0px;
	overflow: auto;
	scroll-margin-top: 0;
	scroll-padding-top: 0;
}
</style>
