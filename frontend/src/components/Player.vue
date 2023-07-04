<script setup lang="ts">
import axios from "axios";
import { ref, onMounted } from "vue";
import LeftBar from './LeftBar.vue'
import Logout from './Logout.vue'
import { Buffer } from "buffer";
import { useRoute } from 'vue-router';

const id = ref<number>()
const name = ref<string>()
const name42 = ref<string>()
const isFirstGame = ref<boolean>()
const isFirstWin = ref<boolean>()
const avatar = ref<any>()
const players = ref<any[]>([])


const route = useRoute();

async function GetUser() {
	console.log('route.params.id')
	console.log(route.params.id)
	if (!route.params.id) {
		await axios.get('player/profile').then((res) => {
			id.value = res.data.id
			name.value = res.data.name
			name42.value = res.data.name42
			isFirstGame.value = res.data.isFirstGame
			isFirstWin.value = res.data.isFirstWin
		})
	}
	else {
		const url = 'player/profile/' + route.params.id
		await axios.get(url).then((res) => {
			id.value = res.data.id
			name.value = res.data.name
			name42.value = res.data.name42
			isFirstGame.value = res.data.isFirstGame
			isFirstWin.value = res.data.isFirstWin
		})
	}


	await axios.get('player/avatar', { responseType: 'arraybuffer' }).then((res) => {
		avatar.value = "data:image/*" + ";base64," + Buffer.from(res.data).toString('base64');
	})

	await axios.get('player/getapplycation').then((res) => {
		players.value = res.data.players
	})
}

async function PostApplication(player: any) {
	player.name = ""
	await axios.post('player/sendapplycation', { 'id': player.id })
}

onMounted(() => {
	GetUser()
})

</script>

<template>
	<LeftBar />
	<Logout />
	<div class="Player">
		<img :src="avatar" style="width: 124px;" />
		<h1> id: {{ id }}</h1>
		<h1> username: {{ name }}</h1>
		<h1> name 42: {{ name42 }}</h1>
		<h1>Achievements:
			<p v-show="isFirstGame === true" style="color: blue;"> You played one or more games</p>
			<p v-show="isFirstWin === true" style="color: green;"> You won one or more games</p>
		</h1>
		<h1>Applications:
			<template v-for="player in players">
				<li v-if="player.name !== ''">
					{{ player.name }}
					<button @click="PostApplication(player)">
						Add friend</button>
				</li>
			</template>
		</h1>
		<h1>stats: </h1>
		<h1>rank: </h1>
	</div>
</template>

<style scoped>
</style>
