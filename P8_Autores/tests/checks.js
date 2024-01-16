/* eslint-disable no-invalid-this*/
/* eslint-disable no-undef*/
const path = require("path");
const {log,has_failed,checkFileExists,create_browser,from_env,DEBUG,ROOT,path_assignment, warn_errors, scored, checkFilExists} = require("./testutils");
const fs = require("fs");
const net = require('net');
const spawn = require("child_process").spawn;
const util = require('util');
const exec = util.promisify(require("child_process").exec);
const Sequelize = require('sequelize');

const PATH_ASSIGNMENT = path_assignment("blog");
const URL = `file://${path.resolve(path.join(PATH_ASSIGNMENT.replace("%", "%25"), "cv.html"))}`;
// Should the server log be included in the logs?
const TIMEOUT =  parseInt(from_env("TIMEOUT", 6000));
const TEST_PORT =  parseInt(from_env("TEST_PORT", "3001"));

let browser = create_browser();

var server;


describe("Tests Práctica 7", function() {
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

        scored(`Comprobar que la migración y el seeder para Usuarios existen (P7)`, -1, async function () {
            this.msg_ok = 'Se incluye la migración y el seeder';
            this.msg_err = "No se incluye la migración o el seeder";

            let mig = fs.readdirSync(path.join(PATH_ASSIGNMENT, "migrations")).filter(fn => fn.endsWith('-CreateUsersTable.js'));
            this.msg_err = `No se ha encontrado la migración`;

            (mig.length).should.be.equal(1);
            this.msg_err = `La migración no incluye el campo email`;
            log(mig[0]);
            let templ = fs.readFileSync(path.join(PATH_ASSIGNMENT, "migrations", mig[0]));
            /email/.test(templ).should.be.equal(true);


            let seed = fs.readdirSync(path.join(PATH_ASSIGNMENT, "seeders")).filter(fn => fn.endsWith('-FillUsersTable.js'));
            this.msg_err = 'No se ha encontrado el seeder';
            (seed.length).should.be.equal(1);
            // We could use a regex here to check the date
        });

        scored(`Comprobar que la migración añadir authorId existe`, -1, async function () {
            this.msg_ok = 'Se incluye la migración';
            this.msg_err = "No se incluye la migración o el seeder";

            let mig = fs.readdirSync(path.join(PATH_ASSIGNMENT, "migrations")).filter(fn => fn.endsWith('-AddAuthorIdToPostsTable.js'));
            this.msg_err = `No se ha encontrado la migración`;

            (mig.length).should.be.equal(1);
            this.msg_err = `La migración no incluye el campo authorId`;
            log(mig[0]);
            let templ = fs.readFileSync(path.join(PATH_ASSIGNMENT, "migrations", mig[0]));
            /authorId/.test(templ).should.be.equal(true);
        });

        scored(`Comprobar que los controladores existen`, -1, async function () {
            this.msg_ok = 'Se incluyen los controladores de usuarios y sesiones';
            this.msg_err = "No se incluye el controlador de usuarios";
            await checkFileExists(path.resolve(path.join(PATH_ASSIGNMENT, 'controllers', 'user')));
            this.msg_err = "No se incluye el controlador de sesiones";
            await checkFileExists(path.resolve(path.join(PATH_ASSIGNMENT, 'controllers', 'session')));
        });

        scored(`Comprobar que se ha añadido el código para incluir los comandos adecuados (P6)`, -1, async function () {
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
            };
            for(script in scripts){
                this.msg_err = `Falta el comando para ${script}`;
                pack.scripts[script].should.be.equal(scripts[script]);
            }
        });

    });

    describe("Tests funcionales", function () {
        var server;
        var sequelize;
        const db_filename = 'blog.sqlite';
        const db_file = path.resolve(path.join(ROOT, db_filename));

        const users = [
            {id: 1, username: "admin", email: "admin@core.example", password: "1234"},
            {id: 2, username: "pepe", email: "pepe@core.example", password: "5678"},
        ];

        before(async function() {
            if(has_failed()){
                return;
            }
            // Crear base de datos nueva y poblarla antes de los tests funcionales. por defecto, el servidor coge post.sqlite del CWD
            try {
                fs.unlinkSync(db_file);
                log('Previous test db removed. A new one is going to be created.')
            } catch {
                log('Previous test db does not exist. A new one is going to be created.')
            }
            fs.closeSync(fs.openSync(db_file, 'w'));

            let sequelize_cmd = path.join(PATH_ASSIGNMENT, "node_modules", ".bin", "sequelize")
            let db_url = `sqlite://${db_file}`;
            let db_relative_url = `sqlite://${db_filename}`;
            sequelize = new Sequelize(db_relative_url);
            await exec(`${sequelize_cmd} db:migrate --url "${db_url}" --migrations-path ${path.join(PATH_ASSIGNMENT, "migrations")}`);
            log('Lanzada la migración');
            await exec(`${sequelize_cmd} db:seed:all --url "${db_url}" --seeders-path ${path.join(PATH_ASSIGNMENT, "seeders")}`);
            log('Lanzado el seeder');


            let bin_path = path.join(PATH_ASSIGNMENT, "bin", "www");
            server = spawn('node', [bin_path], {env: {PORT: TEST_PORT, DATABASE_URL: db_relative_url}});
            server.stdout.setEncoding('utf-8');
            server.stdout.on('data', function(data) {
                log('Salida del servidor: ', data);
            });
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

            if(typeof server !== 'undefined') {
                await server.kill();
                function sleep(ms) {
                    return new Promise((resolve) => {
                        setTimeout(resolve, ms);
                    });
                }
                //wait for 1 second for the server to release the sqlite file
                await sleep(1000);
            }

            try {
                fs.unlinkSync(db_file);
            } catch(e){
                log("Test db not removed.");
                log(e);
            }
        });

        scored(`Si hay un usuario logueado y crea un post, entonces el campo **authorId** del post debe ser igual al **id** del usuario logueado.`, 2.0, async function() {

            for(user of users) {
                await browser.visit(`/login?_method=DELETE`);
                await browser.visit(`/login`);
                this.msg_err = `No se ha podido hacer login con ${user.username} y ${user.password}`;

                browser.assert.status(200)
                await browser.fill('#username', user.username);
                await browser.fill('#password', user.password);
                await browser.pressButton('input[name=commit]');
                // It should not redirect to the login page
                log(browser.location.href);
                browser.location.href.includes("login").should.be.equal(false);


                this.msg_err = 'No se muestra la página de creación de posts';

                await browser.visit("/posts/new");
                browser.assert.status(200);

                this.msg_err = 'No se puede crear un nuevo post';
                browser.assert.element('#title');
                browser.assert.element('#body');
                browser.assert.element('#enviar');
                const title = `Titulo con usuario ${user.username} raw`;
                const body = `Cuerpo con usuario ${user.username} raw`;
                await browser.fill('#title', title);
                await browser.fill('#body', body);
                await browser.pressButton('#enviar');
                browser.assert.status(200);

                this.msg_err = `No se encuentra el post creado en la base de datos`;

                const [res, metadata] = await sequelize.query(`SELECT * from Posts where title = ? and body = ?`, {
                    logging: DEBUG,
                    raw: true,
                    replacements: [title, body],
                });
                log(res);
                (res.length).should.be.equal(1);
                this.msg_err = `La nuevo post no tiene el campo authorId adecuado (Se espera ${user.id}, se obtiene ${res[0].authorId})`;
                res[0].authorId.should.be.equal(user.id);
            }
        });

        scored(`Si no hay un usuario logueado y se crea un post, entonces el campo **authorId** del post debe estar vacío.`, 1.5, async function() {
            await browser.visit(`/login?_method=DELETE`);
            this.msg_err = 'No se muestra la página de creación de posts';

            await browser.visit("/posts/new");
            browser.assert.status(200);

            this.msg_err = 'No se puede crear un nuevo post';
            browser.assert.element('#title');
            browser.assert.element('#body');
            browser.assert.element('#enviar');
            const title = 'Post con usuario anónimo';
            const body = 'Cuerpo con usuario anónimo';
            await browser.fill('#title', title);
            await browser.fill('#body', body);
            await browser.pressButton('#enviar');
            browser.assert.status(200);

            this.msg_err = `No se encuentra el post creado en la base de datos`;

            const [res, metadata] = await sequelize.query(`SELECT * from Posts where title = ? and body = ?`, {
                logging: DEBUG,
                raw: true,
                replacements: [title, body],
            });
            log(res);
            (res.length).should.be.equal(1);
            this.msg_err = `La nuevo post no tiene el campo authorId en blanco (Se obtuvo ${res[0].authorId})`;
            should.not.exist(res[0].authorId);
        });

        scored(`Si un post tiene autor, entonces la vista **show** de ese post debe mostrar el nombre del autor.`, 2.0, async function() {
            for(user of users) {
                await browser.visit(`/login?_method=DELETE`);
                await browser.visit(`/login`);
                this.msg_err = `No se ha podido hacer login con ${user.username} y ${user.password}`;

                browser.assert.status(200)
                await browser.fill('#username', user.username);
                await browser.fill('#password', user.password);
                await browser.pressButton('input[name=commit]');
                // It should not redirect to the login page
                log(browser.location.href);
                browser.location.href.includes("login").should.be.equal(false);


                this.msg_err = 'No se muestra la página de creación de posts';

                await browser.visit("/posts/new");
                browser.assert.status(200);

                this.msg_err = 'No se puede crear un nuevo post';
                browser.assert.element('#title');
                browser.assert.element('#body');
                browser.assert.element('#enviar');
                await browser.fill('#title','Post con usuario');
                await browser.fill('#body', 'Cuerpo con usuario');
                await browser.pressButton('#enviar');
                browser.assert.status(200);

                this.msg_err = `La página de visualización del nuevo post no muestra el nombre del autor correcto`;
                log("POST CREADO. URL devuelta: " + browser.location.href);
                browser.location.href.includes('/posts/').should.be.equal(true);
                log(browser.html());
                browser.assert.element('#author');
                browser.html().includes(user.username).should.be.equal(true);
            }
        });

        scored(`Si un post no tiene autor, entonces la vista **show** de ese post debe mostrar el texto **Anonymous** como nombre del autor.`, 1.5, async function() {
                await browser.visit(`/login?_method=DELETE`);
                await browser.visit(`/login`);

                await browser.visit("/posts/new");
                browser.assert.status(200);

                this.msg_err = 'No se puede crear un nuevo post';
                browser.assert.element('#title');
                browser.assert.element('#body');
                browser.assert.element('#enviar');
                await browser.fill('#title','Post con usuario anónimo');
                await browser.fill('#body', 'Cuerpo con usuario anónimo');
                await browser.pressButton('#enviar');
                browser.assert.status(200);

                this.msg_err = `La página de visualización del nuevo post no muestra el nombre del autor correcto`;
                log("POST CREADO. URL devuelta: " + browser.location.href);
                browser.location.href.includes('/posts/').should.be.equal(true);
                log(browser.html());
                browser.assert.element('#author');
                browser.html().includes("Anonymous").should.be.equal(true);
        });

        scored(`La vista **index** debe mostrar el nombre del autor o el texto **Anonymous** para todos los posts listados.`, 3.0, async function() {
            await browser.visit("/posts/");

            for(const el of browser.queryAll('.author')) {
                log(el.innerHTML);
                // The author should be one of the seeder values or anonymous
                /pepe|admin|Anonymous/.test(el.innerHTML).should.be.equal(true);
            }
        });
    });

})
