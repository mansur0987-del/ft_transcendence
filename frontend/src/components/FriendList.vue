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
					Delete friend</button>
			</li>
		</template>
	</div>
</template>

<style scoped>
</style>
