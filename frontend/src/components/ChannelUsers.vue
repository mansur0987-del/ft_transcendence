<script setup lang="ts">
import axios from "axios";
import { ref, watch } from "vue";
import ChannelWindow from './ChannelWindow.vue'
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
	user_name: string,
	id: number,
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
const bannedUsers = ref<any>()

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
				bannedUsers.value = res.data?.users_info
			}).catch((e) => {
				console.log(e)
			})
		}


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

</script>

<template>
	<ChannelWindow :type=WindowForChannel.type :chanelId=WindowForChannel.channelId :myRole=myRole :PropsUser=PropsUser
		v-if="WindowForChannel.isOpen" @ChannelWindowIsClose='EmitCloseWindow' />
	<div class="Users">
		<button v-show="actualChannelId && !(myUser?.owner_flg)" @click="LeaveChannel()"
			style="position: absolute; right: 0%;">
			Leave
		</button>
		<h1>Users {{ channelId }}</h1>
		<div style="position: absolute; overflow: scroll; width: 100%">
			<div v-for="(user, index) in users">
				<p>
					<span>
						{{ index + 1 }}
						{{ user.user_name }}
						{{ user.owner_flg ? 'owner' : user.admin_flg ? 'admin' : 'user' }}
					</span>
					<button v-show="(myUser.id != user.id) && (myRole === 3 || (myRole === 2 && !user.owner_flg))"
						@click="WindowChannel('change', user)" style="position: absolute; right: 0%;">
						Setting
					</button>
				</p>

				<p>
					{{ user.muted_to_ts ? 'muted: ' + user.muted_to_ts : '' }}
				</p>
			</div>
			<div class="BannedUsers" v-on="myRole && myRole > 1" v-show="actualChannelId && bannedUsers">
				<h1> Banned users </h1>
				<div v-for="(user, index) in bannedUsers">
					<span>
						{{ index + 1 }}
						{{ user.user_name }}
					</span>
					<p>
						{{ user.banned_to_ts ? 'banned: ' + user.banned_to_ts : '' }}
					</p>
					<button @click="UnBanned(user.id)" style="position: absolute; right: 0%;">
						UnBan
					</button>
				</div>
			</div>

		</div>


	</div>
</template>

<style>
.Users {
	position: fixed;
	top: 10px;
	left: 70%;
	right: 10%;
	background-color: antiquewhite;
	height: 90%;

}
</style>
