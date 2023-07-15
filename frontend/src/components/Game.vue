<template>
    <div>
        <LeftBar />
        <div class="flex flex-wrap">
            <template v-if="isReady">
                <Multiplayer :GameGateway="GameGateway" :id="id" :setId="setId" :mode="mode" />
            </template>
            <template v-else>
                <Menu :GameGateway="GameGateway" :setMode="setMode" />
            </template>
        </div>
    </div>
</template>

<script>
import LeftBar from './LeftBar.vue';
import Pong from './Pong.vue';
import Multiplayer from './Multiplayer.vue';
import Menu from './Menu.vue';
import { ref, onMounted, onUnmounted } from 'vue';
import MultiplayerVue from "./Multiplayer.vue";
import { io } from 'socket.io-client';
import { useLocation } from 'vue-use-kit'
import { GameGateway } from '../../../backend/src/Game/game.gateway'

// export default {
//     components: {
//         LeftBar,
//         Pong,
//         Multiplayer,
//         Menu
//     },
//     setup() 

// const GameGateway = ref(null);
const isInvite = ref(false);
const isReady = ref(isInvite.value);
const id = ref(0);
const mode = ref(0);
const { invite, setPlayerId } = handleConnection(GameGateway); //useContext(GameGateway);

onMounted(() => {
    isReady.value = invite;

    if (GameGateway.value) {
        GameGateway.value.on('room', (data) => {
            console.log('Received a message from the backend room code:', data);
            isReady.value = true;
        });

        GameGateway.value.on('add', (data) => {
            console.log('Gateway add: ', data);
            setPlayerId(data - 1);
        });
    }

    return () => {
        if (GameGateway.value) {
            GameGateway.value.off('connect');
            GameGateway.value.off('info');
            GameGateway.value.off('room');
            GameGateway.value.off('add');
            GameGateway.value.off('disconnect');
        }
    }
});

        // return {
        //     GameGateway,
        //     isReady,
        //     id,
        //     setId,
        //     mode,
        //     setMode
        // };
//     }
// };
</script>