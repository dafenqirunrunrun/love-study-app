import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'

console.log('Starting Vue app with router...')

createApp(App)
  .use(router)
  .mount('#app')

console.log('Vue app mounted!')