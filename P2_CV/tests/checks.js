/* eslint-disable no-invalid-this*/
/* eslint-disable no-undef*/
// IMPORTS
const path = require("path");
const { create_browser, path_assignment, warn_errors, scored, checkFileExists, getEmailAndToken, getEmailAndToken2 } = require("./testutils");
const fs = require("fs");
const net = require('net');


const URL = `file://${path.resolve(path.join(path_assignment.replace("%", "%25"), "cv.html"))}`;

let browser = create_browser();


describe("Tests Práctica 2", function () {
    after(function () {
        warn_errors();
    });

    describe("Prechecks", function () {
        scored(`Comprobando que existe la carpeta de la entrega: ${path_assignment}`,
            -1,
            async function () {
                this.msg_err = `No se encontró la carpeta '${path_assignment}'`;
                (await checkFileExists(path_assignment)).should.be.equal(true);
            });

        scored(`Existe el fichero cv.html`, -1, async function () {
            let f = path.join(path_assignment, "cv.html");
            this.msg_err = `No existe el fichero ${f}`;
            (await checkFileExists(f)).should.equal(true);
            this.msg_err = "No se pudo abrir el CV en el navegador virtual.";
            await browser.visit(URL);
            browser.assert.status(200);
            (await checkFileExists(f)).should.equal(true);
        });

    });

    describe("Tests funcionales", function () {

        let checks = {
            "cv.html": {
                true: [/<html/, /<\/html>/, /<head/, /<\/head>/, /<body/, /<\/body>/]
            },
            "cv.css": {
                true: [/body/, /section/, /background-color/],
            }
        }

        scored(`Existe el esqueleto básico del HTML`, 1, async function () {
            fpath = 'cv.html';
            let templ = fs.readFileSync(path.join(path_assignment, fpath), "utf8");
            for (status in checks[fpath]) {
                elements = checks[fpath][status];
                for (var elem in elements) {
                    let e = elements[elem];
                    if (status) {
                        this.msg_err = `${fpath} no incluye ${e}`;
                    } else {
                        this.msg_err = `${fpath} incluye ${e}, pero debería haberse borrado`;
                    }
                    e.test(templ).should.be.equal((status == 'true'));
                }
            }
        });

        scored(`La página web incluye la hoja de estilos (CSS) cv.css`, 1, async function () {
            let f = path.join(path_assignment, "cv.css");
            this.msg_err = `No existe el fichero ${f}`;
            (await checkFileExists(f)).should.equal(true);
            this.msg_err = `El css no se carga desde el html`;
            browser.html('link[rel="stylesheet"]').should.not.be.empty;
            (browser.evaluate(`document.querySelector('link[rel="stylesheet"]').href`)).includes("cv.css").should.be.true
        });

        scored(`Existe una cabecera`, 1, async function () {
            browser.html("header").should.not.be.empty;
        });

        scored(`La cabecera contiene los datos personales pedidos`, 1, async function () {
            content = browser.html("header");
            this.msg_err = "falta el nombre";
            browser.html("header #nombre").should.not.be.empty;
            this.msg_err = "falta la fecha de nacimiento";
            browser.html("header #fecha_nacimiento").should.not.be.empty;
        });

        scored(`La cabecera contiene una foto (foto.jpg)`, 1, async function () {
            this.msg_err = "La cabecera no contiene la foto llamada foto.jpg";
            content = browser.html("header");
            content.includes("img").should.be.equal(true);
            content.includes("foto.jpg").should.be.equal(true);
        });

        scored(`Existe la sección de formación, datos laborales y otros"`, 1, async function () {
            this.msg_err = "No existe la sección de estudios";
            browser.html("section#estudios").should.not.be.empty;
            this.msg_err = "No existe la sección de datos laborales";
            browser.html("section#laboral").should.not.be.empty;
            this.msg_err = "No existe la sección de otros";
            browser.html("section#otros").should.not.be.empty;
        });


        scored(`Existe la sección de otros, con un enlace a GitHub y el correo elctrónico upm"`, 1, async function () {
            let content = browser.html("section#otros");
            content.should.not.be.empty;
            this.msg_err = "El fichero con la información del usuario no se encuentra, asegúrese de aceptar que se almacene en user.json";
            (await checkFileExists(path.join(path_assignment, "user.json"))).should.be.equal(true);
            const user_info = await getEmailAndToken(path.join(path_assignment, "user.json"));
            this.msg_err = "El email del estudiante no coincide";
            content.includes(user_info.email).should.be.ok;
        });

        scored(`Existe un pie (footer) e incluye la fecha de actualización`, 1, async function () {
            content = browser.html("footer");
            content.includes("Actualizado el").should.be.equal(true);
        });

        scored(`Se ha modificado css (mímino body con background y algo de secciones)`, 2, async function () {
            fpath = 'cv.css';
            let templ = fs.readFileSync(path.join(path_assignment, fpath), "utf8");
            for (status in checks[fpath]) {
                elements = checks[fpath][status];
                for (var elem in elements) {
                    let e = elements[elem];
                    if (status) {
                        this.msg_err = `${fpath} no incluye ${e}`;
                    } else {
                        this.msg_err = `${fpath} incluye ${e}, pero debería haberse borrado`;
                    }
                    e.test(templ).should.be.equal((status == 'true'));
                }
            }
        });


    });
})

