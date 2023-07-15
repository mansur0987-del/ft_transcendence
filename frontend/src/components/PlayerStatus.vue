<script setup lang="ts">
import axios from "axios";
import { onMounted } from "vue";



function checkVisible() {
	if (document.visibilityState !== "visible") {
		console.log('unvisible')
		axios.post('player/profile', { updateData: { status: 0 } })
	}
	else {
		axios.post('player/profile', { updateData: { status: 1 } })
	}
}

onMounted(() => {
	window.addEventListener('visibilitychange', checkVisible)
})

</script>

<template></template>
