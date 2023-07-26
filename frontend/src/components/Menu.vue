<script setup lang="ts">
import Engine from './Engine.vue'
import { Socket } from "socket.io-client";
import { ref } from "vue";

const props = defineProps<{
    gameSocket: Socket,
    mode: number,
}>()
const isLoading = ref("Find Game");
const isHardcore = ref(false);

const searchOpponent = () => {
    try {
        isLoading.value = "Searching...";
        props.gameSocket.emit('add');
    } catch (err) {
        isLoading.value = "Error";
        console.error(err);
    }
}

const toggleMode = () => {
    isHardcore.value = !isHardcore.value;
    if (isHardcore.value) { }
    //  props.mode = 0; // WHY IS READONL
    // else
    //  props.mode = 1;
}
</script>

<template>
    <div class='w-screen h-screen justify-center relative'>
        <div class='scene w-full h-full absolute'>
            <Engine :isPreview="true" />
        </div>
        <div class='w-screen h-screen flex justify-center items-center'>
            <div
                class="w-1/2 h-fit flex flex-col justify-center items-center bg-gray-400 bg-opacity-70 rounded-lg p-8 relative z-10">
                <h1 class="text-2xl font-bold text-center mb-4">Pong Game</h1>
                <button class="bg-gray-700 hover:bg-gray-950 text-white font-bold py-2 px-4 rounded w-1/2 mb-4"
                    @click="searchOpponent()">
                    {{ isLoading }}
                </button>

                <button
                    :class="isHardcore ? 'bg-red-700 hover:bg-red-950 text-white font-bold py-2 px-4 rounded w-1/2 mb-4' : 'bg-gray-700 hover:bg-gray-950 text-white font-bold py-2 px-4 rounded w-1/2 mb-4'"
                    @Click="toggleMode()">
                    {{ isHardcore ? "Hardcore" : "Standard" }}
                </button>
                <p class="text-center">Instructions:</p>
                <ul class="list-disc list-inside mt-2">
                    <li>Use the W and S keys to move your paddle up and down</li>
                    <li>Use the space bar to pause the game</li>
                </ul>
            </div>
        </div>
    </div>
</template>