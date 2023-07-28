<script setup lang="ts">
import { ElButton } from 'element-plus'

async function Exit() {
	window.location.assign('http://' + window.location.host + '/player')
}

</script>

<template>
	<div class="button">
		<el-button color="#b25252" size="large" plain @click="Exit()">
			Exit
		</el-button>
	</div>
</template>

<style scoped>
.button {
	position: absolute;
	right: 5px;
	top: 5px;
	border: none;
	color: rgb(60, 2, 55);
	padding: 10px 15px;
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
