/**
 * 环境配置封装
 */
const env = import.meta.env.MODE || 'production';
const EnvConfig = {
    dev:{
        baseApi:'http://localhost:3000/api',
        mockApi:'https://www.fastmock.site/mock/c1c302e8baed9894c48c17e4738c092e/api'
    },
    test:{
        baseApi:'/api',
        mockApi:'https://www.fastmock.site/mock/c1c302e8baed9894c48c17e4738c092e/api'
    },
    production:{
        baseApi:'/api',
        mockApi:'https://www.fastmock.site/mock/c1c302e8baed9894c48c17e4738c092e/api'
    }
}
export default {
    env,
    mock:false,
    namespace:'manger',
    ...EnvConfig[env]
}