<template>
	<div>
		<LeftBar />
		<Logout />
		<div class="canvas-container">
			<Multiplayer v-if="isReady && isSocket" :gameSocket="gameSocket" :id="id" :mode="mode" />
			<Menu v-if="!isReady && isSocket" :gameSocket="gameSocket" :id="id" :mode="mode" />
			<Pong v-if="isReady && isSocket" :gameSocket="gameSocket" :id="id" :playerId="playerId" :mode="mode" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { Socket } from "socket.io-client";
import { onMounted, onUnmounted, ref } from "vue";
import { watch } from "vue";
import { io } from 'socket.io-client';
import LeftBar from './LeftBar.vue'
import Logout from './Logout.vue'
import Multiplayer from "./Multiplayer.vue"
import Menu from './Menu.vue'
import Pong from './Pong.vue'


const props = defineProps<{
	isInvited: boolean,
	// invite: boolean,
	// playerId: number,
}>()


let gameSocket: Socket
const isReady = ref(props.isInvited);
const isSocket = ref(false);
const mode = ref(0);
const id = ref(0);
const playerId = ref(0);

onMounted(async () => {
	console.log('process.env.BASE_URL')
	console.log(process.env.BASE_URL)
	gameSocket = await io(process.env.BASE_URL + 'pong', {
		transportOptions: {
			polling: { extraHeaders: { Authorization: 'Bearer ' + localStorage.getItem('token') } },
		},
	})
	if (gameSocket) {
		isSocket.value = true;
		console.log('gameSocket')
		console.log(gameSocket)
	}
})

watch(props, async (_oldProps, _newProps, cleanUp) => {
	isReady.value = true;
	const cleaner = () => {
		if (gameSocket) {
			console.log('OFF_1')
			gameSocket.off("connect");
			gameSocket.off("info");
			gameSocket.off("room");
			gameSocket.off("add");
			gameSocket.off("disconnect");
			console.log('OFF_2')
		}
	};
	gameSocket.on('connect', () => {
		console.log('Game Socket connection established!');
	});
	if (gameSocket) {
		gameSocket.on("room", (data) => {
			console.log("Received a message from the backend room code:", data);
			isReady.value = true;
		});

		gameSocket.on("add", (data) => {
			console.log("Socket add: ", data);
			playerId.value = data - 1;
		});
	}
	cleanUp(cleaner);
});

</script>

<style>
.canvas-container {
	position: relative;
}

canvas {
	position: absolute;
	top: 0;
	left: 0;
}
</style>