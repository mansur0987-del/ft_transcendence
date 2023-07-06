<script setup lang="ts">
import axios from "axios";
import LeftBar from './LeftBar.vue'
import Logout from './Logout.vue'
import { ref, onMounted } from "vue";

interface PlayersShows {
	id: number,
	name: string,
	status: boolean,
	needButton: boolean
}

const players = ref<any>()
const playerId = ref<number>()

async function GetUsers() {
	let deleteIdPlayer: number[] = [];
	const data: any = (await axios.get('player/sendapplycation')).data
	playerId.value = data.player.id
	deleteIdPlayer.push(data.player.id)
	const SendApplycation: any = data.players
	for (let i = 0; SendApplycation[i]; i++) {
		deleteIdPlayer.push(SendApplycation[i].id);
	}
	const Friends: any = (await axios.get('player/friends')).data.friends
	for (let i = 0; Friends[i]; i++) {
		deleteIdPlayer.push(Friends[i].id);
	}
	let validatePlayer: PlayersShows[] = []
	const allPlayers = (await axios.get('player/')).data
	for (let i = 0; allPlayers[i]; i++) {
		let needButton = true
		const tmpPlayer = deleteIdPlayer.find(id => id === allPlayers[i].id)
		console.log('tmpPlayer')
		console.log(tmpPlayer)
		if (tmpPlayer) {
			needButton = false
		}
		const newPlayer = {
			id: allPlayers[i].id,
			name: allPlayers[i].name,
			status: allPlayers[i].status,
			needButton: needButton
		}
		validatePlayer.push(newPlayer);
	}
	players.value = validatePlayer
	console.log('players.value')
	console.log(players.value)
}

onMounted(() => {
	GetUsers()
})

async function PostApplication(player: any) {
	player.needButton = false
	await axios.post('player/sendapplycation', { 'id': player.id })
}

async function RedirectToProfile(player: any) {
	window.location.href = '/' + player.id
}


</script>

<template>
	<LeftBar />
	<Logout />
	<div class="Players">
		<h1>Players:
			<div class="buttonAddFriend" v-for="player in players" style="list-style-type:square">
				{{ player.name }} {{ player.id === playerId ? 'Online' : player.status ? 'Online' : 'Offline' }}
				<button v-if="player.needButton" @click="PostApplication(player)">Add
					friend</button>
				<button v-if="player.id !== playerId" @click="RedirectToProfile(player)">Get info</button>
			</div>
		</h1>
	</div>
</template>

<style scoped>
</style>
