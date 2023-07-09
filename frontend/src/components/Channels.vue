<script setup lang="ts">
import { ref } from "vue";
import WindowCreateChannel from './CreateChannel.vue'

const emit = defineEmits<{
	(e: 'GetChannelId', chennelId: number): void
}>()

async function GetChannelIdFromClick(clickChannelId: number) {
	emit("GetChannelId", clickChannelId)
}

const WindowForCreateChannel = ref<number>(0);

async function CreateChannel() {
	WindowForCreateChannel.value = 1;
}
async function EmitCloseWindow() {
	WindowForCreateChannel.value = 0
}

</script>

<template>
	<WindowCreateChannel v-if="WindowForCreateChannel" @CreateChannelWindowIsClose='EmitCloseWindow' />
	<div class='Channels'>
		<p>{{ WindowForCreateChannel }}</p>
		<div class="buttonCreateChannel">
			<button @click="CreateChannel()">
				Create
			</button>
		</div>
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
