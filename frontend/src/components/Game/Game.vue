<template>
	<div>
		<LeftBar />
		<div class="flex flex-wrap">
			<template v-if="isReady">
				<Multiplayer :gameGateway="gameGateway" :id="id" :setId="setId" :mode="mode" />
			</template>
			<template v-else>
				<Menu :gameGateway="gameGateway" :setMode="setMode" />
			</template>
		</div>
	</div>
</template>

<script>
import LeftBar from "../LeftBar.vue";
import Multiplayer from "./Multiplayer.vue";
import Menu from "./Menu.vue";
import { ref, reactive, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import { GameGateway } from "../../../../backend/src/game/game.gateway.ts";
import { GameContext } from "../context/GameSocket";

export default {
	components: {
		LeftBar,
		Multiplayer,
		Menu,
	},
	setup() {
		const isReady = ref(false);
		const id = ref(0);
		const mode = ref(0);
		const gameGateway = ref(null);
		const route = useRoute();
		const { invite, setPlayerId } = useContext(GameContext);

		onMounted(() => {
			isReady.value = invite;

			if (gameGateway.value) {
				gameGateway.value.on("room", (data) => {
					console.log("Received a message from the backend room code:", data);
					isReady.value = true;
				});

				gameGateway.value.on("add", (data) => {
					console.log("Socket add : ", data);
					setPlayerId(data - 1);
				});
			}

			return () => {
				if (gameGateway.value) {
					gameGateway.value.off("connect");
					gameGateway.value.off("info");
					gameGateway.value.off("room");
					gameGateway.value.off("add");
					gameGateway.value.off("disconnect");
				}
			};
		});

		return {
			isReady,
			id,
			mode,
			gameGateway,
			route,
			invite,
			setPlayerId,
		};
	},
};
</script>
