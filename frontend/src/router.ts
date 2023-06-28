import { createRouter, createWebHistory } from "vue-router";
import Player from './components/Player.vue'
import Login from './components/Login.vue'
import Settings from './components/Settings.vue'
import Chat from './components/Chat.vue'
import Game from './components/Game.vue'
import axios from "axios";

const router = createRouter({
	routes: [
		{ path: '/', component: Player, name: 'Player'},
		{ path: '/login', component: Login, name: 'Login'},
		{ path: '/settings', component: Settings, name: 'Settings' },
		{ path: '/chat', component: Chat, name: 'Chat' },
		{ path: '/game', component: Game, name: 'Game' },
		{ path: '/player', redirect: '/' }
	],
	history: createWebHistory()
})

router.beforeEach((to, from) => {
	const token = localStorage.getItem('token')
	if (token === null){
		if (to.name !== 'Login'){
			return '/login'
		}
		if (to.query.code !== undefined){
			localStorage.setItem('token', to.query.code);
			axios.defaults.headers.common['Authorization'] = 'Bearer ' + localStorage.getItem('token')
			return Player
		}
	}
	else if (to.name === 'Login'){
		return Player
	}
})

export default router
