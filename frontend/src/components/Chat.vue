<script setup lang="ts">
import LeftBar from './LeftBar.vue'
import Logout from './Logout.vue'
import Channels from "./Channels.vue";
import ChannelMsg from './ChannelMsg.vue'
import ChannelUsers from './ChannelUsers.vue'
import { ref, onMounted } from "vue";
import socketChat from '../socketChat'

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

const flag = ref<boolean>(false)
onMounted(async () => {
	if (socketChat) {
		flag.value = true
	}
	console.log('socketChat')
	console.log(socketChat)
})

</script>

<template>
	<LeftBar />
	<Logout />
	<Channels @GetChannelId="FunctionForEmit" :leave=leave :socket=socketChat v-if="flag" />
	<ChannelMsg :channelId=channelId :socket=socketChat v-if="flag" />
	<ChannelUsers @LeaveChannel="FunctionForEmitLeave" :channelId=channelId :socket=socketChat v-if="flag" />
</template>

<style scoped>
</style>
