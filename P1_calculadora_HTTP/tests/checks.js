/* eslint-disable no-invalid-this*/
/* eslint-disable no-undef*/
// IMPORTS
const path = require("path");
const {feedback,path_assignment,err, warn_errors, scored, log, checkFileExists} = require("./testutils");
const spawn = require("child_process").spawn;
const fs = require("fs");
const net = require('net');
const process = require("process");

const CALC = "malamen.dit.upm.es";
const PORT = 80;
const TIMEOUT = 5000;

async function callServer(formattedJson, server=CALC, port=PORT) {
    return new Promise((resolve, reject) => {
        let client = new net.Socket();
        var timedout = false;
        var resolved = false;

        client.connect(port, server, () => {
            log('connected to server');
            client.write(formattedJson);
        });

        client.on('data', (data) => {
            if (timedout) {
                return;
            }
            resolved = true;
            let body = new Buffer.from(data).toString();
            let code = parseInt(body.split("\r\n")[0].split(" ")[1], 10);
            var js = undefined;
            if (code == 200) {
                js = JSON.parse(body.split("\r\n\r\n")[1]);
            }
            resolve([body, code, js]); // 
            client.destroy();
        });

        client.on('close', () => {
        });
        client.on('error', reject);
        setTimeout(function(arg){
            if (resolved) {
                return;
            }
            timedout = true;
            client.destroy();
            reject(new Error("el servidor no ha respondido en ${TIMEOUT} milisegundos"));
        }, TIMEOUT, 'funky');
    });
}


describe("Tests Práctica 1", function() {
    after(function () {
        warn_errors();
    });

    // Tests que no puntúan, pero sus fallos son CRITICAL. Si no pasan, no se continúa.
    // Es un sanity check antes de los tests de verdad.
    describe("Prechecks", function () {
        scored("Comprobando que existe el directorio de la entrega...",
           -1, async function () {
               this.msg_ok = `Encontrado el directorio '${path_assignment}'`;
               this.msg_err = `No se encontró el directorio '${path_assignment}'`;
               const fileexists = await checkFileExists(path_assignment);

               fileexists.should.be.equal(true);
           });
    });

    describe("Funcionales", function(){
        scored("suma válida", 4, async function(){ 
               let file = 'suma.txt';
               const data = fs.readFileSync(file, 'utf8');
               this.msg_err = `could not read ${file}`;
               let [resp, code, js] = await callServer(data);
               this.msg_err = "La respuesta no da un código 200";
               code.should.be.equal(200);
               this.msg_err = "El valor no es el deseado";
               js["valor"].should.be.equal(7);
           });
        scored("error 400", 4, async function(){ 
               let file = 'error400.txt'
               const data = fs.readFileSync(file, 'utf8');
               this.msg_err = `could not read ${file}`;
               var [resp, code, js] = await callServer(data);
               this.msg_err = "La respuesta no da un código 400";
               code.should.be.equal(400);
           });

        scored("query incompleta", 2, async function(){ 
               let file = 'incompleta.txt';
               const data = fs.readFileSync(file, 'utf8');
               this.msg_err = `could not read ${file}`;
               try {
                var [resp, code, js] = await callServer(data);
               } catch(ex) {
                   return null;
               }
               this.msg_err = `La query funcionó, y no debería hacerlo`;
               throw new Error(this.msg_err);
           });
    });
});
