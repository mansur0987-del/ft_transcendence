<script setup lang="ts">
import axios from "axios";
import { ref } from "vue";
const props = defineProps<{
	type: string | undefined;
	chanelId?: number;
}>()
const emit = defineEmits<{
	(e: 'ChannelWindowIsClose'): void
}>()

const data = ref<{
	chat_id?: number,
	chat_name: string,
	isPrivate: boolean
	have_password: Boolean,
	password: string
}>({
	chat_id: props.chanelId,
	chat_name: "",
	isPrivate: false,
	have_password: false,
	password: ""
})

const error = ref<string>('')

async function Close() {
	emit('ChannelWindowIsClose')
}

async function Submit() {
	console.log(props.type)
	error.value = ''
	if (props.type === 'create') {
		if (!data.value.chat_name) {
			error.value = 'Input channel name!!!\n'
		}
		if (data.value.have_password && !data.value.password) {
			error.value = error.value + 'Input channel password!!!\n'
		}
	}
	else if (props.type === 'checkPassword' && !data.value.password) {
		error.value = 'Input channel password!!!\n'
	}
	if (!error.value) {
		if (props.type === 'create') {
			await axios.post('chat/createChannel', data.value).catch((e) => {
				error.value = e.response.data.message
			})
		}
		if (props.type === 'checkPassword') {
			await axios.post('chat/joinToChannel', data.value).catch((e) => {
				error.value = e.response.data.message
			})
		}
	}
	if (!error.value) {
		Close()
	}
}

</script>

<template>
	<div class="Window">
		<div class="CreateWindow" v-if="props.type === 'create'">
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
		</div>
		<div class="CheckPassword" v-if="props.type === 'checkPassword'">
			<div class="Password">
				<input v-model="data.password" placeholder="Channel password">
			</div>
		</div>
		<div class="Footer">
			<p style="width: 160px;">
				<button @click="Close()" style="position: absolute; left: 0%;">
					Close
				</button>
				<button @click="Submit()" style="position: absolute; right: 0%;">
					Submit
				</button>
			</p>
			<p style="color: red; position: relative; top: 20px;">
				{{ error }}
			</p>
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

.CreateWindow {
	position: absolute;
	top: 5px;
	left: 0%;
}

.ChannelName {
	position: relative;
	z-index: 100;
	left: 5px;
}

.PrivatCheckbox {
	position: relative;
	z-index: 100;
	left: 5px;
	color: black;
}

.PasswordCheckbox {
	position: relative;
	z-index: 100;
	left: 5px;
	color: black;
}

.CheckPassword {
	position: absolute;
	top: 5px;
	left: 0%;
}

.Password {
	position: relative;
	z-index: 100;
	left: 5px;
}

.Footer {
	position: absolute;
	top: 150px;
	left: 0%;
}
</style>
