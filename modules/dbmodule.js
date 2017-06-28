var mongoose = require('mongoose');
var config = require('../config/config');
var db = require('./connectdb');

var Schema = mongoose.Schema;

//故事线模式数据库结构
//包含user信息和project信息
var button = new Schema({
	targetId:String,
	buttonOptions:{
		position:{
			x:Number,
			y:Number
		},		
		size:{
			x:Number,
			y:Number
		},
		color:String,
		name:String,
		hideAnimationSpeed:Number,
		fontSize:Number,
		fontColor:String,
		radius:Number,
		borderWidth:String,
		borderColor:String,
		borderStyle:String,
		backgroundImage:String,
		start:Number,
		end:Number
	}
});

var elements = new Schema({
	videoUrl:String,
	imgUrl: String,
	name:String,
	id:String,
	position:{
		x:Number,
		y:Number
	},
	duration:Number,
	buttons:[button],
	isStart: Boolean
});

var medias = new Schema({
	imgUrl: String,
	videoUrl: String
});

var projectModel = new Schema({
	proId:String,
	proName:String,
	autherId:String,
	proType:String,
	createTime:String,
	updateTime:String,
	data:{
		elementCounts: Number,
		updateTime: String,
		medias: [medias],
		elements: [elements],
		startPosition: {
			x: Number,
			y: Number
		}
	}
});

var userModel = new Schema({
	username:{type:String,require:true},
	password:{type:String,require:true},
	email:{type:String,require:true},
	projects:[projectModel]
});

userModel.methods.findProThenRemove = function(proName) {
	var id = '';
	this.projects.map(function(pro) {
		if(pro.proName === proName) id = pro._id;
	});
	this.projects.pull(id);
}

module.exports = {
	user: db.model('user',userModel)
}