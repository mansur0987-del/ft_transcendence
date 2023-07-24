<script setup lang="ts">
import PlayerStatus from './PlayerStatus.vue'
import { ElButton } from 'element-plus'
import { Store } from "../pinia";
import { onMounted, ref } from "vue";
import type { Socket } from "socket.io-client";

const store = Store()

interface Invite {
	name: string
}
let socketInvite: Socket
const invites = ref<Invite[]>()
onMounted(() => {
	socketInvite = store.GetSocketInvite()

	socketInvite.on('GetInvite', (data) => {
		if (data.name) {
			invites.value?.push({ name: data.name })
		}
	})
})

async function Cancel(name: string) {
	socketInvite.emit('declinceInvite', { name: name })
	await UpdateInvites(name)
}

async function Game(name: string) {
	socketInvite.emit('acceptInvite', { name: name })
	await UpdateInvites(name)
}

async function UpdateInvites(name: string) {
	invites.value = invites.value?.filter((element) => {
		return element.name !== name;
	})
}


async function GetPlayer() {
	window.location.assign('http://' + window.location.host + '/player')
}

async function GetSettings() {
	window.location.assign('http://' + window.location.host + '/settings')
}

async function GetPlayers() {
	window.location.assign('http://' + window.location.host + '/players')
}

async function GetFriendList() {
	window.location.assign('http://' + window.location.host + '/friendlist')
}

async function GetGame() {
	window.location.assign('http://' + window.location.host + '/game')
}

async function GetChat() {
	window.location.assign('http://' + window.location.host + '/chat')
}
</script>

<template>
	<PlayerStatus />
	<div class="LeftBar">
		<el-button color="#66b1ff" size="large" plain @click="GetPlayer()">
			Player
		</el-button>
		<el-button color="#66b1ff" size="large" plain style="margin-top: 5px" @click="GetSettings()">
			Settings
		</el-button>
		<el-button color="#66b1ff" size="large" plain style="margin-top: 5px" @click="GetPlayers()">
			Players
		</el-button>
		<el-button color="#66b1ff" size="large" plain style="margin-top: 5px" @click="GetFriendList()">
			FriendList
		</el-button>
		<el-button color="#66b1ff" size="large" plain style="margin-top: 5px" @click="GetGame()">
			Game
		</el-button>
		<el-button color="#66b1ff" size="large" plain style="margin-top: 5px" @click="GetChat()">
			Chat
		</el-button>
	</div>
	<div class="Invites">
		<div v-for="invite in invites" style="margin-top: 5px; color: rgb(255, 255, 255); width: 200px;">
			<p style="text-align: center;">
				{{ invite.name }}
			</p>
			<p>
				<el-button size="small" style="position: absolute; left: 0%;"
					@click="Cancel(invite.name)">Cancel</el-button>
				<el-button size="small" style="position: absolute; right: 0%;" @click="Game(invite.name)">Let's
					play</el-button>
			</p>
		</div>
	</div>
</template>

<style scoped>
.LeftBar {
	position: fixed;
	left: 1%;
	top: 1%;
	border: none;
	padding: 15px 32px;
	text-align: center;
	text-decoration: none;
	display: inline-block;
	font-size: 14px;
	width: 5%;
}

.LeftBar button {
	width: 100px;
	margin-left: auto;
	margin-right: auto;
	border: none;
	padding: 20px 20px;
	text-align: center;
	text-decoration: none;
	display: inline-block;
	font-size: 16px;
	border-radius: 10px;
	height: 55px;
}

.Invites {
	position: fixed;
	right: 10%;
	top: 1%;
	height: fit-content;
	max-height: 90%;
	overflow: auto;
}
</style>
