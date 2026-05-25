import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './assets/main.css'

const app = createApp(App)

window.addEventListener('keydown', (event) => {
  if (event.key === 'F7') {
    event.preventDefault()
  }
})

app.use(createPinia())
app.use(router)

app.mount('#app')
