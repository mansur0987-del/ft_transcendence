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

async function WindowChannel(type: string, channelId?: number) {
	WindowForChannel.value = { isOpen: true, type: type, channelId: channelId }
}
async function EmitCloseWindow() {
	GetUsers()
	WindowForChannel.value = { isOpen: false, type: '' }
}

const actualChannelId = ref<number>()

watch(props, (newProps) => {
	if (newProps.channelId) {
		actualChannelId.value = newProps.channelId
		GetUsers()
	}
})

const users = ref<any>()
const myUser = ref<any>()
const currentDate = ref<Date>(new Date())

async function GetUsers() {
	if (actualChannelId.value) {
		await axios.post('/chat/chatInfo', { chat_id: actualChannelId.value }).then((res) => {
			users.value = res.data?.users_info
			myUser.value = res.data?.rigths_of_user
		}).catch((e) => {
			console.log(e)
		})
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
	<ChannelWindow :type=WindowForChannel.type :chanelId=WindowForChannel.channelId v-if="WindowForChannel.isOpen"
		@ChannelWindowIsClose='EmitCloseWindow' />
	<div class="Users">
		<button v-show="actualChannelId && !myUser.owner_flg" @click="LeaveChannel()"
			style="position: absolute; right: 0%;">
			Leave
		</button>
		<h1>Users {{ channelId }}</h1>
		<div style="position: absolute; overflow: scroll">
			<div v-for="(user, index) in users">
				<p>
					<span>
						{{ index + 1 }}
						{{ user.user_name }}
						{{ user.owner_flg ? 'owner' : user.admin_flg ? 'admin' : 'user' }}
					</span>
					<button v-show="(myUser.id != user.id) && (myUser.owner_flg || (myUser.admin_flg && !user.owner_flg))"
						@click="WindowChannel('change')" style="position: absolute; right: 0%;">
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
