<img  align="left" width="150" style="float: left;" src="https://www.upm.es/sfs/Rectorado/Gabinete%20del%20Rector/Logos/UPM/CEI/LOGOTIPO%20leyenda%20color%20JPG%20p.png">
<img  align="right" width="60" style="float: right;" src="http://www.dit.upm.es/figures/logos/ditupm-big.gif">

<br/><br/><br/>

# Práctica 1 - Calculadora HTTP

Versión: 19 de Enero de 2022

## Objetivos

* Comprender el funcionamiento de las peticiones y las respuestas en HTTP
* Elaborar peticiones HTTP de manera manual
* Utilizar herramientas conocidas (p.e., netcat) para depurar peticiones HTTP.

## Descripción de la práctica

En la URL http://malamen.dit.upm.es/calc hay desplegada una calculadora HTTP que sirve para sumar, restar, dividir y multiplicar dos números, obteniendo el resultado en formato JSON.

Para usar esta calculadora debe enviarse una petición HTTP de tipo POST a la URL anterior, y pasar en el cuerpo (body) los dos números y el operador que se quieran aplicar.

Hay muchas formas de realizar esa consulta: desde utilizar código Javascript en cliente, hasta el uso de herramientas específicas como cURL.
Sin embargo, todas ellas usan el protocolo HTTP por debajo.

En esta práctica, elaboraremos varias peticiones HTTP de manera manual que enviaremos al servidor, y comprobaremos que la respuesta obtenida es la esperada.


## Descargar el código del proyecto

Para poder utilizar el autocorector en esta práctica, es necesario utilizar la **versión 16 de Node.js, superior a 16.8 (https://nodejs.org/es/) y Git (https://git-scm.com/)**.
El proyecto debe clonarse en el ordenador en el que se está trabajando:

```
$ git clone https://github.com/CORE-UPM/P1_calculadora_HTTP
```

A continuación se debe acceder al directorio de trabajo, e instalar todas las dependencias.

```
$ cd P1_calculadora_HTTP
$ npm install
```

## Tareas

Todas las tareas en esta práctica consistirán en escribir en texto plano una petición de tipo POST al servidor de calculadora.

El cuerpo de la petición debe user el mismo formato que un formulario.
El tipo de contenido debe ser `Content-type: application/x-www-form-urlencoded`, los operandos deben asignarse a las variables n1 y n2, el operador a la variable op, todo separado con "&", y usando escapado URL.

Así, para suma 3 y 4, hay que pasar en el body la siguiente cadena: `n1=3&n2=4&op=%2B`.

Algunos operadores han de ser escapados (transformados para su uso en URL).
Para escapar el operador suma debe usarse la codificación %2B, y para la multiplicación %2A.

La petición HTTP debe incluir también otras cabeceras, como por ejemplo:

Host: direccion del servidor
Accept: text/html,text/text,application/json
Connection: keep-alive para no cerrar la conexión
Content-Length: tamaño del body

La respuesta HTTP que devuelve el servidor es un objeto JSON que puede contener el resultado pedido, o un error si hay algún problema.

Se pide escribir varios ficheros con peticiones al servidor, siguiendo las especificaciones de los apartados siguientes.

### 1. Petición inválida

La primera tarea será escribir en el fichero `error400.txt` una petición que cause que el servidor devuelva una respuesta con un código HTTP 400. 
En otras palabras, debe ser una petición errónea.


### 2. Suma de dos valores

Escribir en el fichero `suma.txt` una petición a la calculadora de la suma de dos valores: `3` y `4`.

### 3. Petición incompleta


Por último, escriba una petición en el fichero `incompleta.txt` que cause que el servidor "quede a la espera de más datos", causando un timeout después de un tiempo.
Es decir, la petición debe ser correcta, pero incompleta.

Pista: ¿cómo sabe el servidor cuándo ha terminado una petición?.


### Comprobar las peticiones

Antes de probar el autocorector, será necesario comprobar manualmente cada una de las peticiones.
La forma de hacerlo dependerá del sistema operativo usado.

#### En *nix (GNU/Linux, Mac, BSD)

(También válido en la bash shell de Windows o en WSL (Windows Subsystem for Linux))

Lanzar el siguiente comando:

```shell
nc malamen.dit.upm.es 80 < peticion.txt
```

Este comando escribirá en pantalla la respuesta HTTP recibida, y en su body debe llegar un objeto JSON indicando el resultado.


#### En Windows
- Opción 1, **telnet** (recomendada): es necesario [activar telnet en windows](https://www.technipages.com/windows-10-enable-telnet).

    Lanzar el siguiente comando en el PowerShell:

    ```shell
    telnet malamen.dit.upm.es 80
    # pegar el contenido del fichero con la petición (no muestra el contenido que se pega en el PowerShell pero sí que lo está enviando)
    # si desea cerrar la conexión poner la palabra 'quit' 
    ```

- Opción 2, **netcat** (avanzada): durante la instalación de Node marcar la casilla `Automatically install the necesarry tools. Note that his will also install Chocolatey...`

    Abrir un PowerShell con permisos de administrador e instalar netcat con el siguiente comando:

    ```shell
    choco install netcat
    ```

    Lanzar el siguiente comando en el PowerShell:

    ```shell
    Get-Content peticion.txt | nc malamen.dit.upm.es 80
    ```


## Prueba de la práctica

Para ayudar al desarrollo, se provee una herramienta de autocorrección que prueba las distintas funcionalidades que se piden en el enunciado. Para utilizar esta herramienta debes tener node.js (y npm) (https://nodejs.org/es/) y Git instalados.

Para instalar y hacer uso de la herramienta de autocorrección en el ordenador local, ejecuta los siguientes comandos en el directorio raíz del proyecto:

```
$ sudo npm install -g autocorector    ## Instala el programa de test
$ autocorector                   ## Pasa los tests al fichero a entregar
............................     ## en el directorio de trabajo
... (resultado de los tests)
```

También se puede instalar como paquete local, en el caso de que no dispongas de permisos en 
el ordenador en el que estás trabajando:

```
$ npm install autocorector     ## Instala el programa de test
$ npx autocorector             ## Pasa los tests al fichero a entregar
............................   ## en el directorio de trabajo
... (resultado de los tests)
```

Se puede pasar la herramienta de autocorrección tantas veces como se desee sin ninguna repercusión en la calificación.



## Instrucciones para la Entrega y Evaluación.

Una vez satisfecho con su calificación, el alumno puede subir su entrega a Moodle con el siguiente comando:

```
$ autocorector --upload
```

o, si se ha instalado como paquete local:

```
$ npx autocorector --upload
```

La herramienta de autocorrección preguntará por el correo del alumno y el token de Moodle. 
En el enlace **https://www.npmjs.com/package/autocorector** se proveen instrucciones para encontrar dicho token.

**RÚBRICA**: Se puntuará el ejercicio a corregir sumando el % indicado a la nota total si la parte indicada es correcta:

- **40%:** Petición errónea 
- **40%:** Petición de una suma
- **20%:** Petición incompleta

Si pasa todos los tests se dará la máxima puntuación.
