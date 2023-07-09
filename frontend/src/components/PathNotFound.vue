<script setup lang="ts">
import LeftBar from './LeftBar.vue'
import Logout from './Logout.vue'
</script>

<template>
	<LeftBar />
	<Logout />
	<div class="PathNotFound">
		<h1>Page not found</h1>
	</div>
</template>

<style>
.PathNotFound {
	color: red;
}
</style>
