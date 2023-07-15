<script>
import Engine from './Engine.vue'

export default {
    // need to get gameSocket and mode from the other components...
    // Engine?
    props: {
        gameSocket: Object, // not sure about the type
        mode: number
    },
    setup(props) {
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
            if (isHardcore.value)
                mode = 0;
            else
                mode = 1;
        }

        return { searchOpponent, toggleMode, isLoading, isHardcore }
    }
}
</script>

<template>
<div class='w-screen h-screen justify-center relative'> 
          <div class='scene w-full h-full absolute'>
              <Engine :isPreview="true" /> 
          </div>
        <div class='w-screen h-screen flex justify-center items-center'> 
          <div class="w-1/2 h-fit flex flex-col justify-center items-center bg-gray-400 bg-opacity-70 rounded-lg p-8 relative z-10"> 
            <h1 class="text-2xl font-bold text-center mb-4">Pong Game</h1>
            <button
                class="bg-gray-700 hover:bg-gray-950 text-white font-bold py-2 px-4 rounded w-1/2 mb-4"
                @click="searchOpponent()"
            >
           {{isLoading}}
            </button>
           
            <button v-if="isHardcore" class="bg-red-700 hover:bg-red-950 text-white font-bold py-2 px-4 rounded w-1/2 mb-4" >

            </button>
            <button v-else-if="!isHardcore" class="bg-red-950 text-white font-bold py-2 px-4 rounded w-1/2 mb-4">


            </button>
                :class={"isHardcore ?  : bg-gray-700 hover:bg-gray-950 text-white font-bold py-2 px-4 rounded w-1/2 mb-4"}
                onClick={() => toggleMode()}
            >
                {{isHardcore ? "Hardcore" : "Standard"}}
            </button>
            <p className="text-center">Instructions:</p>
            <ul className="list-disc list-inside mt-2">
                <li>Use the W and S keys to move your paddle up and down</li>
                <li>Use the space bar to pause the game</li>
            </ul>
          </div>
          </div>
      </div>
</template>