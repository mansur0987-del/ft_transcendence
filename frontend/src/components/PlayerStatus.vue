<script setup lang="ts">
import axios from "axios";
import { onMounted } from "vue";



function checkVisible() {
	if (document.visibilityState !== "visible") {
		console.log('unvisible')
		axios.post('player/profile', { updateData: { status: 0 } })
	}
	else {
		console.log('visible')
		axios.post('player/profile', { updateData: { status: 1 } })
	}
}

onMounted(() => {
	axios.post('player/profile', { updateData: { status: 1 } })
	document.addEventListener('visibilitychange', checkVisible)
})

</script>

<template></template>
