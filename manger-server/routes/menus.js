/**
 * 菜单管理模块
 */
const router = require("koa-router")();
const Menu = require("./../models/menuSchema");
const util = require("./../utils/util");

router.prefix("/menu");

//菜单查询列表
router.get('/list',async (ctx)=>{
    const { menuName,menuState } = ctx.request.query;
    const params={}
    if(menuName) params.menuName = menuName;
    if(menuState) params.menuState = menuState;
    let rootList = await  Menu.find(params) || []
    //一级菜单
    const premissionList = util.getTreeMenu(rootList,null,[])
    ctx.body = util.success(premissionList)
})

//菜单编辑 新建 删除
router.post("/operate", async (ctx) => {
  const { _id, action, ...params } = ctx.request.body;
  let res, info;

  try {
    if (action == "add") {
      res = await  Menu.create(params);
    
      //创建二级菜单后直接创建一个按钮
      if(params.component){
        await Menu.create({
          action:"add",
          menuCode:`${params.path.split("/")[2]}-query`,
          menuName:"查看",
          menuState:1,
          menuType:2,
          parentId:[...params.parentId,res._id]
        })
      }
      
      info = "创建成功";
    } else if (action == "edit") {
      params.updateTime = new Date();
      res = await Menu.findByIdAndUpdate(_id, params);
      info = "编辑成功";
    } else {
      res = await Menu.findByIdAndRemove(_id);
      //只要在$all数组里面的都删除
      await Menu.deleteMany({ parentId: { $all: [_id] } });
      info = "删除成功";
     
    }
    ctx.body = util.success("", info);
  } catch (error) {
    ctx.body = util.fail(error.stack);
  }
 
});

module.exports = router;
