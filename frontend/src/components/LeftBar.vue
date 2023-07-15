<script setup lang="ts">
import PlayerStatus from './PlayerStatus.vue'
import { ElButton } from 'element-plus'

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
</style>
