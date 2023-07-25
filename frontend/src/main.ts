import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import './axios'

const pinia = createPinia()
const app = createApp({
	extends: App,
})

app.use(router)
app.use(pinia)
app.mount('#app')


