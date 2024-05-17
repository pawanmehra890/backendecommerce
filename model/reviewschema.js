const mongoose=require('mongoose')
const ReviewSchema=new mongoose.Schema({
    review:{
        type:String
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    productId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'product'
        
    }
})

module.exports=mongoose.model('review',ReviewSchema)