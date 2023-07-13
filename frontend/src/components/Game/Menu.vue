<template>
    <div class="w-screen h-screen justify-center relative">
        <div class="scene w-full h-full absolute">
            <Engine :isPreview="true" />
        </div>
        <div class="w-screen h-screen flex justify-center items-center">
            <div
                class="w-1/2 h-fit flex flex-col justify-center items-center bg-gray-400 bg-opacity-70 rounded-lg p-8 relative z-10">
                <h1 class="text-2xl font-bold text-center mb-4">Pong Game</h1>
                <button class="bg-gray-700 hover:bg-gray-950 text-white font-bold py-2 px-4 rounded w-1/2 mb-4"
                    @click="searchOpponent">
                    {{ isLoading }}
                </button>
                <button
                    :class="isHardcore ? 'bg-red-700 hover:bg-red-950 text-white font-bold py-2 px-4 rounded w-1/2 mb-4' : 'bg-gray-700 hover:bg-gray-950 text-white font-bold py-2 px-4 rounded w-1/2 mb-4'"
                    @click="toggleMode">
                    {{ isHardcore ? 'Hardcore' : 'Standard' }}
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

<script>
import { ref, reactive } from 'vue';
import Engine from './Engine.vue';

export default {
    components: {
        Engine,
    },
    setup() {
        const isLoading = ref('Find Game');
        const isHardcore = ref(false);

        const searchOpponent = () => {
            isLoading.value = 'Searching...';
            // Emit the event using the gameSocket
        };

        const toggleMode = () => {
            isHardcore.value = !isHardcore.value;
            // Set the mode based on the isHardcore value
        };

        return {
            isLoading,
            isHardcore,
            searchOpponent,
            toggleMode,
        };
    },
};
</script>
