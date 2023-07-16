<script setup lang="ts">
import axios from "axios";
import LeftBar from './LeftBar.vue'
import Logout from './Logout.vue'
import { ref, onMounted } from "vue";
import { ElButton } from 'element-plus'

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
		<h1 style="text-align: center;">FriendList</h1>
		<template v-for="friend in friends">
			<li v-if="friend.name !== ''">
				<span v-if="friend.status === 'Online'" style="color: green; font-size: 30px;">
					{{ friend.name }}
				</span>
				<span v-else style="color:firebrick; font-size: 30px;">
					{{ friend.name }}
				</span>
				<el-button style="position: absolute; right: 16%;" @click="PostDeleteFriend(friend)">
					Delete</el-button>
				<el-button style="position: absolute; right: 0%;" @click="RedirectToProfile(friend)">Get info</el-button>
				<el-button style="position: absolute; right: 9%;" @click="Chat(friend)"> Chat </el-button>
			</li>
		</template>

	</div>
</template>

<style scoped>
.FriendList {
	position: fixed;
	top: 5%;
	left: 15%;
	width: 70%;
	height: max-content;
	max-height: 90%;
	border-radius: 10px;
	z-index: 1;
	overflow: auto;
}

.FriendList:after {
	content: "";
	position: fixed;
	background: inherit;
	z-index: -1;
	top: 5%;
	left: 15%;
	width: 70%;
	height: auto;
	max-height: 90%;
	right: 0;
	bottom: 0;
	border-radius: 10px;
	box-shadow: inset 0 10000px 200px rgba(255, 255, 255, .5);
	filter: blur(2px);
	margin: 0px;
	overflow: auto;
}
</style>
