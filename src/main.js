import { createApp } from 'vue'
import './style.css'
import 'primevue/resources/themes/saga-blue/theme.css  '     //theme
import 'primevue/resources/primevue.min.css   '              //core css
import 'primeicons/primeicons.css   '         
import '/node_modules/primeflex/primeflex.css'               //icons
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import App from './App.vue'

const app = createApp(App)

app.use(PrimeVue)
app.use(ToastService)

app.mount('#app')
