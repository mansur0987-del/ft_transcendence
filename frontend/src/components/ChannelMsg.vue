<script setup lang="ts">
const props = defineProps<{
	channelId: number
}>()

</script>

<template>
	<div class="Chat">
		<h1>Msg in the channel {{ channelId }}</h1>
	</div>
</template>

<style>
.Chat {
	position: absolute;
	top: 10px;
	left: 35%;
	right: 35%;
	background-color: antiquewhite;
	height: 90%;

}
</style>
