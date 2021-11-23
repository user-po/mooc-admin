/**
 * 角色管理模块
 */
const router = require("koa-router")();
const Role = require("./../models/roleSchema");
const util = require("./../utils/util");

router.prefix("/roles");

//查询所有角色列表
router.get("/allList", async (ctx) => {
  try {
    const list = await Role.find({}, "_id roleName");
    ctx.body = util.success(list);
  } catch (error) {
    ctx.body = util.fail(`查询失败${error.stack}`);
  }
});
// 按页获取角色列表
router.get("/list", async (ctx) => {
  const { roleName } = ctx.request.query;
  const { page, skipIndex } = util.pager(ctx.request.query);
  
  try {
    let params = {};
    if (roleName) params.roleName = roleName;
    const query = Role.find(params);
    const list = await query.skip(skipIndex).limit(page.pageSize);
    const total = await Role.countDocuments(params);
    ctx.body = util.success({
      list,
      page: {
        ...page,
        total,
      },
    });
  } catch (error) {
    ctx.body = util.fail(`查询失败：${error.stack}`);
  }
});

//角色的操作 创建 编辑和删除
router.post("/operate", async (ctx) => {
  const { action, _id, roleName, remark } = ctx.request.body;
  let res;
  try {
    if (action == "create") {
      res = await Role.create({ roleName, remark });
    } else if (action == "edit") {
      if (_id) {
        let params = { roleName, remark };
        params.update = new Date();
        res = await Role.findByIdAndUpdate(_id, params);
      } else {
        ctx.body = util.fail(`缺少参数params._id`);
      }
    } else {
      if (_id) {
        res = await Role.findByIdAndRemove(_id);
      } else {
        ctx.body = util.fail(`缺少参数params._id`);
        return;
      }
    }

    ctx.body = util.success(res, `${action}成功`);
  } catch (error) {
    ctx.body = util.fail(`${action}失败`);
  }
});
//更新权限列表
router.post('/update/permission',async (ctx)=>{
    const {_id,permissionList} = ctx.request.body;
    try {
        let params = {permissionList,update:new Date()}
        let res= await Role.findByIdAndUpdate(_id,params)
        ctx.body = util.success('',"权限设置成功")
    } catch (error) {
        ctx.body = util.fail("权限设置失败")
    }
})
module.exports = router;
