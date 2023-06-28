<script setup lang="ts">

async function GetPlayer() {
	window.location.href = 'Player'
}

async function GetSettings() {
	window.location.href = 'Settings'
}

async function GetGame() {
	window.location.href = 'Game'
}

async function GetChat() {
	window.location.href = 'Chat'
}

</script>

<template>
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
	<!--<div class="bar" style="position:absolute; left: 10px; top: 5px;">
		<div class="Player" style="margin-top: 20px;">
			<h1>Player</h1>
		</div>
		<div class=" Settings" style="margin-top: 20px;">
			<h1>Settings</h1>
		</div>
		<div class="Game" style="margin-top: 20px;">
			<h1>Game</h1>
		</div>
		<div class="Chat" style="margin-top: 20px;">
			<h1>Chat</h1>
		</div>
	</div>-->
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

.button-Game {
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
	top: 185px;
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
