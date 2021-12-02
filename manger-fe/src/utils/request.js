/**
 * axios二次封装
 */
import axios from 'axios'
import config from './../config'
import {ElMessage} from 'element-plus'
import router  from '../router'
import storage from './storage'
const TOKEN_INVALID  = 'Token认证失败，请重新登录'
const NETWORK_ERROR = '网络请求异常，请稍后重试'
const NETWORK_SUCCESS = '请求成功'
//axios创建示例对象 添加全局配置
const service = axios.create({
    baseURL: config.baseApi,
    timeout:8000
})


//请求拦截
service.interceptors.request.use((req)=>{
    //TODO 
    const headers = req.headers;
    const { token = "" } = storage.getItem('userInfo') || {};
    if (!headers.Authorization) headers.Authorization = 'Bearer ' + token;
    return req;
    
})

//响应拦截
service.interceptors.response.use((res)=>{
    const {code,data,msg} = res.data;
    if(code === 200){
        if(msg=='登录成功'){
            ElMessage.success(msg||NETWORK_SUCCESS)
        }
       if(typeof data === 'object'){
           data.msg = msg;
       }
        return data;
    }else if(code === 50001){
        ElMessage.error(TOKEN_INVALID)
        setTimeout(()=>{
            router.replace('/login')
        },500)
        return Promise.reject(TOKEN_INVALID)
    }else{
        ElMessage.error(msg || NETWORK_ERROR)
        return Promise.reject(NETWORK_ERROR)
    }
})
/**
 * 请求核心函数
 * @param {*} options 请求配置 
 */

function request(options){
   
    options.method = options.method  || 'get'
    if(options.method.toLowerCase() === 'get'){
        options.params = options.data;
    }
    let isMock = config.mock;
    if(typeof options.mock != 'undefined'){
        isMock = options.mock
        
    }
    if(config.env === 'production'){
        service.defaults.baseURL = config.baseApi
    }else{
        service.defaults.baseURL = isMock ? config.mockApi:config.baseApi
       
    }
    
    return service(options)
}

['get','post','put','delete','patch'].forEach((item)=>{
    request[item] = (url,data,options) => {
        return request({
            url,
            data,
            method:item,
            ...options
        })
           
        
    }
})
export default request