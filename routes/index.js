var express = require('express');
var router = express.Router();
var requestHandlers = require('../modules/requestHandlers');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET login page. */
router.route('/login')
.get(function(req,res,next){
	res.render('login',{title:'Login',
		logotext:'storytree editor login',
		style0:'/stylesheets/login.style.css',
		style1:''});
})
.post(requestHandlers.login);

/* GET register page. */
router.get('/register',function(req,res,next){
	res.render('register',{title:'register',
		logo:'storytree editor register',
		style0:'/stylesheets/lightgraybody.css',
		style1:'/stylesheets/register.style.css'});
});

router.post('/register/postHandler',requestHandlers.register);

router.route('/projects')
.get(function(req,res) {
	res.render('project-page',{
		title: 'storytree',
		style0: '/stylesheets/projects-page.css',
		style1: '',
		projectsInfo: ''
	});
})
.post(requestHandlers.getProInfo);

router.route('/projectsAddition')
.post(requestHandlers.addNewProject);

router.route('/projects/editor')
.get(requestHandlers.jumpToEditor);

module.exports = router;
