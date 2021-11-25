/**
 * 通用工具函数
 */
const log4js = require("./log");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
let transporter = nodemailer.createTransport({
  host: "smtp.qq.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: "1186968407@qq.com", // 发送方的邮箱
    pass: "colunezqfwimiabb", // smtp 的授权码
  },
});
const CODE = {
  SUCCESS: 200,
  PARAM_ERROR: 10001, //参数错误
  USER_ACCOUNT_ERROR: 20001, //账号或密码错误
  USER_LOGIN_ERROR: 30001, //用户未登录
  BUSINESS_ERROR: 40001, //业务请求失败
  AUTH_ERROR: 50001, //认证失败或TOKEN过期
};

module.exports = {
  /**
   * @param {from} 发件人邮箱
   * @param {to} 收件人邮箱
   * @param {subject} 邮件主题
   * @param {text} 邮件文本内容
   * @param {html} 邮件html内容
   * @param {callback} 回调函数
   * @returns
   */
  sendMail(mailObj, callback) {
    const { from, to, subject, text, html } = mailObj;
    // 发送的配置项
    let mailOptions = {
      from: from || "1186968407@qq.com", // 发送方
      to: to, //接收者邮箱，多个邮箱用逗号间隔
      subject: subject || "邮件标题", // 标题
      text: text || "测试文本", // 文本内容
      html: html || "", //页面内容
    };

    //发送函数
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        callback(false);
      } else {
        callback(true); //因为是异步 所有需要回调函数通知成功结果
      }
    });
  },
  /**
   * 分页结构封装
   * @param {number} pageNum
   * @param {number} pageSize
   * @returns {object}
   */
  pager({ pageNum = 1, pageSize = 10 }) {
    pageNum *= 1;
    pageSize *= 1;
    const skipIndex = (pageNum - 1) * pageSize;
    return {
      page: {
        pageNum,
        pageSize,
      },
      skipIndex,
    };
  },
  /**
   * 接口返回成功通用函数
   * @param {object} data
   * @param {string} msg
   * @param {string} code
   * @returns {object}
   */
  success(data = "", msg = "", code = CODE.SUCCESS) {
    log4js.debug(data);
    return {
      code,
      data,
      msg,
    };
  },
  /**
   * 接口返回失败通用函数
   * @param {object} data
   * @param {string} msg
   * @param {string} code
   * @returns {object}
   */
  fail(msg = "", code = CODE.BUSINESS_ERROR, data = "") {
    log4js.debug(msg);
    return {
      code,
      data,
      msg,
    };
  },
  /**
   * 状态码
   */
  CODE,
  /**
   * token解密
   * @param {string} authorization
   * @returns {string}
   */
  decoded(authorization) {
    if (authorization) {
      let token = authorization.split(" ")[1];
      return jwt.verify(token, "imooc");
    }
    return "";
  },
  //递归拼接树形列表
 getTreeMenu(rootList,id,list){
    
  for(let i=0;i<rootList.length;++i){
      let item  = rootList[i];
      //slice不改变原有对象 快速克隆
      if(String(item.parentId.slice().pop()) == String(id)){
          list.push(item._doc)
      }
  }
  list.map(item=>{
      item.children = [];
      //二级 三级菜单
      this.getTreeMenu(rootList,item._id,item.children)
      if(item.children.length==0){
          delete item.children;
      }else if(item.children[0].menuType==2){
          //快速区分按钮和菜单 用户做权限控制
          item.action = item.children;
          
      }
  })

  return list;
}
};
