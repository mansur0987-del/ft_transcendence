<template>
	<div>
		<NavBar />
		<div class="flex flex-wrap">
			<template v-if="isReady">
				<Multiplayer :gameSocket="gameSocket" :id="id" :setId="setId" :mode="mode" />
			</template>
			<template v-else>
				<Menu :gameSocket="gameSocket" :setMode="setMode" />
			</template>
		</div>
	</div>
</template>

<script>
import NavBar from "../NavBar.vue";
import Multiplayer from "./Multiplayer.vue";
import Menu from "./Menu.vue";
import { ref, reactive, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import { GameContext } from "../context/GameSocket";

export default {
	components: {
		NavBar,
		Multiplayer,
		Menu,
	},
	setup() {
		const isReady = ref(false);
		const id = ref(0);
		const mode = ref(0);
		const gameSocket = ref(null);
		const route = useRoute();
		const { invite, setPlayerId } = useContext(GameContext);

		onMounted(() => {
			isReady.value = invite;

			if (gameSocket.value) {
				gameSocket.value.on("room", (data) => {
					console.log("Received a message from the backend room code:", data);
					isReady.value = true;
				});

				gameSocket.value.on("add", (data) => {
					console.log("Socket add : ", data);
					setPlayerId(data - 1);
				});
			}

			return () => {
				if (gameSocket.value) {
					gameSocket.value.off("connect");
					gameSocket.value.off("info");
					gameSocket.value.off("room");
					gameSocket.value.off("add");
					gameSocket.value.off("disconnect");
				}
			};
		});

		return {
			isReady,
			id,
			mode,
			gameSocket,
			route,
			invite,
			setPlayerId,
		};
	},
};
</script>
