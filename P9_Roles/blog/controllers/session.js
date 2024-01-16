const Sequelize = require("sequelize");
const {models} = require("../models");
const url = require('url');


// This variable contains the maximum inactivity time allowed without 
// making requests.
// If the logged user does not make any new request during this time, 
// then the user's session will be closed.
// The value is in milliseconds.
// 5 minutes.
const maxIdleTime = 5*60*1000;

/*
Middleware used to destroy the user's session if the inactivity time
has been exceeded.
 */
exports.deleteExpiredUserSession = (req, res, next) => {
    if (req.session.loginUser ) { // There exista user's session
        if ( req.session.loginUser.expires < Date.now() ) { // Expired
            delete req.session.loginUser; // Logout
            console.log('Info: User session has expired.');
        } else { // Not expired. Reset value.
            req.session.loginUser.expires = Date.now() + maxIdleTime;
        }
    }
    next();
};


/*
User authentication: Checks that the user is registered.
Searches a user with the given username, and checks that  the password is correct.
If the authentication is correct, then returns the user object.
If the authentication fails, then returns null.
 */
const authenticate = async (username, password) => {
    const user = await models.User.findOne({where: {username: username}})
    return user?.verifyPassword(password) ? user : null;
};



// GET /login -- Login form
exports.new = (req, res, next) => {
    res.render('session/new', {
        loginLocals: {
            errorInLogin: false,
            mensajeError: ""
        }
    });
};


// POST /login -- Create the session if the user authenticates successfully
exports.create = async (req, res, next) => {

    const username = req.body.username ?? "";
    const password = req.body.password ?? "";

    try {
        const user = await authenticate(username, password);
        if (user) {
            console.log('Info: Authentication successful.');

            // Create req.session.user and save id and username fields.
            // The existence of req.session.user indicates that the session exists.
            // I also save the moment when the session will expire due to inactivity.
            req.session.loginUser = {
                id: user.id,
                username: user.username,
                isAdmin: user.isAdmin,
                expires: Date.now() + maxIdleTime
            };

            res.redirect("/");
        } else {
            console.log('Error: Authentication has failed. Retry it again.');
            res.render('session/new', {
                loginLocals: {
                    errorInLogin: true,
                    mensajeError: "Contraseña incorrecta"
                }
            });
        }
    } catch (error) {
        console.log('Error: An error has occurred: ' + error);
        next(error);
    }
};


// DELETE /login --  Close the session
exports.destroy = (req, res, next) => {

    delete req.session.loginUser;

    res.redirect("/login");
};

/*
mw control si el usuario esta logueado
*/
exports.loginRequired = (req, res, next) => {
    if(req.session.loginUser){
        next();
    }else{
        res.redirect('/login');
    }
};

/*
aborta la petición en curso si el usuario logueado no es un administrador
o no es el usuario al que se refiere el parámetro de ruta :userId
*/
exports.adminOrMyselfRequired = (req, res, next) => {
    const isAdmin = !!req.session.loginUser?.isAdmin;
    const isMyself = req.load.user.id === req.session.loginUser?.id;
    if (isAdmin || isMyself) {
        next();
    } else {
        console.log('Ruta prohibida: No es el usuario indicado o administrador.');
        res.send(403);
    }
};

/*
solo permite la ejecución de la petición en curso si el usuario logueado es un administrador.
*/
exports.adminRequired = (req, res, next) => {
    if(!!req.session.loginUser?.isAdmin){
        next();
    } else{
        console.log('Petición denegada, se requieren permisos de administrador.');
        res.send(403);
    }
};