<script setup lang="ts">
import axios from "axios";
import { ref } from "vue";
const props = defineProps<{
	type: string | undefined;
	chanelId?: number;
	myRole?: number;
	PropsUser?: User | undefined
	msg?: string
}>()
const emit = defineEmits<{
	(e: 'ChannelWindowIsClose'): void
}>()

interface User {
	user_name: string,
	id: number,
	role?: number,
	banned_to_ts: string,
	muted_to_ts: string
}

const data = ref<{
	chat_id?: number,
	chat_name: string,
	isPrivate: boolean
	have_password: Boolean,
	password: string
	player_id?: number
	role?: string
	isMute: boolean
	muteDays?: number
	isUnMute: boolean
	isBan: boolean
	BanDays?: number
	isUnBan: boolean
	isKick: boolean
}>({
	chat_id: props.chanelId,
	chat_name: "",
	isPrivate: false,
	have_password: false,
	password: "",
	player_id: props.PropsUser?.id,
	isMute: false,
	isUnMute: false,
	isBan: false,
	isUnBan: false,
	isKick: false
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
	else if (props.type === 'change') {
		console.log('data.value.role')
		console.log(data.value.role)
		if (data.value.role === '3') {
			console.log('111111')
			await axios.post('chat/setOwner', { chat_id: data.value.chat_id, player_id: data.value.player_id }).catch((e) => {
				error.value = e.response.data.message
			})
		}
		else if (data.value.role === '2') {
			await axios.post('chat/setAdmin', { chat_id: data.value.chat_id, player_id: data.value.player_id }).catch((e) => {
				error.value = e.response.data.message
			})
		}
		else if (data.value.role === '1') {
			await axios.post('chat/unsetAdmin', { chat_id: data.value.chat_id, player_id: data.value.player_id }).catch((e) => {
				error.value = e.response.data.message
			})
		}
		if (data.value.isMute) {
			if (!data.value.muteDays) {
				error.value = 'input mute days'
			}
			else {
				await axios.post('chat/muteUser', { chat_id: data.value.chat_id, player_id: data.value.player_id, days: data.value.muteDays }).catch((e) => {
					error.value = e.response.data.message
				})
			}
		}
		else if (data.value.isUnMute) {
			await axios.post('chat/unmuteUser', { chat_id: data.value.chat_id, player_id: data.value.player_id }).catch((e) => {
				error.value = e.response.data.message
			})
		}
		if (data.value.isBan) {
			if (!data.value.BanDays) {
				error.value = 'input ban days'
			}
			else {
				await axios.post('chat/banUser', { chat_id: data.value.chat_id, player_id: data.value.player_id, days: data.value.BanDays }).catch((e) => {
					error.value = e.response.data.message
				})
			}
		}
		else if (data.value.isUnBan) {
			await axios.post('chat/unbanUser', { chat_id: data.value.chat_id, player_id: data.value.player_id }).catch((e) => {
				error.value = e.response.data.message
			})
		}
		if (data.value.isKick) {
			await axios.post('chat/kickUser', { chat_id: data.value.chat_id, player_id: data.value.player_id }).catch((e) => {
				error.value = e.response.data.message
			})
		}
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
		<div class="Msg" v-if="props.type === 'msg'">
			<h3 style="color: red;"> {{ msg }} </h3>
		</div>
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
		<div class="CheckPassword" v-else-if="props.type === 'checkPassword'">
			<div class="Password">
				<input v-model="data.password" placeholder="Channel password">
			</div>
		</div>
		<div class="Change" v-else-if="props.type === 'change'">
			<p style="color: black;">
				Nickname: {{ props.PropsUser?.user_name }}
			</p>
			<div class="ChangeRole" style="color: black;">
				<p>Switch role? </p>
				<input type="radio" name="role" v-model="data.role" value='0' checked> No change
				<p v-if="props.myRole === 3">
					<input type="radio" name="role" v-model="data.role" value='3'> Owner
				</p>
				<p>
					<input v-if="props.PropsUser?.role !== 2" type="radio" name="role" v-model="data.role" value='2'> <span
						v-if="props.PropsUser?.role !== 2">Admin</span>
				</p>
				<p>
					<input v-if="props.PropsUser?.role !== 1" type="radio" name="role" v-model="data.role" value='1'> <span
						v-if="props.PropsUser?.role !== 3">User</span>
				</p>
			</div>
			<div class="Mute" style="color: black;">
				<p v-if="props.PropsUser?.muted_to_ts">
					<input type="checkbox" value=True v-model="data.isUnMute"> Unmute?
				</p>
				<p v-else>
					<input type="checkbox" value=True v-model="data.isMute"> Mute?
				</p>
				<p v-if="data.isMute">
					<input type="number" placeholder="days" v-model="data.muteDays"> How many days?
				</p>
			</div>
			<div class="Ban" style="color: black;">
				<p v-if="props.PropsUser?.banned_to_ts">
					<input type="checkbox" value=True v-model="data.isUnBan"> Unban?
				</p>
				<p v-else>
					<input type="checkbox" value=True v-model="data.isBan"> Ban?
				</p>
				<p v-if="data.isBan">
					<input type="number" placeholder="days" v-model="data.BanDays"> How many days?
				</p>
			</div>
			<div class="Kick" style="color: black;">
				<p>
					<input type="checkbox" value=True v-model="data.isKick"> Kick?
				</p>
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
	padding: 130px 80px;
	left: 45%;
	top: 5px;
	text-align: center;
	text-decoration: none;
	display: inline-block;
	font-size: 14px;
	background-color: aliceblue;
}

.Msg {
	position: absolute;
	top: 5px;
	left: 0%;
	width: 100%;
}

.CreateWindow {
	position: absolute;
	top: 5px;
	left: 0%;
}

.Change {
	position: absolute;
	top: 5px;
	left: 0%;
	width: 100%;
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
	top: 210px;
	left: 0%;
}
</style>
