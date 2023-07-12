<script setup lang="ts">
import LeftBar from './LeftBar.vue'
import Logout from './Logout.vue'
import Channels from "./Channels.vue";
import ChannelMsg from './ChannelMsg.vue'
import ChannelUsers from './ChannelUsers.vue'
import { ref } from "vue";

const channelId = ref<number>()

async function FunctionForEmit(GetChannelId: number) {
	channelId.value = GetChannelId
}

async function FunctionForEmitLeave() {
	channelId.value = undefined
}

</script>

<template>
	<LeftBar />
	<Logout />
	<Channels @GetChannelId="FunctionForEmit" />
	<ChannelMsg :channelId=channelId />
	<ChannelUsers @LeaveChannel="FunctionForEmitLeave" :channelId=channelId />
</template>

<style scoped>
</style>
