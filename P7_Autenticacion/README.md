# Práctica 7: Autenticación

Versión: 7 de Febrero de 2022

## Objetivos
* Afianzar los conocimientos obtenidos sobre el uso de Express para desarrollar servidores web.
* Aprender a desarrollar APIs REST para gestionar recursos web.
* Aprender a gestionar sesiones web.

## Descripción de la práctica

En esta práctica 7 se ampliará la *Práctica 6* (Blog) añadiendo gestión de usuarios y la funcionalidad de autenticación.

Se creará una tabla en la BBDD para almacenar los datos de los usuarios, y se implementará un API REST para
crearlos, consultarlos, actualizarlos y borrarlos.

Tambien se crearán los elementos necesarios para añadir la funcionalidad de autenticación. Los usuarios podrán hacer
**login** para crear una sesión de login, y hacer **logout** para cerrarla.

El desarrollo pedido en esta práctica es prácticamente igual al realizado en el mini proyecto **Autenticación** visto 
en las clases teóricas de la asignatura.
En el mini proyecto **Autenticación** se desarrollaron los recursos de los usuarios, y también se añadió la funcionalidad de autenticación.
Este trabajo puede reutilizarse casi directamente.

Hay dos detalles que se exigen en esta práctica y que difieren del trabajo realizado en el mini proyecto **Autenticación**.

* En el modelo **User** del mini proyecto solo se guardan los campos **username**, **password**, **salt** e **isAdmin**.
En esta práctica también hay que guardar y gestionar un campo llamado **email** con la dirección de correo electrónico del usuario.
Este nuevo campo debe manejarse en todas las vistas de los usuarios.

* En el mini proyecto, la definición de las rutas del API CRUD de gestión de los usuarios se hace en el fichero **routes/users.js**.
Para esta práctica se pide que estas mismas definiciones se hagan en **routes/index.js**.


## Descargar el código del proyecto

Es necesario utilizar la **versión 16 de Node.js** para el desarrollo de esta práctica.
El proyecto debe clonarse en el ordenador en el que se está trabajando:

    $ git clone https://github.com/CORE-UPM/P7_Autenticacion

A continuación se debe acceder al directorio de trabajo, e instalar todas las dependencias propias de esta práctica.

    $ cd P7_Autenticacion
    $ npm install

## Tareas

### Tarea 1 - Copiar el trabajo ya realizado en la Entrega 6 Posts

En esta práctica hay que continuar y ampliar el desarrollo realizado en la práctica 6.

El alumno debe copiar el directorio **blog** de la **Entrega6_posts** en el directorio **P7_Autenticacion/blog** de
esta práctica 7. Las tareas a realizar en esta práctica 7 de desarrollarán dentro del directorio **P7_Autenticacion/blog**.

Para copiar/duplicar el directorio **Entrega6_posts/blog** en el directorio **P7_Autenticacion/blog**, puede usar un
explorador de archivos. Asegúrese de copiar el directorio y no de moverlo de sitio, para no perder el trabajo original.
También puede ejecutar el siguiente comando en un terminal unix para copiar el directorio y todo su contenido:

    $ cp -r PATH_DE_PRACTICA_6/Entrega6_posts/blog PATH_DE_PRACTICA_7/P7_Autenticacion/.

### Tarea 2 - Instalación de paquetes

Eeta práctica necesita que se instale el paquete npm **express-session** para gestionar las sesiones. 
Hay que realizar los mismos pasos que se hicieros en el mini proyecto de autenticación.

Ejecutar el comando:

    npm install express-session

Importar y configurar el paquete en **app.js**:

    . . .
    var session = require('express-session');
    . . .

    // Configuracion de la session para almacenarla en BBDD Redis.
    app.use(session({secret: "Blog 2022",
                     resave: false,
                     saveUninitialized: true}));
    . . .
    
    // Este middleware nos permite usar loginUser en las vistas (usando locals.loginUser)
    // Debe añadirse antes que el indexRouter
    app.use(function(req, res, next) {

      console.log(">>>>>>>>>>>>>>", req.session.loginUser);

      // To use req.loginUser in the views
      res.locals.loginUser = req.session.loginUser && {
        id: req.session.loginUser.id,
        username: req.session.loginUser.username,
        email: req.session.loginUser.email,
        isAdmin: req.session.loginUser.isAdmin
      };

      next();
    });


### Tarea 3 - Desarrollar el modelo

Esta tarea consiste en realizar los siguientes pasos:

* Copie la definición del modelo de usuarios **models/user.js** del mini proyecto de autenticación añadiendo el nuevo 
campo para el **email**. 
Use la validación **isEmail** proporcionada por Sequelize para asegurarse de que el formato del email introducido es válido.
Modifique **models/index.js** para importar la definición del modelo **User**.

* Copie directamente el fichero **helpers/crypt.js** que se encarga de cifrar los passwords.

* Copie el fichero de migración **CreateUsersTable** y el fichero seeder **FillUsersTable** del mini proyecto, y 
modifíquelos para añadir el campo **email**. Utilice el usuario seguido de `@core.example` (p.e., `admin@core.example`).

### Tarea 4 - Definición de rutas

Las definiciones de las rutas para gestionar los usuarios y la session de login hay que añadirlas
al fichero **routes/index.js**.

Siga los siguientes pasos para completar el contenido de **routes/index.js**:

* Importe/requiera los controladores de usuarios y sesión **controllers/user.js**  y **controllers/session.js**.

* Copie las mismas rutas definidas en el fichero **routes/users.js** del mini proyecto en **routes/index.js**, 
sin olvidar añadir el prefijo **/users** en todas las definiciones.
Copie tambien la sentencia para gestionar la carga del parámetro de ruta **:userId**.

* Copie las rutas definidas en el fichero **routes/index.js** del mini proyecto para gestionar
la sesión de login y el autologout. 

### Tarea 5 - Crear los controladores

Hay que crear dos controladores: **controllers/user.js** con los middlewares de los usuarios y **controllers/session.js** con los middlewares de la session de login.

El fichero **controllers/session.js** del mini proyecto es igual al que necesitamos en esta práctica, y puede copiarse directamente.

El fichero **controllers/user.js** del mini proyecto es casi igual al que necesitamos. 
Solo hay que retocar algún middleware para soportar el nuevo campo **email**. 
Copie este fichero, y realice los cambios necesarios para soportar el email de los usuarios.


### Tarea 6 - Crear las vistas

En esta práctica se usarán las mismas vistas que en el mini proyecto de autenticación, con la unica diferencia de
que algunas vistas de usuario deben mostrar el nuevo campo **email**.

Siga los siguientes pasos para crear los ficheros de vistas:

* Copie directamente el fichero **views/session/new.ejs** que implementa la vista con el formulario de login. 

* Copie todos los ficheros de vistas de usuario **index.ejs**, **show.ejs**, **new.ejs**, **edit.ejs**, **_form.ejs** 
del directorio, **views/users**.
Modifique **show.ejs** para mostrar el email del usuario.
Modifique **_form.ejs** para añadir un entrada de texto en los formulario para editar el email del usuario. 
Este campo de texto debe usar el atributo **name="email"**.

* Modifique el menú de navegación de **views/layout.ejs** para añadir un nuevo botón con el texto **Users**.
Al pulsar este botón, se enviara la primitiva **GET /users** para navegar a la página que muestra un listado con
los usuarios existentes.

* El código que muestra los botones para hacer login y logout se encuentra en **views/users/index.ejs**.
Elimine este código de este fichero, 
y añadalo al marco de aplicación **views/layout.ejs**.

* El último paso consiste en copiar el helper dinámico que pasa el valor de **req.sesion.loginUser** al objeto **res** 
para que este disponible en las vistas. Este helper esta definido en el fichero **app.js** del mini proyecto, y 
hay que copiarlo en el fichero **app.js** de la práctica.

### Tarea 7 - Aplicar migraciones, seeders y probar

LLegados a este punto ya se ha terminado todo el desarrollo de la práctica.

Solo falta aplicar las migraciones y seeders ejecutando:

      # sistemas unix
      npm run migrate
      npm run seed
      # sistemas windows
      npm run migrate_win
      npm run seed_win

y probar el funcionamiento del nuevo servidor.



## Prueba de la práctica

Para ayudar al desarrollo, se provee una herramienta de autocorrección que prueba las distintas funcionalidades que se piden en el enunciado. Para utilizar esta herramienta debes tener node.js (y npm) (https://nodejs.org/es/) y Git instalados.

Para instalar y hacer uso de la herramienta de autocorrección en el ordenador local, ejecuta los siguientes comandos en el directorio raíz del proyecto, es decir, en el directorio padre del directorio **post**:

    $ sudo npm install -g autocorector    ## Instala el programa de test
    $ autocorector                   ## Pasa los tests al fichero a entregar
    ............................     ## en el directorio de trabajo
    ... (resultado de los tests)

También se puede instalar como paquete local, en el caso de que no dispongas de permisos en
el ordenador en el que estás trabajando:

    $ npm install autocorector     ## Instala el programa de test
    $ npx autocorector             ## Pasa los tests al fichero a entregar
    ............................   ## en el directorio de trabajo
    ... (resultado de los tests)

Se puede pasar la herramienta de autocorrección tantas veces como se desee sin ninguna repercusión en la calificación.



## Instrucciones para la Entrega y Evaluación.

Una vez satisfecho con su calificación, el alumno puede subir su entrega a Moodle con el siguiente comando:

    $ autocorector --upload

o, si se ha instalado como paquete local:

    $ npx autocorector --upload

La herramienta de autocorrección preguntará por el correo del alumno y el token de Moodle.
En el enlace **https://www.npmjs.com/package/autocorector** se proveen instrucciones para encontrar dicho token.

**RÚBRICA**: Se puntuará el ejercicio a corregir sumando el % indicado a la nota total si la parte indicada es correcta:

- **10%:** Se atiende la petición GET /users
- **10%:** La petición GET /users muestra todos los usuarios.
- **10%:** Se atiende la petición GET /users/:userId que muestra el usuario pedido, y su campo **email**.
- **5%:** La peticion GET /users/:userId de un usuario inexistente informa de que no existe.
- **10%:** Se atiende la petición GET /users/new y muestra los campos del formulario new, incluido el de **email**.
- **5%:** No pueden crearse un usuario con **username** vacío o repetido.
- **15%:** La petición POST /users crea un nuevo usuario.
- **10%:** Se atiende la petición GET /users/:userId/edit y muestra los campos (incluido **email**) del formulario bien rellenos.
- **15%:** La petición PUT /users/:userId actualiza el usuario
- **10%:** La petición DELETE /users/:userId borra el usuario indicado

Si pasa todos los tests se dará la máxima puntuación.
