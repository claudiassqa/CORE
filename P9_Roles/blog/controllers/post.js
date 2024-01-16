const Sequelize = require("sequelize");
const {models} = require("../models");

/*
Este método saca de la BBDD el post cuyo id es igual al valor pasado en
el parámetro de ruta :postId, y los guardará en el atributo load del objeto req
el objeto post recuperado de la BBDD estará disponible en req.load.post
 */
exports.load = async (req, res, next, postId) => {
    try {
        const post = await models.Post.findByPk(postId, {
            include: [
                {model: models.Attachment, as: 'attachment'},
                {model: models.User, as: 'author'}
            ]
        });
        if (post) {
            req.load = {...req.load, post};
            next();
        } else {
            throw new Error('There is no post with id=' + postId);
        }
    } catch (error) {
        next(error);
    }
};

/*
acceder a la imagen adjunta de post indicado por el parámetro de ruta postId.
 */
exports.attachment = (req, res, next) => {
    const {post} = req.load;
    const {attachment} = post;
    if (!attachment) {
        res.redirect("/images/none.png");
    } else if (attachment.image) {
        res.type(attachment.mime);
        res.send(Buffer.from(attachment.image.toString(), 'base64'));
    } else if (attachment.url) {
        res.redirect(attachment.url);
    } else {
        res.redirect("/images/none.png");
    }
};

/*
devolver una página mostrando todos los posts almacenados en la BBDD
Debe recuperar de la base de datos todos los posts existentes usando
el método findAll del modelo Post
Debe enviar una respuesta HTTP renderizando la vista /posts/index.ejs
 */
exports.index = async (req, res, next) => {
    try {
        const findOptions = {
            include: [
                {model: models.Attachment, as: 'attachment'},
                {model: models.User, as: 'author'}
            ]
        };
        const posts = await models.Post.findAll(findOptions);
        res.render('posts/index.ejs', {posts});
    } catch (error) {
        next(error);
    }
};

/*
debe recuperar el post a mostrar de req.load.post
enviará una respuesta HTTP renderizando la vista /posts/show.ejs
 */
exports.show = (req, res, next) => {
    const {post} = req.load;
    res.render('posts/show', {post});
};

/*
enviará un formulario al navegador renderizando la vista views/posts/new.ejs
 */
exports.new = (req, res, next) => {
    const post = {
        title: "",
        body: ""
    };
    res.render('posts/new', {post});
};

/*
creará un nuevo post con los datos introducidos en el formulario new.
En caso de que se produzcan errores de validación, debe presentarse
el formulario otra vez para que el usuario corrija los errores detectados
Si la creación del post se realiza con éxito, este middleware responderá al
navegador con una solicitud de redirección a la ruta /posts/:postId para mostrar el post creado.
 */
exports.create = async (req, res, next) => {
    const {title, body} = req.body;

    const authorId = req.session.loginUser?.id;

    let post;
    try {
        post = models.Post.build({
            title,
            body,
            authorId
        });

        post = await post.save({fields: ["title", "body","authorId"]});
        console.log('Post creado con éxito.');

        try {
            if (!req.file) {
                console.log('Info: Se requiere una foto.');
                return;
            }

            await createPostAttachment(req, post);
        } catch (error) {
            console.log('Error: Failed to create attachment: ' + error.message);
        } finally {
            res.redirect('/posts/' + post.id);
        }
    } catch (error) {
        if (error instanceof (Sequelize.ValidationError)) {
            console.log('Errores en el formulario:');
            error.errors.forEach(({message}) => console.log(message));
            res.render('posts/new', {post});
        } else {
            next(error);
        }
    }
};

/*
Si en la petición HTTP se recibe un fichero de imagen adjunto,
debe guardarse en la tabla de Attachments y asociarlo con el post creado
 */
const createPostAttachment = async (req, post) => {

    const image = req.file.buffer.toString('base64');
    const url = `${req.protocol}://${req.get('host')}/posts/${post.id}/attachment`;

    // Create the new attachment into the data base.
    const attachment = await models.Attachment.create({
        mime: req.file.mimetype,
        image,
        url
    });
    await post.setAttachment(attachment);
    console.log('Success: Attachment saved successfully.');
};

/*
sacará de la BBDD el objeto post indicado por el parámetro de
ruta :postId, y enviará un formulario al navegador renderizando
la vista views/posts/edit.ejs
 */
exports.edit = (req, res, next) => {
    const {post} = req.load;
    res.render('posts/edit', {post});
};

/*
sacará de la BBDD el objeto post indicado por el parámetro
de ruta :postId, actualizará sus propiedades con los valores introducidos
en el formulario edit, y actualizará los valores en la BBDD
Si se recibe un fichero de imagen adjunto, debe borrarse el adjunto
antiguo de la tabla de Attachments, guardar el nuevo adjunto, y actualizar la asociación
 */
exports.update = async (req, res, next) => {
    const {post} = req.load;

    post.title = req.body.title;
    post.body = req.body.body;

    try {
        await post.save({fields: ["title", "body"]});
        console.log('Post editado exitosamente.');

        try {
            if (!req.file) {
                console.log('Info: Foto no cambiada.');
                return;
            }

            // Delete old attachment.
            if (post.attachment) {
                await post.attachment.destroy();
                await post.setAttachment();
            }
            
            // Create the post attachment
            await createPostAttachment(req, post);
        } catch (error) {
            console.log('Error: Fallo guardando la foto: ' + error.message);
        } finally {
            res.redirect('/posts/' + post.id);
        }
    } catch (error) {
        if (error instanceof (Sequelize.ValidationError)) {
            console.log('Errores en el formulario:');
            error.errors.forEach(({message}) => console.log(message));
            res.render('posts/edit', {post});
        } else {
            next(error);
        }
    }
};

/*
 borrará el post y su imagen adjunta, y responderá al navegador
 con una solicitud de redirección a la ruta /posts para mostrar
 la lista de posts existentes.
 */
exports.destroy = async (req, res, next) => {
    const attachment = req.load.post.attachment;

    try {
        await req.load.post.destroy();
        attachment && await attachment.destroy();
        console.log('Post eliminado con éxito.');
        res.redirect('/posts');
    } catch (error) {
        console.log('Error eliminando Post: ' + error.message);

        next(error);
    }
};

/*
Este middleware debe abortar la petición en curso si el usuario logueado no es un administrador,
o no es el autor del post al que se refiere el parámetro de ruta :postId.
*/
exports.adminOrAuthorRequired = (req, res, next) => {
    const {post} = req.load;
    const isAdmin = !!req.session.loginUser?.isAdmin;
    const isAuthor = post.authorId === req.session.loginUser?.id;
    
    if(isAdmin || isAuthor){
        next();
    } else{
        console.log('Petición denegada, no es admin or author');
        res.send(403);
    }
};