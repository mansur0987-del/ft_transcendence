<script setup lang="ts">
import axios from "axios";
import LeftBar from './LeftBar.vue'
import Logout from './Logout.vue'
import { ref, onMounted } from "vue";
import { ElButton } from 'element-plus'

interface PlayersShows {
	id: number,
	name: string,
	status: boolean,
	needButton: boolean,
	update_at: Date
}

const players = ref<any>()
const playerId = ref<number>()
const currentDate = ref<Date>(new Date())
const currentDateMinus15Min = ref<Date>(new Date())

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
		if (tmpPlayer) {
			needButton = false
		}
		const newPlayer = {
			id: allPlayers[i].id,
			name: allPlayers[i].name,
			status: allPlayers[i].status,
			update_at: allPlayers[i].update_at,
			needButton: needButton
		}
		validatePlayer.push(newPlayer);
	}
	players.value = validatePlayer

	currentDateMinus15Min.value.setMinutes(currentDate.value.getMinutes() - 15)

}

onMounted(() => {
	GetUsers()
})

async function PostApplication(player: any) {
	player.needButton = false
	await axios.post('player/sendapplycation', { 'id': player.id })
}

async function RedirectToProfile(player: any) {
	window.location.href = '/player/' + player.id
}

const error = ref<{
	msg: string
	player_id?: number
}>({ msg: '' })
async function Chat(player: any) {
	error.value = { msg: '' }
	await axios.post('chat/enterDirectChannel', { player_name: player.name }).catch((e) => {
		error.value = { msg: e.response.data.message, player_id: player.id }
	}).then((res: any) => {
		if (res?.data) {
			window.location.assign('http://' + window.location.host + '/chat/' + res.data.chat_id)
		}
	})

}

</script>

<template>
	<LeftBar />
	<Logout />
	<div class="Players">
		<h1 style="text-align: center;">Players</h1>

		<div class="buttonAddFriend" v-for="player in players" style="list-style-type:square; width: 60%; ">
			<p>
				<span v-if="new Date(player.update_at) > currentDateMinus15Min && player.status === 1"
					style="color: green; font-size: 30px;">
					{{ player.name }}
				</span>
				<span v-else-if="player.status === 2" style="color:orange; font-size: 30px;">
					{{ player.name }}
				</span>
				<span v-else style="color:firebrick; font-size: 30px;">
					{{ player.name }}
				</span>
				<el-button style="position: absolute; right: 16%;" v-if="player.needButton"
					@click="PostApplication(player)">Add
					friend</el-button>
				<el-button style="position: absolute; right: 0%;" v-if="player.id !== playerId"
					@click="RedirectToProfile(player)">Get info</el-button>
				<el-button style="position: absolute; right: 9%;" v-if="player.id !== playerId" @click="Chat(player)">
					Chat </el-button>
				<span style="color: red; position: absolute; right: 30%;" v-if="player.id === error.player_id">
					{{ error.msg }}
				</span>
			</p>
		</div>

	</div>
</template>

<style scoped>
.Players {
	position: fixed;
	top: 5%;
	left: 15%;
	width: 70%;
	height: max-content;
	max-height: 90%;
	border-radius: 10px;
	z-index: 1;
	overflow: auto;
}

.Players:after {
	content: "";
	position: fixed;
	background: inherit;
	z-index: -1;
	top: 5%;
	left: 15%;
	width: 70%;
	height: auto;
	max-height: 90%;
	right: 0;
	bottom: 0;
	border-radius: 10px;
	box-shadow: inset 0 10000px 200px rgba(255, 255, 255, .5);
	filter: blur(2px);
	margin: 0px;
	overflow: auto;
}
</style>
