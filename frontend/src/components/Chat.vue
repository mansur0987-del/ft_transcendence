<script setup lang="ts">
import LeftBar from './LeftBar.vue'
import Logout from './Logout.vue'
import Channels from "./Channels.vue";
import ChannelMsg from './ChannelMsg.vue'
import ChannelUsers from './ChannelUsers.vue'
import { ref } from "vue";

const channelId = ref<number>()
const leave = ref<boolean>(false)

async function FunctionForEmit(GetChannelId: number) {
	channelId.value = GetChannelId
	leave.value = false
}

async function FunctionForEmitLeave() {
	console.log('FunctionForEmitLeave')
	channelId.value = undefined
	leave.value = true
}

</script>

<template>
	<LeftBar />
	<Logout />
	<Channels @GetChannelId="FunctionForEmit" :leave=leave />
	<ChannelMsg :channelId=channelId />
	<ChannelUsers @LeaveChannel="FunctionForEmitLeave" :channelId=channelId />
</template>

<style scoped>
</style>
