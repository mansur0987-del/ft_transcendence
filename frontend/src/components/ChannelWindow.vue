<script setup lang="ts">
import axios from "axios";
import { ref } from "vue";
import { ElInput, ElButton, ElInputNumber, ElRadioGroup, ElRadioButton } from 'element-plus'
const props = defineProps<{
	type: string | undefined;
	chanelId?: number;
	channelName?: string,
	isPrivate?: boolean,
	have_password?: boolean,
	myRole?: number;
	PropsUser?: User | undefined
	msg?: string
}>()
const emit = defineEmits<{
	(e: 'ChannelWindowIsClose'): void
}>()

interface User {
	user_name?: string,
	player_id: number,
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
	chat_name: props.channelName ? props.channelName : "",
	isPrivate: props.isPrivate ? props.isPrivate : false,
	have_password: props.have_password ? props.have_password : false,
	password: "",
	player_id: props.PropsUser?.player_id,
	isMute: false,
	isUnMute: false,
	isBan: false,
	isUnBan: false,
	isKick: false,
	role: 'No change'
})

const error = ref<string>('')

async function Close() {
	emit('ChannelWindowIsClose')
}

async function Submit() {
	console.log(props.type)
	error.value = ''
	if (props.type === 'create' || props.type === 'settings') {
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
		if (data.value.role === 'Owner') {
			await axios.post('chat/setOwner', { chat_id: data.value.chat_id, player_id: data.value.player_id }).catch((e) => {
				error.value = e.response.data.message
			})
		}
		else if (data.value.role === 'Admin') {
			await axios.post('chat/setAdmin', { chat_id: data.value.chat_id, player_id: data.value.player_id }).catch((e) => {
				error.value = e.response.data.message
			})
		}
		else if (data.value.role === 'User') {
			await axios.post('chat/unsetAdmin', { chat_id: data.value.chat_id, player_id: data.value.player_id }).catch((e) => {
				error.value = e.response.data.message
			})
		}
		if (data.value.isMute) {
			if (!data.value.muteDays) {
				error.value = 'input mute days'
			}
			else if (data.value.muteDays <= 0) {
				error.value = 'input more than 0 days for mute'
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
			else if (data.value.BanDays <= 0) {
				error.value = 'input more than 0 days for mute'
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
		if (props.type === 'settings') {

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
		<div class="CreateWindow" v-if="props.type === 'create' || props.type === 'settings'">
			<div class="ChannelName">
				{{ data.chat_name }}
				<el-input style="width: 210px;" v-model="data.chat_name" placeholder="Channel Name"
					:value="data.chat_name" />
			</div>
			<div class="PrivatCheckbox">
				<input v-model="data.isPrivate" class='PrivatBool' type="checkbox" value=True /> Is private?
			</div>
			<div class="PasswordCheckbox">
				<input class='PasswordBool' type="checkbox" value=True v-model="data.have_password" /> Add password?
			</div>
			<div class="Password" v-if="data.have_password">
				<el-input style="width: 210px;" v-model="data.password" placeholder="Channel password" />
			</div>
		</div>
		<div class="CheckPassword" v-else-if="props.type === 'checkPassword'">
			<div class="Password">
				<el-input style="width: 210px;" v-model="data.password" placeholder="Channel password" />
			</div>
		</div>
		<div class="Change" v-else-if="props.type === 'change'">
			<p style="color: black;">
				Nickname: {{ props.PropsUser?.user_name }}
			</p>
			<div class="ChangeRole" style="color: black;">
				<p>Switch role? </p>
				<el-radio-group v-model="data.role">
					<el-radio-button size="small" label="No change" />
					<p v-if="props.myRole === 3">
						<el-radio-button size="small" label="Owner" />
					</p>
					<el-radio-button size="small" v-if="props.PropsUser?.role !== 2" label="Admin" />
					<el-radio-button size="small" v-if="props.PropsUser?.role !== 1" label="User" />
				</el-radio-group>

			</div>
			<div class="Mute" style="color: black;">
				<p v-if="props.PropsUser?.muted_to_ts !== '0'">
					<input type="checkbox" value=True v-model="data.isUnMute" /> Unmute?
				</p>
				<p v-else>
					<input type="checkbox" value=True v-model="data.isMute" /> Mute?
				</p>
				<p v-if="data.isMute">
					<el-input-number size="small" style="height: 20px; width: 100px;" placeholder="days"
						v-model="data.muteDays" /> How many days?
				</p>
			</div>
			<div class="Ban" style="color: black;">
				<p v-if="props.PropsUser?.banned_to_ts !== '0'">
					<input type="checkbox" value=True v-model="data.isUnBan" /> Unban?
				</p>
				<p v-else>
					<input type="checkbox" value=True v-model="data.isBan" /> Ban?
				</p>
				<p v-if="data.isBan">
					<el-input-number size="small" style="height: 20px; width: 100px;" placeholder=" days"
						v-model="data.BanDays" /> How many days?
				</p>
			</div>
			<div class="Kick" style="color: black;">
				<p>
					<input type="checkbox" value=True v-model="data.isKick" /> Kick?
				</p>
			</div>
		</div>
		<div class="Footer">
			<p style="width: 220px;">
				<el-button size="small" @click="Close()" style="position: absolute; left: 0%;">
					Close
				</el-button>
				<el-button size="small" @click="Submit()" style="position: absolute; right: 0%;">
					Submit
				</el-button>
			</p>
			<p style="color: red; position: relative; top: 22px;">
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
	padding: 130px 110px;
	left: 45%;
	top: 5px;
	text-align: center;
	text-decoration: none;
	display: inline-block;
	font-size: 14px;
	border-radius: 10px;
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
