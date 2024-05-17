const express=require('express')
const app=express()
const cors=require('cors')
const userRoutes=require('./controller/user')
const CategoryRoutes=require('./controller/category')
const adminRoutes=require('./controller/adminlogin')
const ProductRouter=require('./controller/addproduct')





app.use(cors())
app.use(express.json())

require('./connection')
app.use('/',userRoutes)
app.use('/',CategoryRoutes)
app.use('/',adminRoutes)
app.use('/',ProductRouter)






app.listen(5000,(req,res)=>{
   console.log('connected server')
})