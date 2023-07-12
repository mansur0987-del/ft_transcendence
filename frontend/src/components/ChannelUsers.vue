<script setup lang="ts">
import axios from "axios";
import { ref, watch } from "vue";
import ChannelWindow from './ChannelWindow.vue'
const props = defineProps<{
	channelId?: number
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

		const tmp = Date(myUser.value.banned_to_ts) - new Date()
		console.log(tmp)
	}

}

</script>

<template>
	<ChannelWindow :type=WindowForChannel.type :chanelId=WindowForChannel.channelId v-if="WindowForChannel.isOpen"
		@ChannelWindowIsClose='EmitCloseWindow' />
	<div class="Users">
		<h1>Users in the channel {{ channelId }}</h1>
		<div v-for="user in users">
			<p>
				<span>
					{{ user.user_name }}
					{{ user.owner_flg ? 'owner' : user.admin_flg ? 'admin' : 'user' }}
				</span>
			</p>
			<p>
				<span>
					{{ user.banned_to_ts !== '1970-01-01T00:00:00.000Z' ? 'banned: ' + new Date(user.banned_to_ts) :
						'' }}
					{{ user.muted_to_ts !== '1970-01-01T00:00:00.000Z' ? 'muted: ' + new Date(user.muted_to_ts) : ''
					}}
				</span>

			</p>
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
