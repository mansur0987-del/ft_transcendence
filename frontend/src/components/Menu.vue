




<script setup lang="ts">
import { Socket } from "socket.io-client";
import { ref, watch } from "vue";
import { ElButton } from "element-plus"

const props = defineProps<{
    gameSocket: Socket,
    mode: number,
    code: string,
}>()

const isHardcore = ref<number>(props.mode);

async function toggleMode() {
    if (isHardcore.value === 2) {
        isHardcore.value = 0;
    }
    else {
        isHardcore.value++;
    }
    props.gameSocket.emit('changeMode', { newMode: isHardcore.value, code: props.code })
}

watch(props, (newProps) => {
    if (newProps) {
        isHardcore.value = newProps.mode
    }
})
</script>


<template>
    <div class="button">
        <h1 class="button-text">Welcome to the Mighty Pong game! </h1>
        <el-button size="large" color="red" @click="toggleMode">
            {{ !isHardcore ? "Standard" : isHardcore === 1 ? "Fast" : 'Small_padle' }}
        </el-button>
        <el-button size="large" color="red">
            Let's play
        </el-button>
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
</style>

