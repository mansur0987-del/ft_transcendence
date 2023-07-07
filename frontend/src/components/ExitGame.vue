<script setup lang="ts">

async function Exit() {
	window.location.href = 'Player'
}

</script>

<template>
	<div class="button">
		<button @click="Exit()">
			Exit
		</button>
	</div>
</template>

<style scoped>
.button {
	position: absolute;
	left: 5px;
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
	background-color: red;
	width: 100px;
	margin-left: auto;
	margin-right: auto;
	border: none;
	color: white;
	padding: 10px 10px;
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
