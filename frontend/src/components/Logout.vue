<script setup lang="ts">
import axios from 'axios'
import { ElButton } from 'element-plus'

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
		<el-button color="#b25252" size="large" plain @click="Logout()">
			Logout :(
		</el-button>
	</div>
</template>

<style scoped>
.button {
	position: absolute;
	right: 10px;
	top: 5px;
	border: none;
	padding: 15px 32px;
	text-align: center;
	text-decoration: none;
	display: inline-block;
	font-size: 14px;
}

.button button {
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
