const router = require('koa-router')()
const util = require('./../utils/util')
const Dept = require('./../models/deptSchema')

router.prefix('/dept')

// 部门树形列表

router.get('/list', async (ctx) => {
    let { deptName } = ctx.request.query;
    let params = {}
    if (deptName) params.deptName = deptName;
    let rootList = await Dept.find(params)
  
    if (deptName) {
        ctx.body = util.success(rootList);
    } else {
        let treeList = getTreeDept(rootList, null, [])
       
        ctx.body = util.success(treeList)
    }
})

//递归生成树
function getTreeDept(rootList,id,list){
      for(let i=0;i<rootList.length;++i){
          let item = rootList[i];
          if(String(item.parentId.slice().pop())==String(id)){
              list.push(item._doc)
          }
      }

      list.map(item=>{
          item.children = [];
          getTreeDept(rootList,item._id,item.children)
          if(item.children.length==0){
                delete item.children;
          }
      })
      return list;
}
// 部门操作：创建、编辑、删除
router.post('/operate',async (ctx)=>{
    const { _id, action, ...params } = ctx.request.body;
    let res;

    try {
        if(action=='create'){
            await Dept.create(params)
        }else if(action=='edit'){
            params.updateTime = new Date()
            await Dept.findByIdAndUpdate(_id, params)
        }else{
            await Dept.findByIdAndRemove(_id)
            await Dept.deleteMany({ parentId: { $all: [_id] } })
        }
        ctx.body = util.success({}, `${action}成功`)
        
    } catch (error) {
        ctx.body = util.fail(error.stack)
    }
})

module.exports = router;