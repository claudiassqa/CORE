var express = require('express');
var router = express.Router();

const multer = require('multer');
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {fileSize: 20 * 1024 * 1024}});

const postController = require('../controllers/post');


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

module.exports = router;