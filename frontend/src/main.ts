import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import {Store} from './pinia'
import './axios'

const app = createApp({
	Store,
	extends: App,
})

app.use(router)
app.mount('#app')


