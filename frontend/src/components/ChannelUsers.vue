<script setup lang="ts">
import axios from "axios";
import { ref, watch } from "vue";
import ChannelWindow from './ChannelWindow.vue'
import { ElInput, ElButton } from 'element-plus'
const props = defineProps<{
	channelId?: number
}>()

const emit = defineEmits<{
	(e: 'LeaveChannel'): void
}>()

const WindowForChannel = ref<{
	isOpen: boolean,
	type: string,
	channelId?: number
}>({ isOpen: false, type: '' });

interface User {
	name?: string
	user_name?: string,
	player_id: number,
	role?: number,
	banned_to_ts: string,
	muted_to_ts: string
	member_flg: number,
	admin_flg: number,
	owner_flg: number
}
const PropsUser = ref<User>()
async function WindowChannel(type: string, user: User) {
	WindowForChannel.value = { isOpen: true, type: type, channelId: actualChannelId.value }
	user.role = user.owner_flg + user.admin_flg + user.member_flg
	PropsUser.value = user
}
async function EmitCloseWindow() {
	await GetUsers()
	WindowForChannel.value = { isOpen: false, type: '' }
}

const actualChannelId = ref<number>()

watch(props, (newProps) => {
	if (newProps.channelId) {
		actualChannelId.value = newProps.channelId
		GetUsers()
	}
	else {
		actualChannelId.value = undefined
	}
})

const users = ref<any>()
const myUser = ref<any>()
const myRole = ref<number>()
const bannedUsers = ref<User[]>()

async function GetUsers() {
	if (actualChannelId.value) {
		await axios.post('/chat/chatInfo', { chat_id: actualChannelId.value }).then((res) => {
			users.value = res.data?.users_info
			myUser.value = res.data?.rigths_of_user
		}).catch((e) => {
			console.log(e)
		})
		myRole.value = myUser.value.owner_flg + myUser.value.admin_flg + myUser.value.member_flg

		if (myRole.value && myRole.value > 1) {
			await axios.post('/chat/getBannedUsers', { chat_id: actualChannelId.value }).then((res) => {
				bannedUsers.value = res.data
			}).catch((e) => {
				console.log(e)
			})
		}

		console.log('bannedUsers.value')
		console.log(bannedUsers.value)

		console.log('user.value')
		console.log(myUser.value)

		console.log('users.value')
		console.log(users.value)
	}
}

async function LeaveChannel() {
	await axios.post('chat/leaveChannel', { chat_id: actualChannelId.value, player_id: myUser.value.id }).catch((e) => {
		console.log(e)
	})
	users.value = undefined
	emit('LeaveChannel')
}

async function UnBanned(userId: number) {
	await axios.post('chat/unbanUser', { chat_id: actualChannelId.value, player_id: userId }).catch((e) => {
		console.log(e)
	})
	GetUsers()
}

const userName = ref<string>('')
const errorMsg = ref<string>('')

async function AddUser() {
	await axios.post('chat/addUser', { chat_id: actualChannelId.value, player_name: userName.value }).catch((e) => {
		console.log(e)
		errorMsg.value = e.response.data.message
	}).then((res: any) => {
		if (res.data) {
			errorMsg.value = ''
		}
	})
	userName.value = ''
	GetUsers()
}

</script>

<template>
	<ChannelWindow :type=WindowForChannel.type :chanelId=WindowForChannel.channelId :myRole=myRole :PropsUser=PropsUser
		v-if="WindowForChannel.isOpen" @ChannelWindowIsClose='EmitCloseWindow' />
	<div class="Users" v-if="channelId">
		<el-button color="yellow" v-show="actualChannelId && !(myUser?.owner_flg)" @click="LeaveChannel()"
			style="position: absolute; right: 0%;">
			Leave
		</el-button>
		<h1>Users {{ channelId }}</h1>
		<div style="position: relative; height: 95%; width: 100%; overflow: auto;">
			<div v-for="(user, index) in users">
				<p>
					<span style="font-size: 21px;">
						{{ user.user_name }}
						<span style="color: blue;">
							{{ user.owner_flg ? 'owner' : user.admin_flg ? 'admin' : 'user' }}
						</span>

					</span>
					<el-button size="small"
						v-show="(myUser.id != user.id) && (myRole === 3 || (myRole === 2 && !user.owner_flg))"
						@click="WindowChannel('change', user)" style="position: absolute; right: 0%;">
						Setting
					</el-button>
				</p>

				<p style="font-size: 18px;">
					{{ user.muted_to_ts !== '0' ? 'muted: ' + user.muted_to_ts + ' day(s)' : '' }}
				</p>
			</div>
			<div class="BannedUsers" v-show="myRole && myRole > 1 && actualChannelId && bannedUsers?.length != 0"
				style="width: 200px">
				<h3> Banned users: </h3>
				<div v-for="(user) in bannedUsers">
					<span style="font-size: 21px;">
						{{ user.name }}
					</span>
					<el-button size="small" @click="UnBanned(user.player_id)" style="position: absolute; right: 0%;">
						UnBan
					</el-button>
					<p style="font-size: 18px;">
						{{ user.banned_to_ts !== '0' ? 'banned: ' + user.banned_to_ts + ' day(s)' : '' }}
					</p>

				</div>
			</div>
			<div class="AddUser" v-show="myRole && myRole > 1 && actualChannelId">
				<h3>Add user </h3>
				<el-input style="width: 80%;" v-model="userName" placeholder="write username" />
				<el-button style="position: absolute; right: 0%;" @click="AddUser()">
					Add
				</el-button>
				<p style=color:red> {{ errorMsg }} </p>
			</div>
		</div>


	</div>
</template>

<style>
.Users {
	position: fixed;
	top: 2%;
	left: 67%;
	width: 22%;
	height: max-content;
	max-height: 95%;
	border-radius: 10px;
	z-index: 1;
	overflow: auto;
}

.Users:after {
	content: "";
	position: fixed;
	background: inherit;
	z-index: -1;
	top: 2%;
	left: 67%;
	width: 22%;
	height: auto;
	max-height: 95%;
	right: 0;
	bottom: 0;
	border-radius: 10px;
	box-shadow: inset 0 10000px 200px rgba(255, 255, 255, .5);
	filter: blur(2px);
	margin: 0px;
	overflow: auto;
}
</style>
