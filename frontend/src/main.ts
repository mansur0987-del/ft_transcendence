import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from "pinia"
import {Store} from './pinia'
import './axios'

const pinia = createPinia()
const app = createApp({
	Store,
	extends: App,
})

app.use(pinia)
app.use(router)
app.mount('#app')


