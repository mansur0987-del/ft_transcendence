<script setup lang="ts">
import axios from "axios";
import { onMounted, ref, watch } from "vue";
const props = defineProps<{
	channelId?: number
}>()

const sendMsg = ref<string>('')

async function SendMsg(channelId: number | undefined, msg: string) {
	console.log('channelId')
	console.log(channelId)
	console.log('msg')
	console.log(msg)
}

</script>

<template>
	<div class="Chat">
		<h1>Msg in the channel {{ channelId }}</h1>
		<span style="position: absolute; top: 95% " v-if="channelId">
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

.PasswordWindow {
	position: absolute;
	z-index: 99;
	border: none;
	color: rgb(255, 255, 255);
	padding: 100px 80px;
	left: 45%;
	top: 5px;
	text-align: center;
	text-decoration: none;
	display: inline-block;
	font-size: 14px;
	background-color: aliceblue;
}

.PasswordInChat {
	position: absolute;
	z-index: 100;
	top: 30px;
	left: 5px;
}

.JoinPasswordInput {
	position: absolute;
	z-index: 100;
	top: 55px;
	left: 100px;
}

.ClosePasswordInput {
	position: absolute;
	z-index: 100;
	top: 55px;
	left: 5px;
}
</style>
