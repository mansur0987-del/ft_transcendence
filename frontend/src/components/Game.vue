<script setup lang="ts">
import { onMounted, ref } from "vue";
import ExitGame from './ExitGame.vue'
import Menu from './Menu.vue'
import Pong from './Pong.vue'

const test = ref<string>()
let count: number = 10

const score = ref<{
	first: number,
	second: number
}>()

score.value = { first: 0, second: 0 }


const key = ref<string>()
async function keyFunc(e: any) {
	console.log(e.code)
	if (e.code === 'ArrowUp') {
		key.value = 'UP'
		count++;
		test.value = count + 'px'
		console.log(key.value)
	}
	else if (e.code === 'ArrowDown') {
		key.value = 'DOWN'
		count--;
		test.value = count + 'px'
		console.log(key.value)
	}
}

const input = document;
onMounted(() => {
	input.addEventListener('keydown', keyFunc)
})

</script>

<template>
	<ExitGame />
	<div class="Game">
		<h1>Game</h1>
	</div>
	<div class="firstScore">
		<h1>{{ score?.first }}</h1>
	</div>
	<div class="secondScore">
		<h1>{{ score?.second }}</h1>
	</div>
	<div class="Key">
		{{ key }}
	</div>
</template>

<style scoped>
.Game {
	position: absolute;
	top: 10px;
	left: 50%;
}

.firstScore {
	position: absolute;
	top: v-bind(test);
	left: 30%;
}

.secondScore {
	position: absolute;
	top: 10px;
	left: 75%;
}

.Key {
	position: absolute;
	top: 50%;
	left: 20%;
}
</style>
