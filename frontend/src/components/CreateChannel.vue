<script setup lang="ts">
import axios from "axios";
import { ref } from "vue";
const emit = defineEmits<{
	(e: 'CreateChannelWindowIsClose'): void
}>()

const data = ref<{
	chat_name: string,
	isPrivate: boolean
	have_password: Boolean,
	password: string
}>({
	chat_name: "",
	isPrivate: false,
	have_password: false,
	password: ""
})

const error = ref<string>('')

async function Close() {
	emit('CreateChannelWindowIsClose')
}

async function Create() {
	error.value = ''
	if (!data.value.chat_name) {
		error.value = 'Input channel name!!!'
	}
	if (data.value.have_password && !data.value.password) {
		if (error.value) {
			error.value = error.value + '\t Input channel password!!!'
		}
		else {
			error.value = 'Input channel password!!!'
		}
	}
	if (!error.value) {
		console.log('data.value')
		console.log(data.value)
		await axios.post('chat/createChannel', data.value)
		Close()
	}

}




</script>

<template>
	<div class="Window">
		<div class="ChannelName">
			<input v-model="data.chat_name" placeholder="Channel Name">
		</div>
		<div class="PrivatCheckbox">
			<input class='PrivatBool' type="checkbox" value=True v-model="data.isPrivate" /> Is private?
		</div>
		<div class="PasswordCheckbox">
			<input class='PasswordBool' type="checkbox" value=True v-model="data.have_password" /> Add password?
		</div>
		<div class="Password" v-if="data.have_password">
			<input v-model="data.password" placeholder="Channel password">
		</div>
		<div class="Create">
			<button @click="Create()">
				Create
			</button>
		</div>
		<div class="Close">
			<button @click="Close()">
				Close
			</button>
		</div>
		<div class="Error" style="color: red;">
			{{ error }}
		</div>
	</div>
</template>

<style>
.Window {
	position: absolute;
	z-index: 99;
	border: none;
	color: rgb(255, 255, 255);
	padding: 100px 80px;
	left: 45%;
	top: 5px;
	text-align: center;
	text-decoration: none;
	display: inline-block;
	font-size: 14px;
	background-color: aliceblue;
}

.ChannelName {
	position: absolute;
	z-index: 100;
	top: 5px;
	left: 5px;
}

.PrivatCheckbox {
	position: absolute;
	z-index: 100;
	top: 30px;
	left: 5px;
	color: black;
}

.PasswordCheckbox {
	position: absolute;
	z-index: 100;
	top: 55px;
	left: 5px;
	color: black;
}

.Password {
	position: absolute;
	z-index: 100;
	top: 80px;
	left: 5px;
}

.Create {
	position: absolute;
	z-index: 100;
	top: 105px;
	left: 100px;
}

.Close {
	position: absolute;
	z-index: 100;
	top: 105px;
	left: 5px;
}

.Error {
	position: absolute;
	z-index: 100;
	top: 130px;
	left: 5px;
	color: red;
}
</style>
