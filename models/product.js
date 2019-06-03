var mongoose=require("mongoose");

var schema=new mongoose.Schema({
	imagepath:{type:String,required:true},
	title:{type:String,required:true},
	description:{type:String,required:true},
	Price:{type:Number,required:true}
});

module.exports=mongoose.model('Product',schema);

