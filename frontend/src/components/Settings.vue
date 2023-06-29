<script setup lang="ts">
import axios from "axios";
import { ref } from "vue";
import LeftBar from './LeftBar.vue'
import Logout from './Logout.vue'

const error = ref<string>()
const newName = ref<string>()
const file = ref<string>()
const input_file = ref<object>();
const error_2 = ref<string>()

async function ChangeName(newName: string) {
	await axios.post('player/profile/rename', { "newName": newName })
		.then(() => {
			error.value = "SUCCESS!!"
		}).catch((res) => {
			error.value = res.response.data.message;
		})
}

async function submitFile() {
	let formData = new FormData();
	formData.append('file', file.value);
	axios.post(
		'player/avatar',
		formData, {
		headers: {
			'Content-Type': 'multipart/form-data'
		}
	}
	).then(function () {
		error_2.value = 'SUCCESS!!'
	}).catch(function () {
		error_2.value = 'FAILURE!!';
	});
}
async function handleFileUpload() {
	file.value = input_file.value.files[0];
}
</script>

<template>
	<LeftBar />
	<Logout />
	<div class="Settings">
		<h1>New name:
			<input v-model="newName" placeholder="write new name" />
			<button @click="ChangeName(newName)">
				Change name
			</button>
			<p style=color:red>{{ error }} </p>
		</h1>
		<h1>
			<label>Change avatar:
				<input type="file" id="file" ref="input_file" v-on:change="handleFileUpload()" />
			</label>
			<button v-on:click="submitFile()">Submit</button>
			<p style=color:red>{{ error_2 }} </p>
		</h1>
	</div>
</template>

<style scoped>
</style>
