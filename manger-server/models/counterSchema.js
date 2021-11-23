const mongoose = require('mongoose')
//维护用户ID自增长
const counterSchema = mongoose.Schema({
     _id:String,
     sequence_value:Number
})
//第三个参数集合的名称
module.exports = mongoose.model("counter",counterSchema,"counters")