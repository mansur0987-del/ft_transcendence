<script setup lang="ts">
import axios from "axios";
import LeftBar from './LeftBar.vue'
import Logout from './Logout.vue'
import { ref } from "vue";

const players = ref([])

async function GetUsers() {
	const res: any = (await axios.get('player/')).data
	players.value = res;

}

window.onload = GetUsers

</script>

<template>
	<LeftBar />
	<Logout />
	<div class="Players">
		<h1>Players</h1>
		<li v-for="player in players">
			{{ player.name }} {{ player.status ? 'Online' : 'Offline' }}
		</li>
	</div>
</template>

<style scoped>
</style>
