/* eslint-disable no-invalid-this*/
/* eslint-disable no-undef*/
const path = require("path");
const {log,checkFileExists,create_browser,from_env,ROOT,path_assignment, warn_errors, scored, checkFilExists} = require("./testutils");
const fs = require("fs");
const net = require('net');
const spawn = require("child_process").spawn;
const util = require('util');
const exec = util.promisify(require("child_process").exec);

const PATH_ASSIGNMENT = path_assignment("blog");
const URL = `file://${path.resolve(path.join(PATH_ASSIGNMENT.replace("%", "%25"), "cv.html"))}`;
// Should the server log be included in the logs?
const TIMEOUT =  parseInt(from_env("TIMEOUT", 2000));
const TEST_PORT =  parseInt(from_env("TEST_PORT", "3001"));

let browser = create_browser();

describe("Tests Práctica 6", function() {
    after(function () {
        warn_errors();
    });

    describe("Prechecks", function () {
	      scored(`Comprobando que existe la carpeta de la entrega: ${PATH_ASSIGNMENT}`,
               -1,
               async function () {
                   this.msg_err = `No se encontró la carpeta '${PATH_ASSIGNMENT}'`;
                   (await checkFileExists(PATH_ASSIGNMENT)).should.be.equal(true);
	             });

        scored(`Comprobar que se han añadido plantillas express-partials`, -1, async function () {
            this.msg_ok = 'Se incluye layout.ejs';
            this.msg_err = 'No se ha encontrado views/layout.ejs';
            fs.existsSync(path.join(PATH_ASSIGNMENT, "views", "layout.ejs")).should.be.equal(true);
        });

        scored(`Comprobar que la migración y el seeder existen`, -1, async function () {
            this.msg_ok = 'Se incluye la migración y el seeder';
            this.msg_err = "No se incluye la migración o el seeder";

            let mig = fs.readdirSync(path.join(PATH_ASSIGNMENT, "migrations")).filter(fn => fn.endsWith('-CreatePostsTable.js'));
            this.msg_err = `No se ha encontrado la migración`;
            (mig.length).should.be.equal(1);
            let seed = fs.readdirSync(path.join(PATH_ASSIGNMENT, "seeders")).filter(fn => fn.endsWith('-FillPostsTable.js'));
            this.msg_err = 'No se ha encontrado el seeder';
            (seed.length).should.be.equal(1);
            // We could use a regex here to check the date
        });

        scored(`Comprobar que los controladores existen`, -1, async function () {
            this.msg_ok = 'Se incluye el controlador de post';
            this.msg_err = "No se incluye el controlador de post";
            post = require(path.resolve(path.join(PATH_ASSIGNMENT, 'controllers', 'post')));
            post.index.should.not.be.undefined;
        })

        scored(`Comprobar que se ha añadido el código para incluir los comandos adecuados`, -1, async function () {
            let rawdata = fs.readFileSync(path.join(PATH_ASSIGNMENT, 'package.json'));
            let pack = JSON.parse(rawdata);
            this.msg_ok = 'Se incluyen todos los scripts/comandos';
            this.msg_err = 'No se han encontrado todos los scripts';
            scripts = {
                "super": "supervisor ./bin/www",
                "migrate": "sequelize db:migrate --url sqlite://$(pwd)/blog.sqlite",  
                "seed": "sequelize db:seed:all --url sqlite://$(pwd)/blog.sqlite",  
                "migrate_win": "sequelize db:migrate --url sqlite://%cd%/blog.sqlite",  
                "seed_win": "sequelize db:seed:all --url sqlite://%cd%/blog.sqlite"  ,
            }
            for(script in scripts){
                this.msg_err = `Falta el comando para ${script}`;
                pack.scripts[script].should.be.equal(scripts[script]);
            }
        })

        scored(`Comprobar que las plantillas express-partials tienen los componentes adecuados`, 1, async function () {
            this.msg_ok = 'Se incluyen todos los elementos necesarios en la plantilla';
            this.msg_err = 'No se ha encontrado todos los elementos necesarios';
            let checks = {
                "layout.ejs": {
                    true: [/<%- body %>/g, /<header/, /<\/header>/, /<nav/, /<\/nav/, /<footer/, /<\/footer>/]
                },
                "index.ejs": {
                    true: [/<h1/, /<\/h1>/],
                    false: [/<header>/, /<\/header>/, /<nav/, /<\/nav>/, /<footer/, /<\/footer>/]
                },
                [path.join("posts", "index.ejs")]: {
                    true: [/<article/, /<\/article>/, /Show/, /Edit/],
                }
            }

            for (fpath in checks) {
                let templ = fs.readFileSync(path.join(PATH_ASSIGNMENT, "views", fpath), "utf8");
                for(status in checks[fpath]) {
                    elements = checks[fpath][status];
                    for(var elem in elements){
                        const shouldbe = (status == 'true');
                        let e = elements[elem];
                        if (shouldbe) {
                            this.msg_err = `${fpath} no incluye ${e}`;
                        } else {
                            this.msg_err = `${fpath} incluye ${e}, pero debería haberse borrado`;
                        }
                        e.test(templ).should.be.equal(shouldbe);
                    }
                }
            }
        });

    });

    describe("Tests funcionales", function () {
        var server;
        const db_filename = 'post.sqlite';
        const db_file = path.resolve(path.join(ROOT, db_filename));

        before(async function() {
            // Crear base de datos nueva y poblarla antes de los tests funcionales. por defecto, el servidor coge post.sqlite del CWD
            try {
                fs.unlinkSync(db_file);
                console.log('Previous test db removed. A new one is going to be created.')
            } catch {
                console.log('Previous test db does not exist. A new one is going to be created.')
            }
            fs.closeSync(fs.openSync(db_file, 'w'));

            let sequelize_cmd = path.join(PATH_ASSIGNMENT, "node_modules", ".bin", "sequelize")
            let db_url = `sqlite://${db_file}`;
            let db_relative_url = `sqlite://${db_filename}`;
            await exec(`${sequelize_cmd} db:migrate --url "${db_url}" --migrations-path ${path.join(PATH_ASSIGNMENT, "migrations")}`)
            log('Lanzada la migración');
            await exec(`${sequelize_cmd} db:seed:all --url "${db_url}" --seeders-path ${path.join(PATH_ASSIGNMENT, "seeders")}`)
            log('Lanzado el seeder');


            let bin_path = path.join(PATH_ASSIGNMENT, "bin", "www");
            server = spawn('node', [bin_path], {env: {PORT: TEST_PORT, DATABASE_URL: db_relative_url}});
            server.stdout.setEncoding('utf-8');
            server.stdout.on('data', function(data) {
                log('Salida del servidor: ', data);
            })
            server.stderr.on('data', function (data) {
                log('EL SERVIDOR HA DADO UN ERROR. SALIDA stderr: ' + data);
            });
            log(`Lanzado el servidor en el puerto ${TEST_PORT}`);
            await new Promise(resolve => setTimeout(resolve, TIMEOUT));
            browser.site = `http://localhost:${TEST_PORT}/`;
            try{
                await browser.visit("/");
                browser.assert.status(200);
            }catch(e){
                console.log("No se ha podido contactar con el servidor.");
                throw(e);
            }
        });

        after(async function() {
            // Borrar base de datos
            await server.kill();
            function sleep(ms) {
                return new Promise((resolve) => {
                  setTimeout(resolve, ms);
                });
              }
              //wait for 1 second for the server to release the sqlite file
             await sleep(1000);

            try {
                fs.unlinkSync(db_file);
            } catch(e){
                console.log("Test db not removed.");
                console.log(e);
                throw(e);
            }
        })

        scored(`Comprobar que se muestra la página de bienvenida`, 0.5, async function () {
            this.msg_err = 'No se muestra la página de bienvenida al visitar /';

            await browser.visit("/");
            browser.assert.status(200)
            browser.assert.element('header#mainHeader.main');
        })

        scored(`Comprobar que se muestran el cv del alumno al visitar /author`, 0.5, async function () {
            this.msg_err = 'No se muestra el cv del alumno al visitar /';

            await browser.visit("/author");
            browser.assert.status(200)

            //res = browser.html();
            //this.msg_err = `No se encuentra contenido XXX en la página de bienvenida`;
            //res.includes(post.title).should.be.equal(true);
        });

        scored(`Comprobar que se muestran los posts`, 1, async function () {
            this.msg_err = 'No se muestra la página con los posts';
            let posts = [
                {id: 1, title: "Primer Post", body: "Esta práctica implementa un Blog."},
                { id:2, title: 'Segundo Post', body: 'Todo el mundo puede crear posts.' },
                { id:3, title: 'Tercer Post', body: 'Cada post puede tener una imagen adjunta.'}
            ];

            await browser.visit("/posts");
            browser.assert.status(200)

            res = browser.html();

            for (idx in posts) {
                let post = posts[idx];
                this.msg_err = `No se encuentra el post "${post.title}" en los posts`;
                res.includes(post.title).should.be.equal(true);                
            }
        })

        scored(`Comprobar que se muestra la página individual de cada posts`, 1, async function () {
            let posts = [
                {id: 1, title: "Primer Post", body: "Esta práctica implementa un Blog."},
                { id:2, title: 'Segundo Post', body: 'Todo el mundo puede crear posts.' },
                { id:3, title: 'Tercer Post', body: 'Cada post puede tener una imagen adjunta.'}
            ];

            for (idx in posts) {
                let post = posts[idx];
                this.msg_err = `No se encuentra el post "${post.title}" en los posts`;
                await browser.visit("/posts/" + post.id);
                this.msg_err = `La página del post "${post.title}" (/posts/${post.id}) no incluye el cuerpo correctamente`;
                //console.log("browser.html(): ", browser.html());
                browser.assert.element('article.postShow');
                browser.html().includes(post.body).should.be.equal(true);

            }
        })

        scored(`Comprobar que se devuelve la imagen de un post al hacer un GET a /posts/:postId/attachment`, 0.5, async function () {
            this.msg_err = 'No se devuelve la imagen de un post al hacer un GET a /posts/:postId/attachment';

            await browser.visit("/posts/1/attachment");
            browser.assert.status(200);
        })

        scored(`Comprobar que se muestran la página creación de un post /posts/new`, 0.5, async function () {
            this.msg_err = 'No se muestra la página de creación de un post al visitar /posts/new';

            await browser.visit("/posts/new");
            browser.assert.status(200);

            //res = browser.html();
            //this.msg_err = `No se encuentra contenido XXX en la página de bienvenida`;
            //res.includes(post.title).should.be.equal(true);
        })

        scored(`Comprobar que se crea un nuevo post en la base de datos al mandar el formulario /posts/new`, 1, async function () {
            this.msg_err = 'No se crea un nuevo post al mandar /posts/new';

            await browser.visit("/posts/new");
            browser.assert.status(200);

            this.msg_err = `La página /posts/new no incluye el formulario de creación de un post correcto`;
            browser.assert.element('#title');
            browser.assert.element('#body');
            browser.assert.element('#enviar');
            await browser.fill('#title','Mi titulo');
            await browser.fill('#body', 'Mi cuerpo');
            await browser.pressButton('#enviar');
            browser.assert.status(200);
            log("POST CREADO. URL devuelta: " + browser.location.href);
            browser.location.href.includes('/posts/4').should.be.equal(true);
        })


        scored(`Comprobar que NO se crea un nuevo post en la base de datos al mandar el formulario /posts/new con los campos vacíos`, 1, async function () {
            this.msg_err = 'No falla al intentar crear un nuevo post al mandar /posts/new con los campos vacíos';

            await browser.visit("/posts/new");
            browser.assert.status(200);

            this.msg_err = `La página /posts/new no incluye el formulario de creación de un post correcto`;
            browser.assert.element('#title');
            browser.assert.element('#body');
            browser.assert.element('#enviar');
            await browser.pressButton('#enviar');
            browser.assert.status(200);
            this.msg_err = `La página a la que ha redirigido el intento de creación de un post vacío no incluye el formulario de creación de un post correcto`;
            log("POST CREADO. URL devuelta: " + browser.location.href);
            //check that the return page contains the form
            browser.assert.element('#title');
            browser.assert.element('#body');
            browser.assert.element('#enviar');
        })
        

        scored(`Comprobar que se atiende a la petición GET de /posts/:postId/edit`, 1, async function () {
                   let posts = [
                        {id: 1, title: "Primer Post", body: "Esta práctica implementa un Blog."},
                        { id:2, title: 'Segundo Post', body: 'Todo el mundo puede crear posts.' },
                        { id:3, title: 'Tercer Post', body: 'Cada post puede tener una imagen adjunta.'}
                    ];

                   for (idx in posts) {
                       let post = posts[idx];
                       this.msg_err = `La página de edición no está disponible`;
                       await browser.visit(`/posts/${post.id}/edit`);
                       browser.assert.status(200);
                       this.msg_err = `La página /posts/new no muestra el formulario con todos los elementos necesarios (#title, #body, #enviar)`;
                       browser.assert.element('#title');
                       browser.assert.element('#body');
                       browser.assert.element('#enviar');
                       this.msg_err = `La página no incluye el cuerpo del post`;
                       browser.html().includes(post.body).should.be.equal(true);
                   }
               })

        scored(`Comprobar que se edita un  post en la base de datos al mandar el formulario /posts/1/edit`, 1, async function () {
                this.msg_err = 'No se edita un post al mandar /posts/1/edit';

                await browser.visit("/posts/1/edit");
                browser.assert.status(200);

                this.msg_err = `La página /posts/1/edit no incluye el formulario de creación de un post correcto`;
                browser.assert.element('#title');
                browser.assert.element('#body');
                browser.assert.element('#enviar');
                await browser.fill('#title','Mi titulo2');
                await browser.fill('#body', 'Mi cuerpo2');
                await browser.pressButton('#enviar');
                browser.assert.status(200);
                log("POST EDITADO. URL devuelta: " + browser.location.href);
                browser.location.href.should.be.equal(`http://localhost:${TEST_PORT}/posts/1`);
                browser.html().includes('Mi titulo2').should.be.equal(true);
        })

        scored(`Comprobar que se pueden borrar los posts`, 1, async function () {
            //this time we don´t use post number 1 because it was edited in the previous test
            let posts = [
                { id:2, title: 'Segundo Post', body: 'Todo el mundo puede crear posts.' },
                { id:3, title: 'Tercer Post', body: 'Cada post puede tener una imagen adjunta.'}
            ];

            this.msg_err = 'No se muestra la página con los posts';
            await browser.visit("/posts");
            browser.assert.status(200)
            res = browser.html();
            this.msg_err = 'El post se sigue mostrando';
            res.includes(posts[0].title).should.be.equal(true);

            for (idx in posts) {
                let post = posts[idx];
                this.msg_err = `No se encuentra el post "${post.title}" en los posts`;

                res.includes(post.title).should.be.equal(true);

                this.msg_err = `La página del post "${post.title}" (/posts/${post.id}) no parece permitir borrar correctamente`;
                await browser.visit(`/posts/${post.id}?_method=DELETE`);

                this.msg_err = `La página de posts sigue mostrando "${post.title}" (/posts/${post.id}) después de haber sido borrado`;
                await browser.visit("/posts");
                browser.assert.status(200)
                res = browser.html();
                res.includes(post.title).should.be.equal(false);
            }
        })


    });

})
