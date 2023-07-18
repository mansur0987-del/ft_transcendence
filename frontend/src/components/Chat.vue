<script setup lang="ts">
import LeftBar from './LeftBar.vue'
import Logout from './Logout.vue'
import Channels from "./Channels.vue";
import ChannelMsg from './ChannelMsg.vue'
import ChannelUsers from './ChannelUsers.vue'
import { ref, onMounted } from "vue";
import { io, Socket } from 'socket.io-client';

const channelId = ref<number>()
const leave = ref<boolean>(false)

async function FunctionForEmit(GetChannelId?: number) {
	channelId.value = GetChannelId
	leave.value = false
}

async function FunctionForEmitLeave() {
	channelId.value = undefined
	leave.value = true
}

let socket: Socket
onMounted(() => {
	socket = io(process.env.BASE_URL + 'chat', {
		transportOptions: {
			polling: { extraHeaders: { Authorization: 'Bearer ' + localStorage.getItem('token') } },
		},
	})
	console.log('socket')
	console.log(socket)
	socket.on('callBack', async (res) => {
		console.log('get signal')
		console.log('SocketRes')
		console.log(res)
	})
})

</script>

<template>
	<LeftBar />
	<Logout />
	<Channels @GetChannelId="FunctionForEmit" :leave=leave :socket=socket />
	<ChannelMsg :channelId=channelId :socket=socket />
	<ChannelUsers @LeaveChannel="FunctionForEmitLeave" :channelId=channelId :socket=socket />
</template>

<style scoped>
</style>
