/**
 * 环境配置封装
 */
const env = import.meta.env.MODE || 'production';
const EnvConfig = {
    development:{
        baseApi:'/api',
        mockApi:'https://www.fastmock.site/mock/9aef559acd47d7c9bc2dbf4b7a572c68/api'
    },
    test:{
        baseApi:'/api',
        mockApi:'https://www.fastmock.site/mock/9aef559acd47d7c9bc2dbf4b7a572c68/api'
    },
    production:{
        baseApi:'/api',
        mockApi:'https://www.fastmock.site/mock/9aef559acd47d7c9bc2dbf4b7a572c68/api'
    }
}
export default {
    env,
    mock:false,
    namespace:'manger',
    ...EnvConfig[env]
}