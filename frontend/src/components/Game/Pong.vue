<template>
    <div>
        <div class="w-full md:w-4/5 h-screen bg-black">
            <Multiplayer :gameSocket="gameSocket" :id="id" :mode="mode" />
        </div>
        <div class="w-full md:w-1/5 bg-gray-900 h-screen text-white">
            Chat
        </div>
    </div>
</template>

<script>
import Multiplayer from './Multiplayer';

export default {
    components: {
        Multiplayer,
    },
    props: {
        gameSocket: Object,
        id: Number,
        mode: Number,
    },
};
</script>
