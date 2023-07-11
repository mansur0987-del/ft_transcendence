<script setup lang="ts">
import { ref } from "vue";
const props = defineProps<{
	channelId: number
}>()

const sendMsg = ref<string>('')

async function SendMsg(channelId: number, msg: string) {
	console.log('channelId')
	console.log(channelId)
	console.log('msg')
	console.log(msg)
}

</script>

<template>
	<div class="Chat">
		<h1>Msg in the channel {{ channelId }}</h1>

		<span v-if="channelId" style="position: absolute; top: 95%">
			<input type="text" v-model="sendMsg" placeholder="write msg" style="width: 390px;">
			<button @click="SendMsg(channelId, sendMsg)">
				Send
			</button>

		</span>

	</div>
</template>

<style>
.Chat {
	position: absolute;
	top: 10px;
	left: 35%;
	right: 35%;
	background-color: antiquewhite;
	height: 90%;

}
</style>
