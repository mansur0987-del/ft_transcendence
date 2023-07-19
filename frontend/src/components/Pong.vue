<script setup lang="ts">
// import Multiplayer from "./Multiplayer.vue";
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
            Chat
        </div>
    </div>
</template>