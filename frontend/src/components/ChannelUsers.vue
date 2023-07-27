<script setup lang="ts">
import axios from "axios";
import { onMounted, ref, watch } from "vue";
import { Socket } from 'socket.io-client';
import ChannelWindow from './ChannelWindow.vue'
import { Store } from "../pinia";
import { ElInput, ElButton, ElDropdown, ElDropdownItem, ElDropdownMenu } from 'element-plus'
import { storeToRefs } from "pinia";
const props = defineProps<{
	channelId?: number,
	socket: Socket
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
	owner_flg: number,
	blocked_player_id?: number,
	isBlocked?: boolean,
}
const PropsUser = ref<User>()

async function WindowChannel(type: string, user: User) {
	WindowForChannel.value = { isOpen: true, type: type, channelId: actualChannelId.value }
	user.role = user.owner_flg + user.admin_flg + user.member_flg
	PropsUser.value = user
}
async function EmitCloseWindow(str: any) {
	await GetUsers()
	if (str !== 'empty') {
		props.socket.emit('signalUsers')
		props.socket.emit('signal')
	}
	WindowForChannel.value = { isOpen: false, type: '' }
}

const actualChannelId = ref<number>()

watch(props, async (newProps) => {
	if (newProps.channelId) {
		actualChannelId.value = newProps.channelId
		await GetUsers()
	}
	else {
		actualChannelId.value = undefined
	}
	if (newProps.socket) {
		await GetUsers()
	}
	props.socket.on('callBackUsers', async () => {
		await GetUsers()
	})
})

const users = ref<any>()
const myUser = ref<any>()
const myRole = ref<number>()
const bannedUsers = ref<User[]>()
const blockedUsers = ref<User[]>()

async function GetUsers() {
	if (actualChannelId.value) {
		await axios.post('/chat/chatInfo', { chat_id: actualChannelId.value }).then((res) => {
			users.value = res.data?.users_info
			myUser.value = res.data?.rigths_of_user
		}).catch((e) => {
			actualChannelId.value = undefined
			emit('LeaveChannel')
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

		await axios.get('/chat/blockedUsers').then((res) => {
			blockedUsers.value = res.data
		}).catch((e) => {
			console.log(e)
		})
	}
}

async function LeaveChannel() {
	await axios.post('chat/leaveChannel', { chat_id: actualChannelId.value, player_id: myUser.value.id }).catch((e) => {
		console.log(e)
	})
	users.value = undefined
	emit('LeaveChannel')
	props.socket.emit('signal')
	props.socket.emit('signalUsers')
}

async function UnBanned(userId: number) {
	await axios.post('chat/unbanUser', { chat_id: actualChannelId.value, player_id: userId }).catch((e) => {
		console.log(e)
	})
	props.socket.emit('signalUsers')
}

async function UnBlocked(userId: number | undefined) {
	await axios.post('chat/unblockUser', { player_id: userId }).catch((e) => {
		console.log(e)
	})
	props.socket.emit('signalUsers')
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
	props.socket.emit('signalUsers')
	userName.value = ''
}

async function GetUserInfo(userId: number) {
	window.location.assign('http://' + window.location.host + '/player/' + userId)
}

async function PostBlockPlayer(userId: number) {
	await axios.post('chat/blockUser', { player_id: userId }).catch((e) => {
		console.log(e)
		errorMsg.value = e.response.data.message
	}).then((res: any) => {
		if (res.data) {
			errorMsg.value = ''
		}
	})
	props.socket.emit('signalUsers')
}

const store = Store()

const { invitesSend } = storeToRefs(store)

async function GetInvites() {
	await axios.get('notify/sendInvites').catch((e) => {
		console.log(e)
	}).then((res) => {
		if (res) {
			invitesSend.value = res.data
		}
	})
}

onMounted(async () => {
	await GetInvites()
	await store.GetSocketInvite().on('declince', async () => {
		setTimeout(async () => {
			await GetInvites()
		}, 100)
	})

	await store.GetSocketInvite().on('cancelInvite', async () => {
		setTimeout(async () => {
			await GetInvites()
		}, 100)
	})

	await store.GetSocketInvite().on('startGame', async () => {
		setTimeout(async () => {
			await GetInvites()
		}, 100)
	})
})

async function InviteToGame(id: number) {
	await store.GetSocketInvite().emit('invitePlayerInitiator', { id: id })
	setTimeout(async () => {
		await GetInvites()
	}, 100)

}

async function Cancel(id?: number) {
	store.GetSocketInvite().emit('cancelInviteInitiator', { id: id })
	setTimeout(async () => {
		await GetInvites()
	}, 100)
}

</script>

<template>
	<ChannelWindow :type=WindowForChannel.type :chanelId=WindowForChannel.channelId :myRole=myRole :PropsUser=PropsUser
		v-if="WindowForChannel.isOpen" @ChannelWindowIsClose='EmitCloseWindow' />
	<div class="Invites" v-if="invitesSend.length">
		<p style="text-align: center">
			Invites
		</p>
		<div v-for=" invite in invitesSend" style="margin-top: 5px; color: rgb(255, 255, 255); width: 200px; height: 45px;">
			<p style="text-align: center; color: blue;">
				<span>
					<el-button size="small" style="position: absolute; left: 0%;"
						@click="Cancel(invite.who_id)">Cancel</el-button>
				</span>
				{{ invite.who_name }}
			</p>
		</div>
	</div>
	<div class="Users" v-if="actualChannelId">
		<el-button color="yellow" v-show="!(myUser?.owner_flg)" @click="LeaveChannel()"
			style="position: absolute; right: 0%;">
			Leave
		</el-button>
		<h2>Users {{ channelId }}</h2>
		<div style="position: relative; height: 95%; width: 100%; overflow: auto;">
			<div v-for="(user) in users">
				<p style="padding-bottom: 2px;">
					<span style="font-size: 21px; width: 60%;word-wrap: break-word;">
						<el-dropdown size="small" split-button type="primary">
							{{ user.user_name }}
							<template #dropdown>
								<el-dropdown-menu>
									<el-dropdown-item @click="GetUserInfo(user.player_id)">Info</el-dropdown-item>
									<span v-if="user.player_id === myUser.player_id">
										<el-dropdown-item disabled>Game</el-dropdown-item>
										<el-dropdown-item disabled>Block</el-dropdown-item>
									</span>
									<span v-else>
										<el-dropdown-item @click="InviteToGame(user.player_id)">Game</el-dropdown-item>
										<span
											v-if="blockedUsers?.find(blockUser => blockUser.blocked_player_id === user.player_id && blockUser.isBlocked)">
											<el-dropdown-item disabled>Block</el-dropdown-item>
										</span>
										<span v-else>
											<el-dropdown-item
												@click="PostBlockPlayer(user.player_id)">Block</el-dropdown-item>
										</span>
									</span>
								</el-dropdown-menu>
							</template>
						</el-dropdown>
						<span style="color: blue; padding-left: 5px;">
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
			<div class="BlockedUsers" v-show="blockedUsers?.find(blockUser => blockUser.isBlocked)" style="width: 200px">
				<h3> Blocked users: </h3>
				<div v-for="(user) in blockedUsers">
					<span style="font-size: 21px;" v-if="user.isBlocked">
						{{ user.name }}
					</span>
					<el-button size="small" @click="UnBlocked(user.blocked_player_id)"
						style="position: absolute; right: 0%;">
						UnBlock
					</el-button>
				</div>
			</div>
			<div class="AddUser" v-show="myRole && myRole > 1 && actualChannelId">
				<h3>Add user </h3>
				<el-input style="width: 80%;" v-model="userName" placeholder="write username" />
				<el-button style="position: absolute; right: 0%;" @click="AddUser()">
					Add
				</el-button>
			</div>
			<p style=color:red> {{ errorMsg }} </p>
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
	height: 95%;
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
	height: 95%;
	max-height: 95%;
	right: 0;
	bottom: 0;
	border-radius: 10px;
	box-shadow: inset 0 10000px 200px rgba(255, 255, 255, .5);
	filter: blur(2px);
	margin: 0px;
	overflow: auto;
}

.Invites {
	position: fixed;
	z-index: 10;
	right: 1%;
	top: 10%;
	overflow: auto;
	background-color: aliceblue;
}
</style>
