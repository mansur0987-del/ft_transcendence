<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import gameSocket from '../socketGame'
import Multiplayer from "./Multiplayer.vue"
import Menu from './Menu.vue'
import ExitGame from './ExitGame.vue'
import axios from "axios";
import { ElProgress } from 'element-plus'
import { useRoute } from "vue-router";


const myUser = ref<{
	id: number,
	name: string
}>()

const RoomInfo = ref<{
	id: string,
	firstPlayerId: number,
	firstPlayerName: string,
	secondPlayerId: number,
	secondPlayerName: string,
	mode: number
}>()

const currentPlayerIndex = ref<number>(0);

const hasStarted = ref<boolean>(false);

async function EmitSearchingPlayer() {
	gameSocket.emit('add')
}

const room = ref<string>('')
async function GetRoom() {
	gameSocket.on('room', (data) => {
		room.value = data
		window.history.pushState(
			'http://' + window.location.host + '/game/' + room.value,
			'http://' + window.location.host + '/game/',
			'http://' + window.location.host + '/game/' + room.value
		)
	})
}

async function EmitGetRoomInfo() {
	gameSocket.emit('roomInfo', room.value)
}

async function OnGetRoomInfo() {
	gameSocket.on('roomInfoServer', (data) => {
		if (data.error) {
			room.value = ''
			window.history.pushState(
				'http://' + window.location.host + '/game' + room.value,
				'http://' + window.location.host + '/game',
				'http://' + window.location.host + '/game' + room.value
			)
		}
		else {
			RoomInfo.value = data
		}
	})
}

async function EmitJoinRoom() {
	gameSocket.emit('join-room', room.value)
}

const route = useRoute();
onMounted(async () => {
	await axios.post('player/profile', { updateData: { status: 2 } })
	await axios.get('player/profile').catch((e) => {
		console.log(e)
	}).then((res) => {
		if (res) {
			myUser.value = res.data
		}
	})

	setTimeout(async () => {
		if (route.params.id) {
			room.value = route.params.id.toString()
			await EmitJoinRoom()
		}
		else {
			await EmitSearchingPlayer()
			await GetRoom()
		}

	}, 100);
})

async function letsplay() {
	if (RoomInfo.value?.firstPlayerId === myUser.value?.id) {
		currentPlayerIndex.value = 0;
	}
	else {
		currentPlayerIndex.value = 1;
	}
	hasStarted.value = true;
	gameSocket.emit('ready', { mode: RoomInfo.value?.mode });
	gameSocket.emit('start');
}

watch(room, async (newRoom) => {
	if (newRoom) {
		room.value = newRoom
		await EmitGetRoomInfo()
		await OnGetRoomInfo()
	}
	else {
		await EmitSearchingPlayer()
		await GetRoom()
	}
})


</script>

<template>
	<div>
		<ExitGame v-if="gameSocket" :gameSocket='gameSocket' :code="RoomInfo?.id" />
		<div class="Users" v-if="!hasStarted">
			<h1>
				Users:
			</h1>
			<div v-if="!RoomInfo">
				<h2 style="color: blue;">
					{{ myUser?.id }} {{ myUser?.name }}
				</h2>
				<h2 v-if="!RoomInfo" style="padding: 5%;">
					<el-progress :percentage="100" text-inside :indeterminate="true" :duration="2" color="grey" />
				</h2>
			</div>
			<div v-else>
				<h2 style="color: blue;">
					{{ RoomInfo.firstPlayerId }} {{ RoomInfo.firstPlayerName }}
				</h2>
				<h2 style="color: blue;">
					{{ RoomInfo.secondPlayerId }} {{ RoomInfo.secondPlayerName }}
				</h2>
			</div>
		</div>
		<div v-if="RoomInfo && !hasStarted">
			<Menu @letsplay="letsplay" :gameSocket="gameSocket" :mode="RoomInfo?.mode" :code="RoomInfo?.id" />
		</div>
		<div class="canvas-container" v-if="RoomInfo && hasStarted">
			<Multiplayer :gameSocket="gameSocket" :roomInfo="RoomInfo" :currentPlayerIndex="currentPlayerIndex" />
		</div>
	</div>
</template>

<style>
.Users {
	position: fixed;
	top: 2%;
	left: 1%;
	width: 22%;
	height: max-content;
	max-height: 95%;
	height: 95%;
	border-radius: 10px;
	z-index: 1;
	overflow: auto;
}

.Users:after {
	content: "";
	position: fixed;
	background: inherit;
	z-index: -1;
	top: 2%;
	left: 1%;
	width: 22%;
	height: 95%;
	max-height: 95%;
	right: 0;
	bottom: 0;
	border-radius: 10px;
	box-shadow: inset 0 10000px 200px rgba(255, 255, 255, 0.45);
	filter: blur(2px);
	margin: 0px;
	overflow: auto;
}


.canvas-container {
	position: relative;
}
</style>
