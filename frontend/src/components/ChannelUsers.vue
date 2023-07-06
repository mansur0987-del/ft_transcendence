<script setup lang="ts">
const props = defineProps<{
	channelId: number
}>()

</script>

<template>
	<div class="Users">
		<h1>Users in the channel {{ channelId }}</h1>
	</div>
</template>

<style>
.Users {
	position: absolute;
	top: 10px;
	left: 70%;
	right: 10%;
	background-color: antiquewhite;
	height: 90%;

}
</style>
