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
const currentDate = ref<Date>(new Date())
let myRole: number

async function GetUsers() {
	if (actualChannelId.value) {
		await axios.post('/chat/chatInfo', { chat_id: actualChannelId.value }).then((res) => {
			users.value = res.data?.users_info
			myUser.value = res.data?.rigths_of_user
		}).catch((e) => {
			console.log(e)
		})
		myRole = myUser.value.owner_flg + myUser.value.admin_flg + myUser.value.member_flg


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
					<button v-show="(myRole !== 1 && (myUser.id != user.id)) || (myRole === 2 && !user.owner_flg)"
						@click="WindowChannel('change', user)" style="position: absolute; right: 0%;">
						Setting
					</button>
				</p>
				<p>
					{{ new Date(user.banned_to_ts) > currentDate ? 'banned: ' + new Date(user.banned_to_ts) : ''
					}}
				</p>
				<p>
					{{ new Date(user.muted_to_ts) > currentDate ? 'muted: ' + new Date(user.muted_to_ts) : '' }}
				</p>
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
