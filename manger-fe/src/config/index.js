/**
 * 环境配置封装
 */
const env = import.meta.env.MODE || 'prod';
const EnvConfig = {
    dev:{
        baseApi:'/',
        mockApi:'https://www.fastmock.site/mock/9aef559acd47d7c9bc2dbf4b7a572c68/api'
    },
    test:{
        baseApi:'/',
        mockApi:'https://www.fastmock.site/mock/9aef559acd47d7c9bc2dbf4b7a572c68/api'
    },
    prod:{
        baseApi:'/',
        mockApi:'https://www.fastmock.site/mock/9aef559acd47d7c9bc2dbf4b7a572c68/api'
    }
}
export default {
    env,
    mock:true,
    ...EnvConfig[env]
}