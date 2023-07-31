<script setup lang="ts">
import { ElButton } from 'element-plus'
import type { Socket } from "socket.io-client";
import { onMounted } from "vue";

const props = defineProps<{
	gameSocket: Socket
	code?: string
}>()

async function Exit() {
	if (props.code) {
		props.gameSocket.emit('exitGame', props.code)
	}
	window.location.assign('http://' + window.location.host + '/player')
}

async function checkVisible() {
	if (document.visibilityState !== "visible") {
		if (props.code) {
			props.gameSocket.emit('exitGame', props.code)
		}
		window.location.assign('http://' + window.location.host + '/player')
	}
}

onMounted(() => {
	props.gameSocket.on('exit', () => {
		window.location.assign('http://' + window.location.host + '/player')
	})
	document.addEventListener('visibilitychange', checkVisible)
})

</script>

<template>
	<div class="button">
		<el-button color="#b25252" size="large" plain @click="Exit()">
			Exit
		</el-button>
	</div>
</template>

<style scoped>
.button {
	position: fixed;
	right: 5px;
	top: 5px;
	border: none;
	color: rgb(60, 2, 55);
	padding: 10px 15px;
	text-align: center;
	text-decoration: none;
	display: inline-block;
	font-size: 14px;
	z-index: 50;
}

.button button {
	width: 100px;
	margin-left: auto;
	margin-right: auto;
	border: none;
	padding: 20px 20px;
	text-align: center;
	text-decoration: none;
	display: inline-block;
	font-size: 16px;
	border-radius: 10px;
	height: 55px;
}
</style>
