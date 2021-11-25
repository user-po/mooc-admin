/**
 * 用户管理模块
 */
const router = require("koa-router")();
const User = require("./../models/userShema");
const Menu = require("./../models/menuSchema");
const Role = require("./../models/roleSchema");
const util = require("./../utils/util");
const jwt = require("jsonwebtoken");
router.prefix("/users");
const Counter = require("./../models/counterSchema");
const md5  =require('md5')
//用户的登录
router.post("/login", async (ctx) => {
  try {
    const { userName, userPwd } = ctx.request.body;
    //返回指定字段有三种方式
    //1.userId userName userEmail state role deptId roleList
    //2.{'userId'}:1 1返回
    //3. findOne().select('userId')
    const res = await User.findOne(
      {
        userName,
        userPwd:md5(userPwd),
      },
      "userId userName userEmail state role deptId roleList"
    );

    const data = res._doc;
    const token = jwt.sign(
      {
        data,
      },
      "imooc",
      { expiresIn: "1h" }
    );

    if (res) {
      data.token = token;
      ctx.body = util.success(data, "登录成功");
    } else {
      ctx.body = util.fail("账号或密码不正确");
    }
  } catch (error) {
    ctx.body = util.fail(error.msg);
  }
});
// 获取全量用户列表
router.get('/all/list', async (ctx) => {
  try {
    const list = await User.find({state : {$ne : 2}}, "userId userName userEmail")
    ctx.body = util.success(list)
  } catch (error) {
    ctx.body = util.fail(error.stack)
  }
})
//用户查询
router.get("/list", async (ctx) => {
  const { userId, userName, state } = ctx.request.query;
  const { page, skipIndex } = util.pager(ctx.request.query);
  let params = {};
  if (userId) params.userId = userId;
  if (userName) params.userName = userName;
  if (state && state != "0") params.state = state;
  try {
    // 根据条件查询所有的用户列表
    const query = User.find(params, { _id: 0, userPwd: 0 });
    const list = await query.skip(skipIndex).limit(page.pageSize);
    const total = await User.countDocuments(params);

    ctx.body = util.success({
      page: {
        ...page,
        total,
      },
      list,
    });
  } catch (error) {
    ctx.body = util.fail(`查询异常${error.stack}`);
  }
});
//用户删除和批量删除
router.post("/delete", async (ctx) => {
  //待删除的用户ID数组
  const { userIds } = ctx.request.body;
  //User.updateMany({ $or: [{ userId: 10001 }, { userId: 10002 }] });
  const res = await User.updateMany({ userId: { $in: userIds } }, { state: 2 });

  if (res.modifiedCount) {
    ctx.body = util.success(res, `共删除成功${res.modifiedCount}条`);
    return;
  }
  ctx.body = util.fail("删除失败");
});
//用户的新增/编辑
router.post("/operate", async (ctx) => {
  const {
    userId,
    userName,
    userEmail,
    mobile,
    job,
    state,
    roleList,
    deptId,
    action,
  } = ctx.request.body;
  if (action == "add") {
    if (!userName || !userEmail || !deptId) {
      ctx.body = util.fail("参数错误", util.CODE.PARAM_ERROR);
      return;
    }

    const res = await User.findOne({ $or: [{ userName }, { userEmail }] }, '_id userName userEmail')
    
  if(res){
    ctx.body = util.fail(`有重复的用户，信息如下：${res.userName} - ${res.userEmail}`)
  }else{
    const doc = await Counter.findOneAndUpdate({ _id: 'userId' }, { $inc: { sequence_value: 1 } }, { new: true })
    let pwd =  '123456';
    try {
      const user =  new User({
        userId:doc.sequence_value,
        userName,
        userPwd:md5(pwd),
        userEmail,
        role:1,  //默认普通用户
        roleList,
        job,
        state,
        deptId,
        mobile
      })
      user.save();
      // '365014372@qq.com'
      util.sendMail({
        from:'1186968407@qq.com',
        to:userEmail,
        subject:'用户注册密码',
        text:`尊敬的用户您的密码是${pwd}`
      },(state)=>{
          console.log(state);
      })
      
      ctx.body = util.success({},'用户创建成功')
    } catch (error) {
      ctx.body = util.fail(error.stack,'用户创建失败')
    }

  }
  } else {
    if (!deptId) {
      ctx.body = util.fail("部门不能为空", util.CODE.PARAM_ERROR);
      return;
    }

    try {
      const res = await User.findOneAndUpdate(
        { userId },
        { mobile, job, state, roleList, deptId }
      );
      ctx.body = util.success({}, "更新成功");
    } catch (error) {
      ctx.body = util.success(error.stack, "更新失败");
    }
  }
});
//获取用户对应的权限菜单
router.get("/getPermissionList",async (ctx)=>{
   let authorization =  ctx.request.headers.authorization;
   let {data} = util.decoded(authorization)

   let menuList = await getMenuList(data.role,data.roleList)
   let btnActionList = getButtonActionList(JSON.parse(JSON.stringify(menuList)))
   ctx.body = util.success({menuList,btnActionList})
   
})

async function getMenuList(userRole,keysList){
  let rootList = [];
  //管理员
  if(userRole == 0){
    rootList =   await Menu.find({})||[]
  }else{
    //根据用户拥有的角色 获取权限列表
    //先查找用户对应的角色有哪些
    let roleList =  await Role.find({_id:{$in:keysList}})
    let permissionList = [];
    roleList.map(role=>{
      //选中的按钮和父菜单有哪些
      let {checkedKeys,halfCheckedKeys} = role.permissionList;
      permissionList = permissionList.concat([...checkedKeys,...halfCheckedKeys])

    })
    //去重
    permissionList = [...new Set(permissionList)]
    //找到在权限列表里面的菜单 权限列表里面其实是菜单的id
    rootList = await Menu.find({_id:{$in:permissionList}})
  }

  return util.getTreeMenu(rootList,null,[])
}

function getButtonActionList(list){
  const btnActionList = [];
  const deep = (arr)=>{
      while(arr.length){
        let item = arr.pop()
        //有按钮的菜单
        if(item.action){
          item.action.map(action=>{
            btnActionList.push(action.menuCode)
          })
        }
        //没有按钮有子数组 假设一级菜单 则继续递归查找
        if(item.children && !item.action){
           deep(item.children)
        }
      }
  }
  deep(list)
  return btnActionList;
}
module.exports = router;
