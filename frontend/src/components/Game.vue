<template>
	<div>
		<LeftBar />
		<Logout />
		<NavBar />
		<div class="flex flex-wrap">
			<Multiplayer v-if="isReady" :gameSocket="gameSocket" :id="id" :mode="mode" />
			<Menu v-else :gameSocket="gameSocket" />
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
	invite: boolean,
	// playerId: number,
}>()


let gameSocket: Socket
const isReady = ref(props.isInvited);
const mode = ref(0);
const id = ref(0);
const playerId = ref(0);

onMounted(async () => {
	gameSocket = await io(process.env.BASE_URL + 'game', {
		transportOptions: {
			polling: { extraHeaders: { Authorization: 'Bearer ' + localStorage.getItem('token') } },
		},
	})
	console.log('gameSocket')
	console.log(gameSocket)
})

watch(props, async (_oldProps, _newProps, cleanUp) => {
	isReady.value = props.invite;
	const cleaner = () => {
		if (gameSocket) {
			gameSocket.off("connect");
			gameSocket.off("info");
			gameSocket.off("room");
			gameSocket.off("add");
			gameSocket.off("disconnect");
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
