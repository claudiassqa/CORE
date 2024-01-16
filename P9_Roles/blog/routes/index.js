var express = require('express');
var router = express.Router();

const multer = require('multer');
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {fileSize: 20 * 1024 * 1024}});

//importar los controladores
const postController = require('../controllers/post');
const sessionController = require('../controllers/session');
const userController = require('../controllers/user');

//autologout
router.all('*',sessionController.deleteExpiredUserSession);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

/* GET author page. */
router.get('/author', function(req, res, next) {
  res.render('author');
});



/*
RUTAS PARA POSTS
 */

//Algunas de las definiciones de rutas usan un parámetro de ruta llamado :postId.
router.param('postId', postController.load);

//acceder a la imagen adjunta de post indicado por el parámetro de ruta postId
router.get('/posts/:postId(\\d+)/attachment', postController.attachment);

//devolver una página mostrando todos los posts almacenados en la BBDD cuando reciba la petición
router.get('/posts', postController.index);

//devolver una página mostrando el post de la BBDD cuyo id es igual al valor pasado en el parámetro de ruta :postId
router.get('/posts/:postId(\\d+)', postController.show);

//Muestra una página con un formulario para crear un nuevo post.
router.get('/posts/new', sessionController.loginRequired, postController.new);

//Invocado por el formulario anterior para crear un post con los datos introducidos.
router.post('/posts', upload.single('image'), postController.create);

//Muestra una página con un formulario para editar el post cuyo id es igual al valor pasado en el parámetro de ruta :postId.
router.get('/posts/:postId(\\d+)/edit', postController.adminOrAuthorRequired, postController.edit);

//Invocado por el formulario anterior para actualizar el post con id igual a :postId.
router.put('/posts/:postId(\\d+)', upload.single('image'), postController.update);

// debe borrar de la BBDD el post cuyo id es igual al valor pasado en el parámetro de ruta :postId
router.delete('/posts/:postId(\\d+)', postController.adminOrAuthorRequired, postController.destroy);

/*
RUTAS PARA USERS
 */
router.param('userId', userController.load);
router.get('/users',                    sessionController.adminRequired, userController.index);
router.get('/users/:userId(\\d+)',      sessionController.adminOrMyselfRequired, userController.show);
router.get('/users/new',                sessionController.adminRequired, userController.new);
router.post('/users',                   sessionController.adminRequired, userController.create);
router.get('/users/:userId(\\d+)/edit', sessionController.loginRequired, sessionController.adminOrMyselfRequired, userController.edit);
router.put('/users/:userId(\\d+)',      sessionController.adminOrMyselfRequired, userController.update);
router.delete('/users/:userId(\\d+)',   sessionController.loginRequired, sessionController.adminOrMyselfRequired, userController.destroy);

//RUTAS PARA SESIONES
router.get('/login',    sessionController.new);     // login form
router.post('/login',   sessionController.create);  // create sesion
router.delete('/login', sessionController.destroy); // close sesion

module.exports = router;