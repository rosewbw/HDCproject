var express = require('express');
var router = express.Router();
var requestHandlers = require('../modules/requestHandlers');

router.get('/', function(req,res,next) {
	res.send('got it');
});

router.get('/getmedias',requestHandlers.getMedias);

router.post('/uploading',requestHandlers.upload);

router.post('/saveElementInfo',requestHandlers.saveElementInfo);

router.post('/projectRemove',requestHandlers.projectRemove);

router.get('/getelements',requestHandlers.getelements);

router.get('/getEditorInfo',requestHandlers.getEditorInfo);

router.post('/saveButnInfo',requestHandlers.saveButnInfo);

module.exports = router;