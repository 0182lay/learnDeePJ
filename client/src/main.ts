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

app.directive('scroll-reveal', {
  mounted(el) {
    el.classList.add('reveal-hidden')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add('reveal-visible')
            observer.unobserve(el)
          }
        })
      },
      { threshold: 0.05, rootMargin: '0px 0px -40px 0px' }
    )
    observer.observe(el)
  }
})

app.mount('#app')
