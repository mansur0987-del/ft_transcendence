<script setup lang="ts">
import axios from 'axios'

async function Logout() {
	axios.get('auth/logout')
		.then(() => (
			window.location.href = 'Login')
		)
	localStorage.removeItem('token')
}
</script>

<template>
	<div class="button">
		<button @click="Logout()">
			Logout
		</button>
	</div>
</template>

<style scoped>
.button {
	position: absolute;
	right: 10px;
	top: 5px;
	border: none;
	color: rgb(60, 2, 55);
	padding: 15px 32px;
	text-align: center;
	text-decoration: none;
	display: inline-block;
	font-size: 14px;
}

.button button {
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

.button button:hover {
	transform: scale(1.1) translateY(-5px);
}
</style>
