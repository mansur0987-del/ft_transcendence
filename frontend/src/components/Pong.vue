<script setup lang="ts">
import Multiplayer from "./Multiplayer.vue";
import { Socket } from "socket.io-client";

const props = defineProps<{
    gameSocket: Socket,
    mode: number,
    playerId: number
}>()
</script>

<template>
    <div>
        <div class="w-full md:w-4/5 h-screen bg-black">
            <Multiplayer :gameSocket="gameSocket" :playerId="playerId" :mode="mode" />
        </div>
        <div class="w-full md:w-1/5 bg-gray-900 h-screen text-white">
            <div class="flex flex-col justify-center items-center">
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