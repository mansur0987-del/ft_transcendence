




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
        console.log('props.gameSocket');
        console.log(props.gameSocket);
        props.gameSocket.emit('add');
        console.log('adding');
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
    <div class="button">
        <h1 class="button-text">Welcome to the Mighty Pong game!</h1>
        <button @click="searchOpponent()">
            {{ isLoading }}
        </button>

        <button
            :class="isHardcore ? 'bg-red-700 hover:bg-red-950 text-white font-bold py-2 px-4 rounded w-1/2 mb-4' : 'bg-gray-700 hover:bg-gray-950 text-white font-bold py-2 px-4 rounded w-1/2 mb-4'"
            @Click="toggleMode()">
            {{ isHardcore ? "Hardcore" : "Standard" }}
        </button>
    </div>
</template>

<style scoped>
.button {
    position: fixed;
    top: 20%;
    left: 25%;
    width: 50%;
    height: 16rem;
    box-shadow: 0 0 1rem 0 rgba(0, 0, 0, .2);
    border-radius: 5px;
    z-index: 1;
    background: inherit;
    overflow: hidden;
    border: none;
    padding: 15px 32px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
}


.button:before {
    content: "";
    position: absolute;
    background: inherit;
    z-index: -1;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    box-shadow: inset 0 100px 2000px rgb(231, 9, 9);
    filter: blur(0px);
    margin: -0px;
    border-radius: 20px;
}


.button-text {
    font-size: 50px;
    font-weight: bold;
    color: rgb(0, 0, 0);

}

.button button {
    background-color: greenyellow;
    /* Green */
    width: auto;
    margin-left: auto;
    margin-right: auto;
    border: none;
    color: blueviolet;
    padding: 21px 42px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 20px;
    transition: transform 500ms ease;
    border-radius: 20px;
    cursor: pointer;
}

.button button:hover {
    transform: scale(1.1) translateY(-5px);
}

.button button {
    background-color: greenyellow;
    /* Green */
    width: auto;
    margin-left: auto;
    margin-right: auto;
    border: none;
    color: blueviolet;
    padding: 21px 42px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 20px;
    transition: transform 500ms ease;
    border-radius: 20px;
    cursor: pointer;
}

.button button:hover {
    transform: scale(1.1) translateY(-5px);
}
</style>



<!-- <template>
    <div class='w-screen h-screen justify-center relative'>
        <div class='scene w-full h-full absolute' >
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
</template> -->
