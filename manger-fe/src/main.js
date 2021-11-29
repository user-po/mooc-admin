import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/lib/theme-chalk/index.css';
import request from './utils/request'
import storage from './utils/storage'
import api from './api'
import store from './store'
const app = createApp(App);

app.directive('has',{
    beforeMount:(el,binding)=>{
        //获取按钮权限
        let actionList = storage.getItem('actionList')
        let value = binding.value;
        //判断列表中是否有对应的按钮权限标识
        let hasPermission = actionList.includes(value);
        if(!hasPermission){
            el.style = "display:none";
            //宏任务
            setTimeout(()=>{
                 el.parentNode.removeChild(el);
            },0)
  
        }
    }
})
app.config.globalProperties.$request = request;
app.config.globalProperties.$storage = storage;
app.config.globalProperties.$api = api;
app.use(router).use(store).use(ElementPlus,{size:'small'}).mount('#app')
