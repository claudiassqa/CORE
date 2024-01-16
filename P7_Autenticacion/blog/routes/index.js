var express = require('express');
var router = express.Router();

const multer = require('multer');
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {fileSize: 20 * 1024 * 1024}});

const postController = require('../controllers/post');
const sessionController = require('../controllers/session');
const userController = require('../controllers/user');

//autologout
router.all('*',sessionController.deleteExpiredUserSession);


router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/author', (req, res, next) => {
  res.render('author');
});


//PRACTICA 6
router.param('postId', postController.load);
router.get('/posts/:postId(\\d+)/attachment', postController.attachment);
router.get('/posts', postController.index);
router.get('/posts/:postId(\\d+)', postController.show);
router.get('/posts/new', postController.new);
router.post('/posts', upload.single('image'), postController.create);
router.get('/posts/:postId(\\d+)/edit', postController.edit);
router.put('/posts/:postId(\\d+)', upload.single('image'), postController.update);
router.delete('/posts/:postId(\\d+)', postController.destroy);

//PRACTICA 7
router.get('/users',                    userController.index);
router.get('/users/:userId(\\d+)',      userController.show);
router.get('/users/new',                userController.new);
router.post('/users',                   userController.create);
router.get('/users/:userId(\\d+)/edit', userController.edit);
router.put('/users/:userId(\\d+)',      userController.update);
router.delete('/users/:userId(\\d+)',   userController.destroy);

// Routes for the resource /session
router.get('/login',    sessionController.new);     // login form
router.post('/login',   sessionController.create);  // create sesion
router.delete('/login', sessionController.destroy); // close sesion


module.exports = router;