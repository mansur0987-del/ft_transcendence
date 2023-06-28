<script setup lang="ts">
import axios from "axios";
import { ref } from "vue";
import LeftBar from './LeftBar.vue'
import Logout from './Logout.vue'

const id = ref<number>()
const name = ref<string>()
const name42 = ref<string>()
const avatar = ref<any>()

async function GetUser() {
	const res: any = (await axios.get('player/profile')).data
	id.value = res.id
	name.value = res.name
	name42.value = res.name42
	avatar.value = (await axios.get('player/avatar')).data

	console.log(res)
	console.log(avatar.value)
	//id.value = res.data["result"]

}

window.onload = GetUser

</script>

<template>
	<LeftBar />
	<Logout />
	<div class="Player">
		<h1> {{ id }}</h1>
		<h1> {{ name }}</h1>
		<h1> {{ name42 }}</h1>
		<img src="avatar" />
	</div>
</template>

<style scoped>
</style>
