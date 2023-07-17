<script setup lang="ts">
import axios from "axios";
import { onMounted, ref, watch } from "vue";
import { io, Socket } from 'socket.io-client';
import { ElInput, ElButton } from 'element-plus'
const props = defineProps<{
	channelId?: number,
	socket?: Socket
}>()

const sendMsg = ref<string>('')
const actualChannel = ref<number>()

async function SendMsg(channelId: number | undefined, msg: string) {
	//
	//await axios.post('chat/sendMessage', { chat_id: channelId, message: msg }).catch((e) => {
	//	console.log(e)
	//}).then(() => {
	//	sendMsg.value = ''
	//})
	//if (channelId) {
	//	GetMsg(channelId)
	//}
	socket.emit('msgToServer', { chat_id: channelId, message: msg })
	sendMsg.value = ''
	console.log('msgToServer')
}

interface Msg {
	player_id?: number,
	sender_name?: string,
	isOwnerOfMsg?: boolean,
	message?: string,
	sent_ts: string,
}
const msgs = ref<Msg[]>()

async function GetMsg() {
	socket.on('msgFromServer', (res) => {
		console.log('connect socket')
		console.log('res')
		console.log(res)
	})
	//await axios.post('chat/GetChatMessages', { chat_id: channelId }).catch((e) => {
	//	console.log(e)
	//}).then((res: any) => {
	//	msgs.value = res.data
	//})
}

async function ConnectChannel(channelId: number) {
	socket.emit('connectToChat', { chat_id: channelId })
	console.log('msgToServer')

	await GetMsg()
}
let socket: Socket
onMounted(async () => {
	if (props.channelId) {
		actualChannel.value = props.channelId;
		await ConnectChannel(actualChannel.value)
	}
})

watch(props, async (newProps) => {
	if (!newProps.channelId) {
		actualChannel.value = undefined
		if (socket?.hasListeners('connectToChat')) {
			socket.off('connectToChat')
		}
	}
	else if (newProps.channelId) {
		if (newProps.socket) {
			socket = newProps.socket
		}
		console.log('socketMsg')
		console.log(socket)
		if (socket.hasListeners('connectToChat')) {
			console.log('connectToChat = true')

			socket.off('connectToChat')
		}
		actualChannel.value = newProps.channelId
		await ConnectChannel(actualChannel.value)
	}
})



</script>

<template>
	<div class="Chat" v-if="channelId">
		<h1>Msg in the channel {{ channelId }}</h1>
		<div class="Msgs" v-for="msg in msgs">
			<p>
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
		<p style="position: fixed; top: 95%; width: 30%;" v-show="channelId">
			<el-input style="width: 85%;" type="text" v-model="sendMsg" placeholder="write msg" />
			<el-button @click="SendMsg(channelId, sendMsg)">
				Send
			</el-button>
		</p>


	</div>
</template>

<style>
.Chat {
	position: fixed;
	top: 2%;
	left: 35%;
	width: 30%;
	height: max-content;
	max-height: 95%;
	border-radius: 10px;
	z-index: 1;
	overflow: auto;
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
	max-height: 95%;
	right: 0;
	bottom: 0;
	border-radius: 10px;
	box-shadow: inset 0 10000px 200px rgba(255, 255, 255, .5);
	filter: blur(2px);
	margin: 0px;
	overflow: auto;
}
</style>
