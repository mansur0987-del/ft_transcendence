<script setup lang="ts">
import PlayerStatus from './PlayerStatus.vue'

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
	<div class="button-Player">
		<button @click="GetPlayer()">
			Player
		</button>
	</div>
	<div class="button-Settings">
		<button @click="GetSettings()">
			Settings
		</button>
	</div>
	<div class="button-Players">
		<button @click="GetPlayers()">
			Players
		</button>
	</div>
	<div class="button-FriendList">
		<button @click="GetFriendList()">
			FriendList
		</button>
	</div>
	<div class="button-Game">
		<button @click="GetGame()">
			Game
		</button>
	</div>
	<div class="button-Chat">
		<button @click="GetChat()">
			Chat
		</button>
	</div>
</template>

<style scoped>
.button-Player {
	position: absolute;
	left: 10px;
	top: 5px;
	border: none;
	color: rgb(60, 2, 55);
	padding: 15px 32px;
	text-align: center;
	text-decoration: none;
	display: inline-block;
	font-size: 14px;
}

.button-Player button {
	background-color: #000000;
	width: 100px;
	margin-left: auto;
	margin-right: auto;
	border: none;
	color: white;
	padding: 20px 20px;
	text-align: center;
	text-decoration: none;
	display: inline-block;
	font-size: 16px;
	transition: transform 500ms ease;
	border-radius: 10px;
	cursor: pointer;
}

.button-Player button:hover {
	transform: scale(1.1) translateY(-5px);
}

.button-Settings {
	position: absolute;
	left: 10px;
	top: 65px;
	border: none;
	color: rgb(60, 2, 55);
	padding: 15px 32px;
	text-align: center;
	text-decoration: none;
	display: inline-block;
	font-size: 14px;
}

.button-Settings button {
	background-color: #000000;
	width: 100px;
	margin-left: auto;
	margin-right: auto;
	border: none;
	color: white;
	padding: 20px 20px;
	text-align: center;
	text-decoration: none;
	display: inline-block;
	font-size: 16px;
	transition: transform 500ms ease;
	border-radius: 10px;
	cursor: pointer;
}

.button-Settings button:hover {
	transform: scale(1.1) translateY(-5px);
}

.button-Players {
	position: absolute;
	left: 10px;
	top: 125px;
	border: none;
	color: rgb(60, 2, 55);
	padding: 15px 32px;
	text-align: center;
	text-decoration: none;
	display: inline-block;
	font-size: 14px;
}

.button-Players button {
	background-color: #000000;
	width: 100px;
	margin-left: auto;
	margin-right: auto;
	border: none;
	color: white;
	padding: 20px 20px;
	text-align: center;
	text-decoration: none;
	display: inline-block;
	font-size: 16px;
	transition: transform 500ms ease;
	border-radius: 10px;
	cursor: pointer;
}

.button-Players button:hover {
	transform: scale(1.1) translateY(-5px);
}

.button-FriendList {
	position: absolute;
	left: 10px;
	top: 185px;
	border: none;
	color: rgb(60, 2, 55);
	padding: 15px 32px;
	text-align: center;
	text-decoration: none;
	display: inline-block;
	font-size: 14px;
}

.button-FriendList button {
	background-color: #000000;
	width: 100px;
	margin-left: auto;
	margin-right: auto;
	border: none;
	color: white;
	padding: 20px 20px;
	text-align: center;
	text-decoration: none;
	display: inline-block;
	font-size: 16px;
	transition: transform 500ms ease;
	border-radius: 10px;
	cursor: pointer;
}

.button-FriendList button:hover {
	transform: scale(1.1) translateY(-5px);
}

.button-Game {
	position: absolute;
	left: 10px;
	top: 245px;
	border: none;
	color: rgb(60, 2, 55);
	padding: 15px 32px;
	text-align: center;
	text-decoration: none;
	display: inline-block;
	font-size: 14px;
}

.button-Game button {
	background-color: #000000;
	width: 100px;
	margin-left: auto;
	margin-right: auto;
	border: none;
	color: white;
	padding: 20px 20px;
	text-align: center;
	text-decoration: none;
	display: inline-block;
	font-size: 16px;
	transition: transform 500ms ease;
	border-radius: 10px;
	cursor: pointer;
}

.button-Game button:hover {
	transform: scale(1.1) translateY(-5px);
}

.button-Chat {
	position: absolute;
	left: 10px;
	top: 305px;
	border: none;
	color: rgb(60, 2, 55);
	padding: 15px 32px;
	text-align: center;
	text-decoration: none;
	display: inline-block;
	font-size: 14px;
}

.button-Chat button {
	background-color: #000000;
	width: 100px;
	margin-left: auto;
	margin-right: auto;
	border: none;
	color: white;
	padding: 20px 20px;
	text-align: center;
	text-decoration: none;
	display: inline-block;
	font-size: 16px;
	transition: transform 500ms ease;
	border-radius: 10px;
	cursor: pointer;
}

.button-Chat button:hover {
	transform: scale(1.1) translateY(-5px);
}
</style>
