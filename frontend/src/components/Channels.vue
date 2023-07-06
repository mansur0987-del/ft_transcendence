<script setup lang="ts">
import { ref } from "vue";

const emit = defineEmits<{
	(e: 'GetChannelId', chennelId: number): void
}>()

async function GetChannelIdFromClick(clickChannelId: number) {
	emit("GetChannelId", clickChannelId)
}

</script>

<template>
	<div class="Channels">
		<h1>Channels</h1>
		<p @click="GetChannelIdFromClick(1)" style="cursor: pointer; color: blue">
			Push 1
		</p>
		<p @click="GetChannelIdFromClick(2)" style="cursor: pointer; color: blue;">
			Push 2
		</p>
		<p @click="GetChannelIdFromClick(3)" style="cursor: pointer; color: blue">
			Push 3
		</p>
	</div>
</template>

<style scoped>
.Channels {
	position: absolute;
	top: 10px;
	left: 10%;
	right: 70%;
	background-color: antiquewhite;
	height: 90%;


}
</style>
