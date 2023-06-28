<script setup lang="ts">
import axios from 'axios'

async function Redirect42() {
	axios.get('auth/login')
		.then((res) => (
			window.location.href = res.data)
		)
}
</script>

<template>
	<div class="button">
		<div class="button-text">Are you ready?</div>
		<button @click="Redirect42()">
			Yes!
		</button>
	</div>
</template>

<style scoped>
.button {
	border: none;
	color: rgb(60, 2, 55);
	padding: 15px 32px;
	text-align: center;
	text-decoration: none;
	display: inline-block;
	font-size: 16px;
}

.button-text {
	font-size: 20px;
	font-weight: bold;
}

.button button {
	background-color: #4CAF50;
	/* Green */
	width: 100px;
	margin-left: auto;
	margin-right: auto;
	border: none;
	color: white;
	padding: 15px 32px;
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
