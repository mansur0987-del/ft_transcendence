<script setup lang="ts">
import axios from "axios";
import { ref, onMounted } from "vue";
import LeftBar from './LeftBar.vue'
import Logout from './Logout.vue'
import { Buffer } from "buffer";
import { useRoute } from 'vue-router';

const route = useRoute();
const name = ref<string>()
const isFirstGame = ref<boolean>()
const isFirstWin = ref<boolean>()
const avatar = ref<any>()
const players = ref<any[]>([])

async function GetUser() {
	let url = 'player/profile/'
	if (route.params.id) {
		url = url + route.params.id;
	}
	await axios.get(url).then((res) => {
		if (!res.data.name) {
			window.location.assign('http://' + window.location.host + '/pathnotfound')
		}
		name.value = res.data.name
		isFirstGame.value = res.data.isFirstGame
		isFirstWin.value = res.data.isFirstWin
		console.log(res)
	}).catch(() => {
		window.location.assign('http://' + window.location.host + '/pathnotfound')
	})

	url = 'player/avatar/'
	if (route.params.id) {
		url = url + route.params.id;
	}
	await axios.get(url, { responseType: 'arraybuffer' }).then((res) => {
		avatar.value = "data:image/*" + ";base64," + Buffer.from(res.data).toString('base64');
	})

	if (!route.params.id) {
		await axios.get('player/getapplycation').then((res) => {
			players.value = res.data.players
		})
	}

}

async function PostApplication(player: any) {
	player.name = ""
	await axios.post('player/sendapplycation', { 'id': player.id })
}

async function RedirectToProfile(player: any) {
	window.location.href = '/player/' + player.id
}

onMounted(() => {
	GetUser()
})

</script>

<template>
	<LeftBar />
	<Logout />
	<img class="Avatar" :src="avatar" />
	<div class="Player">
		<h1>Username: {{ name }}</h1>
		<h1>Achievements:
			<p v-show="isFirstGame === true" style="color: blue;"> You played one or more games</p>
			<p v-show="isFirstWin === true" style="color: green;"> You won one or more games</p>
		</h1>
		<h1 v-if="!route.params.id">Applications:
			<template class="Applications" v-for="player in players">
				<li v-if="player.name !== ''">
					{{ player.name }}
					<button @click="PostApplication(player)">
						Add friend</button>
					<button @click="RedirectToProfile(player)">Get info</button>
				</li>
			</template>
		</h1>
		<h1>stats: </h1>
		<h1>rank: </h1>
	</div>
</template>

<style scoped>
.Avatar {
	position: fixed;
	width: 400px;
	top: 100px;
	left: 50%;
}

.Player {
	position: fixed;
	top: 30%;
	left: 15%;
}

.Player button {
	background-color: greenyellow;
	width: 100px;
	margin-left: auto;
	margin-right: auto;
	border: none;
	color: black;
	padding: 10px 10px;
	text-align: center;
	text-decoration: none;
	display: inline-block;
	font-size: 16px;
	transition: transform 500ms ease;
	border-radius: 10px;
	cursor: pointer;
}

.Player button:hover {
	transform: scale(1.1) translateY(-5px);
}
</style>
