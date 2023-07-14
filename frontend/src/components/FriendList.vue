<script setup lang="ts">
import axios from "axios";
import LeftBar from './LeftBar.vue'
import Logout from './Logout.vue'
import { ref, onMounted } from "vue";

const friends = ref<any[]>([])

async function GetFriends() {
	await axios.get('player/friends').then((res) => {
		friends.value = res.data.friends;
	})
}

async function PostDeleteFriend(player: any) {
	await axios.post('player/removeapplycation', { 'id': player.id })
	player.name = ""
}

onMounted(() => {
	GetFriends()
})

async function RedirectToProfile(player: any) {
	window.location.href = '/player/' + player.id
}

async function Chat(player: any) {
	await axios.post('chat/enterDirectChannel', { player_name: player.name }).catch((e) => {
		console.log(e)
	}).then((res: any) => {
		if (res?.data) {
			console.log(res.data.chat_id)
			window.location.assign('http://' + window.location.host + '/chat/' + res.data.chat_id)
		}
	})
}

</script>

<template>
	<LeftBar />
	<Logout />
	<div class="FriendList">
		<h1>FriendList</h1>
		<template v-for="friend in friends">
			<li v-if="friend.name !== ''">
				{{ friend.name }} {{ friend.status ? "Online" : "Offline" }}
				<button @click="PostDeleteFriend(friend)">
					Delete</button>
				<button @click="RedirectToProfile(friend)">Get info</button>
				<button @click="Chat(friend)"> Chat </button>
			</li>
		</template>
	</div>
</template>

<style scoped>
.FriendList {
	position: absolute;
	top: 5%;
	left: 30%;
}

.FriendList button {
	background-color: greenyellow;
	width: 100px;
	margin-left: auto;
	margin-right: auto;
	border: none;
	color: black;
	padding: 10px 10px;
	text-align: center;
	text-decoration: none;
	display: inline-block;
	font-size: 16px;
	transition: transform 500ms ease;
	border-radius: 10px;
	cursor: pointer;
}

.FriendList buttonAddFriend button button:hover {
	transform: scale(1.1) translateY(-5px);
}
</style>
