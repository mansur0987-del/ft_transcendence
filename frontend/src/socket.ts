import { reactive } from "vue";
import { io } from "socket.io-client";

export const state = reactive({
  connected: false,
  fooEvents: [],
  barEvents: []
});

const URL = process.env.BASE_URL

export const socket = io(URL);

socket.on("connect", () => {
	console.log('socket connect')
  	state.connected = true;
});

//socket.on("disconnect", () => {
//  state.connected = false;
//});

//socket.on("foo", (...args) => {
//  state.fooEvents.push(args);
//});

//socket.on("bar", (...args) => {
//  state.barEvents.push(args);
//});

