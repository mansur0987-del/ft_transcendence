<script setup lang="ts">
import axios from "axios";
import { ref, onMounted } from "vue";
import LeftBar from './LeftBar.vue'
import Logout from './Logout.vue'
import { Buffer } from "buffer";
import { useRoute } from 'vue-router';
import { ElButton, ElTable, ElTableColumn, type TableColumnCtx } from 'element-plus'

const route = useRoute();
const id = ref<number>()
const name = ref<string>()
const isFirstGame = ref<boolean>(false)
const isFirstWin = ref<boolean>(false)
const avatar = ref<any>()
const players = ref<any[]>([])

interface MathHistory {
	winnerId: number,
	winnerName: string,
	loserId: string,
	loserName: string,
	winnerScore: number,
	loserScore: number,
	date: Date,
	mode: number
}
const mathHistory = ref<MathHistory[]>([])

interface State {
	rank: number,
	wins: number,
	losses: number
}
const stats = ref<State>()

async function GetUser() {
	let url = 'player/profile/'
	if (route.params.id) {
		url = url + route.params.id;
	}
	await axios.get(url).then((res) => {
		if (!res.data.name) {
			window.location.assign('http://' + window.location.host + '/pathnotfound')
		}
		id.value = res.data.id
		name.value = res.data.name
		isFirstGame.value = res.data.isFirstGame
		isFirstWin.value = res.data.isFirstWin
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

	await axios.get('player/' + id.value + '/stats').then((res) => {
		console.log('stats')
		console.log(res.data)
		stats.value = res.data
	})

	await axios.get('').then((res) => {
		console.log('match history')
		console.log(res.data)
		mathHistory.value = res.data
	})

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

const formatter = (row: MathHistory, column: TableColumnCtx<MathHistory>) => {
	if (row.mode === 0) {
		return ('default')
	}
	else if (row.mode === 1) {
		return ('fast')
	}
	else {
		return ('hardcore')
	}
}

const Length = (length: number) => {
	if (length > 20) {
		return 350
	}
	return (length * 20)
}

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
					<el-button style="position: absolute; right: 12%;" @click="PostApplication(player)">
						Add friend</el-button>
					<el-button style="position: absolute; right: 0%;" @click="RedirectToProfile(player)">Get
						info</el-button>
				</li>
			</template>
		</h1>
		<div class="Stats">
			<h1>stats: </h1>
			<h2 style="padding-left: 15px;">
				rank: {{ stats?.rank }}
			</h2>
			<h2 style="padding-left: 15px;">
				wins: {{ stats?.wins }}
			</h2>
			<h2 style="padding-left: 15px;">
				losses: {{ stats?.losses }}
			</h2>
		</div>
		<div class="MatchHistory">
			<h1>
				Match History:
			</h1>
			<el-table :data="mathHistory" :default-sort="{ prop: 'date', order: 'descending' }"
				:height="Length(mathHistory.length)" style="width: 750px" v-if="mathHistory">
				<el-table-column prop="date" label="Date" width="100" />
				<el-table-column prop="winnerName" label="Winner" width="100" />
				<el-table-column prop="winnerScore" width="50" />
				<el-table-column prop="loserScore" width="50" />
				<el-table-column prop="loserName" label="Loser" width="100" />
				<el-table-column label="Mode" width="100" :formatter="formatter" />
			</el-table>
		</div>

	</div>
</template>

<style scoped>
.Avatar {
	position: fixed;
	width: 250px;
	top: 5%;
	left: 15%;
}


.Player {
	position: fixed;
	top: 5%;
	left: 35%;
	width: 50%;
	height: max-content;
	max-height: 90%;
	border-radius: 10px;
	z-index: 1;
	overflow: auto;
}

.Player:after {
	content: "";
	position: fixed;
	background: inherit;
	z-index: -1;
	top: 5%;
	left: 35%;
	width: 50%;
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
