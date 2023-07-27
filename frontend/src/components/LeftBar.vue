<script setup lang="ts">
import PlayerStatus from './PlayerStatus.vue'
import { ElButton } from 'element-plus'
import { Store } from "../pinia";
import { onMounted } from "vue";
import { storeToRefs } from "pinia";
import axios from "axios";

const storeLeftBar = Store()


const invitesNameLeftBar = storeToRefs(storeLeftBar).invitesName

async function GetInvitesLeftBar() {
	await axios.get('notify/recInvites').catch((e) => {
		console.log(e)
	}).then((res) => {
		if (res) {
			invitesNameLeftBar.value = res.data
		}
	})
}

onMounted(async () => {
	await GetInvitesLeftBar()

	storeLeftBar.GetSocketInvite().on('GetInvite', (data) => {
		console.log(data.newRawInvite)
		console.log(data.newRawInvite.initiator_name)
		if (data.newRawInvite.initiator_name && !(invitesNameLeftBar.value.find((element) => element.initiator_name === data.newRawInvite.initiator_name))) {
			invitesNameLeftBar.value.push({ initiator_name: data.newRawInvite.initiator_name, who_name: data.newRawInvite.who_name })
		}
	})

	storeLeftBar.GetSocketInvite().on('cancelInvite', async () => {
		await GetInvitesLeftBar()
	})
})

async function CancelLeftBar(name?: string) {
	console.log('11111')
	console.log('declinceInvite =', storeLeftBar.GetSocketInvite().emit('declinceInvite', { name: name }))
	await GetInvitesLeftBar()
}

async function GameLeftBar(name?: string) {
	storeLeftBar.GetSocketInvite().emit('acceptInvite', { name: name })
	await GetInvitesLeftBar()
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
	<div class="InvitesLeftBar" v-if="invitesNameLeftBar.length">
		<p style="text-align: center">
			Invites
		</p>
		<div v-for=" inviteLeftBar in invitesNameLeftBar"
			style="margin-top: 5px; color: rgb(255, 255, 255); width: 200px; height: 45px;">
			<p style="text-align: center; color: blue;">
				<span>
					<el-button size="small" style="position: absolute; left: 0%;"
						@click="CancelLeftBar(inviteLeftBar.initiator_name)">Cancel</el-button>
				</span>
				{{ inviteLeftBar.initiator_name }}
				<span>
					<el-button size="small" style="position: absolute; right: 0%;"
						@click="GameLeftBar(inviteLeftBar.initiator_name)">Let's play</el-button>
				</span>
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

.InvitesLeftBar {
	position: fixed;
	z-index: 10;
	right: 1%;
	top: 10%;
	overflow: auto;
	background-color: aliceblue;
}
</style>
