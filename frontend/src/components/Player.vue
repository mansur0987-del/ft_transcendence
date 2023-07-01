<script setup lang="ts">
import axios from "axios";
import { ref } from "vue";
import LeftBar from './LeftBar.vue'
import Logout from './Logout.vue'
import { Buffer } from "buffer";

const id = ref<number>()
const name = ref<string>()
const name42 = ref<string>()
const avatar = ref<any>()

async function GetUser() {
	await axios.get('player/profile').then((res) => {
		id.value = res.data.id
		name.value = res.data.name
		name42.value = res.data.name42
	})

	await axios.get('player/avatar', { responseType: 'arraybuffer' }).then((res) => {
		avatar.value = "data:image/*" + ";base64," + Buffer.from(res.data).toString('base64');
	})
}

window.onload = GetUser

</script>

<template>
	<LeftBar />
	<Logout />
	<div class="Player">
		<img :src="avatar" style="width: 124px;" />
		<h1> id: {{ id }}</h1>
		<h1> username: {{ name }}</h1>
		<h1> name 42: {{ name42 }}</h1>
		<h1>stats: </h1>
		<h1>rank: </h1>
	</div>
</template>

<style scoped>
</style>
