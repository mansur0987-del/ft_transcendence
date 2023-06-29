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
	const res: any = (await axios.get('player/profile')).data
	id.value = res.id
	name.value = res.name
	name42.value = res.name42
	const data = (await axios.get('player/avatar', { responseType: 'arraybuffer' })).data
	avatar.value = "data:image/*" + ";base64," + Buffer.from(data).toString('base64');


	console.log(res)
	//id.value = res.data["result"]

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
