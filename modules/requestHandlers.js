var dbmodel = require('./dbmodule');
var multiparty = require('multiparty');
var fs = require('fs');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;

var requestHandler = function(){}

requestHandler.login = function(req,res) {
	dbmodel.user.findOne({username:req.body.username},function(err,docs) {
		if(err)	return console.error(err);
		if (docs === null || docs === 'undefined' || docs.username === 'undefined') {
			res.send('have no users');
		} else if(req.body.password === docs.password) {
			console.log('login!'+docs.username);
			req.session.uid = docs._id;
			res.redirect('/projects');
		} else {
			res.send('password wrong<br>'+req.body.password + '<br>' + docs.password);
		}
	});
}

requestHandler.register = function(req,res) {
	var user = new dbmodel.user({
		username: req.body.username,
		password: req.body.password,
		email: req.body.email,
		projects: []
	});

	user.save(function(error){
		if(error) {
			console.log(error);
		}		
		res.send('save success!');
	});
}

requestHandler.getProInfo = function(req,res) {
	dbmodel.user.findById(req.session.uid,function(err,docs) {
		if(docs === null || docs === 'undefined'){
			res.send('undefined');
		} else {
			res.send(docs.projects);
		}
	});
}

requestHandler.addNewProject = function(req,res) {
	dbmodel.user.findById(req.session.uid,function(err,docs) {
		if(docs === null || docs === 'undefined') {
			res.send('undefined');
		} else {
			var createDate = getCurrentTime('date');
			docs.projects.push({
				proName: req.body.name,
				autherIdId: docs.username,
				createTime: createDate,
				updateTime: createDate,
				data:{
					elementCounts: 0,
					updateTime: createDate,
					elements: [],
					medias: [],
					startPosition: {
						x: 200,
						y: 200
					}
				}
			});
			docs.save(function(error) {
				if(error){
					console.log(error);
				}
				res.send(docs.projects);
			});
		}
	});
}

requestHandler.jumpToEditor = function(req,res) {
	dbmodel.user.findById(req.session.uid,function(err,docs) {
		if(docs === null || docs === 'undefined') {
			res.send('undefined');
		} else if(docs) {
			docs.projects.map(function(pro) {
				if(pro.proName === req.query.proName) {
					res.render('story-editor-page',{
						title: 'Story Tree Editor',
						style0: '/stylesheets/story_main.css',
						style1: '/stylesheets/canvas.api.css'
					});
				}
			});
		} else {
			res.send('no such projects!');
		}
	});
}

requestHandler.getMedias = function(req,res) {
	dbmodel.user.findById(req.session.uid,function(err,docs) {
		if(docs === null || docs === 'undefined') {
			res.send({
				medias: 'undefined',
				elements: 'undefined'
			});
		} else if(docs) {
			docs.projects.map(function(pro) {
				if(pro.proName === req.query.proName) {
					res.send({
						medias: pro.data.medias,
						info: {
							elements: pro.data.elements,
							startPosition: {
								x: pro.data.startPosition.x,
								y: pro.data.startPosition.y
							}
						}
					});
				}
			});
		} else {
			res.send({medias: null,elements: null});
		}
	});
}

requestHandler.upload = function(req,res) {
	var form = new multiparty.Form();
	var fileName = '';
	var videoPath = '';
	var createDate = getCurrentTime('date');
	var targetDir = req.query.type === 'video'? './public/uploads/videos/'+createDate : './public/uploads/images/'+createDate;
	var fullDir = "E:\\Webstorm_pro\\story_edit\\public\\uploads\\videos\\"+createDate +"\\";
	var url = targetDir.match(/(c)(.+)/)[2];
	var random = randomDir();
	var direxists = fs.existsSync(targetDir);
	if(!direxists)	fs.mkdirSync(targetDir);
	targetDir += '/'+random;
	url += '/'+random;
	fullDir += random+'\\';
	fs.mkdirSync(targetDir);
	form.uploadDir = targetDir;
	form.on('part',function(part) {
		if(!part.filename) return;
	});
	form.on('file',function(name,file) {
		fileName = file.originalFilename;
		var tmp_path = file.path;
		console.log(file.path);
		videoPath = file.path;
	});
	form.parse(req,function(err,fields,files) {
		if(err) {
			console.log(err+' 0');
			res.send({success: false});
			return;
		}
		console.log(fileName);
		fs.rename(videoPath, targetDir+'/'+fileName, function(err) {
			if(err) {
				console.log(err);
			} else {
				if(req.query.type === 'video') {
					var cut = spawn('E:\\Webstorm_pro\\ffmpeg\\bin\\ffmpeg.exe',['-ss','00:00:10','-i',fullDir+fileName,'-y','-f','image2','-t','0.001',fullDir+fileName.match(/[^\.]+/)+'.jpg']);
					cut.on('error', function(err) {
						console.log(err);
					});
					cut.on('close', function(code) {
						console.log(code);
						dbmodel.user.findById(req.session.uid, function (err, docs) {
							if (err) {
								console.log(err + ' 1');
								res.send({success: false});
							} else if (docs) {
								var targetPro = '';
								docs.projects.map(function (pro) {
									if (pro.proName === req.query.proName) {
										if (fileName !== null) {
											pro.data.medias.push({
												imgUrl: url+'/'+fileName.match(/[^\.]+/)+'.jpg',
												videoUrl: url + '/' + fileName
											});
										}
										targetPro = pro;
									}
								});
								docs.save(function (err) {
									if (err) {
										console.log(err + ' 2');
										res.send({success: false});
									} else {
										res.send({
											success: true,
											pro: targetPro
										});
									}
								});
							} else {
								console.log('no such file');
								res.send({success: false});
							}
						});
					});

				} else {
					dbmodel.user.findById(req.session.uid, function(err, docs) {
						if(err) {
							console.log(err+'image upload failed');
							res.send({success: false});
						} else if(docs) {
							docs.projects.map(function(pro) {
								if(pro.proName === req.query.proName) {
									pro.data.elements.map(function(elm) {
										if(elm.id === req.query.elmid) {
											elm.buttons.map(function (button) {
												if(button.targetId === req.query.btnid) {
													button.buttonOptions.backgroundImage = url+'/'+fileName;
												}
											})
										}
									});
								}
							});
							docs.save(function (err) {
								if(err) {
									console.log('upload image save error!');
									res.send({success: false});
								} else {
									res.send({success: true,url: url+'/'+fileName});
								}
							})
						} else {
							console.log('no such file');
							res.send({success: false});
						}
					})
				}



			}
		});

	});
};

requestHandler.saveElementInfo = function(req,res) {
	var saveType = {};
	saveType['pushNewElm'] = pushNewElm;
	saveType['pushNewPath'] = pushNewPath;
	saveType['pushNewPosition'] = pushNewPosition;
	saveType['pushStartPosition'] = pushStartPosition;
	saveType['delElement'] = delElement;
	saveType['delPath'] = delPath;
	dbmodel.user.findById(req.session.uid,function(err,docs) {
		if(err) {
			console.log(err);
			res.send({success: false,errMessage: err});
		} else if(docs !== null && docs !== 'undefined') {
			docs.projects.map(function(pro) {
				if(pro.proName === req.query.proName) {
					saveType[req.query.type](JSON.parse(req.body.elmInfo), pro);
					docs.save(function(err) {
						if(err) {
							console.log('save error!');
							console.log(err);
							res.send({success: false,errMessage: err});
						} else {
							res.send({success: true});
						}
					});
				}
			});
		} else {
			console.log('no such user!');
			res.send({success: 'no such user!'});
		}
	});
}

function pushNewElm(info, pro) {
	// var elmInfo = JSON.parse(req.body.elmInfo);
	pro.data.elements.push(info);
	pro.data.elementCounts = pro.data.elements.length;
	pro.data.updateTime = getCurrentTime('time');
}

function pushNewPath(info, pro) {
	// var pathInfo = JSON.parse(req.body.elmInfo);
	if(!info.isStart) {
		pro.data.elements.map(function(elm) {
			if(elm && elm.id === info.fromId) {
				elm.buttons.push(info.newPathInfo);			
			}
		});
	} else {
		pro.data.elements.map(function(elm) {
			if(elm && elm.id === info.newPathInfo.targetId)
				elm.isStart = true;
		});
	}
}

function pushNewPosition(info, pro) {
	// var positionInfo = JSON.parse(req.body.elmInfo);
	pro.data.elements.map(function(elm) {
		if(elm && elm.id === info.id) {
			elm.position.x = info.position.x;
			elm.position.y = info.position.y;
		}
	});
}

function pushStartPosition(info, pro) {
	// var startPosition = JSON.parse(req.body.elmInfo);
	pro.data.startPosition.x = info.position.x;
	pro.data.startPosition.y = info.position.y;
}

function delElement(info, pro) {
	var id = '';
	// var delInfo = JSON.parse(req.body.elmInfo);
	pro.data.elements.map(function(elm) {
		if(elm.id === info.elmId) {
			id = elm._id;
		}
	});
	if(info.butn !== null && info.butn.length > 0)
		delPath(info, pro);
	pro.data.elements.pull(id);
}

function delPath(info, pro) {
	// var delInfo = JSON.parse(req.body.elmInfo);
	info.butn.map(function(info) {
		if(info.elmId !== 'isStart') {
			pro.data.elements.map(function(elm) {
				if(elm.id === info.elmId) {
					elm.buttons.map(function(butn) {
						if(butn.targetId === info.butnId) {
							elm.buttons.pull(butn._id);
						}
					});
				}
			});
		} else {
			pro.data.elements.map(function(elm) {
				if(elm.id === info.butnId) {
					elm.isStart = false;
				}
			});
		}
	});
}

requestHandler.projectRemove = function(req,res) {
	dbmodel.user.findById(req.session.uid, function(err,docs) {
		docs.findProThenRemove(req.body.proName);
		docs.save(function(err) {
			if(err) console.log(err);
			else res.send(docs.projects);
		});
	});
}

requestHandler.getelements = function(req, res) {
	dbmodel.user.findById(req.session.uid, function(err, docs) {
		docs.projects.map(function(pro) {
			if(pro.proName === req.query.proName) {
				res.send(pro.data.elements);
			}
		});
	});
}

requestHandler.getEditorInfo = function(req, res) {
	dbmodel.user.findById(req.session.uid, function(err, docs) {
		docs.projects.map(function(pro) {
			if(pro.proName === req.query.proName) {
				pro.data.elements.map(function(elm) {
					if(elm.id === req.query.elmId) {
						res.send(elm);
					}
				});
			}
		});
	});
}

requestHandler.saveButnInfo = function(req, res) {
	var butnInfo = JSON.parse(req.body.butnInfo);
	dbmodel.user.findById(req.session.uid, function(err, docs) {
		docs.projects.map(function(pro) {
			if(pro.proName === req.query.proName) {
				pro.data.elements.map(function(elm) {
					if(elm.id === req.query.elmId) {
						elm.buttons = butnInfo;
					}
				});
			}
		});
		docs.save(function(err) {
			if(err) {
				console.log(err);
				res.send({success: false, errMessage: err});
			} else {
				res.send({success: true});
			}
		});
	});
}

function randomDir() {
	var s = [];
	var hexDigits = "0123456789abcdef";
	for (var i = 0; i < 36; i++) {
		s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
	}
	s[14] = "4";
	s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
	s[8] = s[13] = s[18] = s[23] = "_";
	var uuid = s.join("");
	return uuid;
}

function getCurrentTime(type) {
	var date = new Date();
	if(type === 'date') {
		return date.toLocaleDateString();
	} else if(type === 'time') {
		return date.toLocaleString();
	}	
}

module.exports = requestHandler;