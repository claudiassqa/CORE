<img  align="left" width="150" style="float: left;" src="https://www.upm.es/sfs/Rectorado/Gabinete%20del%20Rector/Logos/UPM/CEI/LOGOTIPO%20leyenda%20color%20JPG%20p.png">
<img  align="right" width="60" style="float: right;" src="http://www.dit.upm.es/figures/logos/ditupm-big.gif">

<br/><br/><br/>

# Práctica 2 - CV

Versión: 3 de Febrero de 2022

## Objetivos

* Crear una página web con código HTML.
* Definir el estilo gráfico de una página web con CSS.


## Descripción de la práctica

En esta práctica, elaboraremos una página web estática con la información del curriculum vitae del alumno. Para definir la estructura del documento se utilizará HTML y para el estilo gráfico, CSS. La página web incluirá los bloques semánticos típicos (`<header>`, `<main>`, `<section>`, `<footer>`, etc.); integrará objetos externos como imágenes o enlaces; y modificará el estilo a través de CSS.    


## Descargar el código del proyecto

Para poder utilizar el autocorector en esta práctica, es necesario utilizar la **versión 16 de Node.js, superior a 16.8 (https://nodejs.org/es/) y Git (https://git-scm.com/)**.
El proyecto debe clonarse en el ordenador en el que se está trabajando:

```
$ git clone https://github.com/CORE-UPM/P2_CV.git
```

A continuación se debe acceder al directorio de trabajo, e instalar todas las dependencias.

```
$ cd P2_CV
$ npm install
```

## Tareas

Todas las tareas en esta práctica consistirán en escribir en el **directorio raíz del proyecto** el código HTML de la página web en el fichero `cv.html`, y los estilos CSS en el fichero `cv.css`.

Para superar la entrega el alumno debe incluir en el CV:

### 1. Estructura básica de un fichero HTML

* Crear el esqueleto de un fichero HTML llamado `cv.html`. Debe incluir las etiquetas básicas de todo fichero HTML: `<html>`, `<head>`, `<body>`, etc. 
* Crear el fichero CSS (`cv.css`) y cargarlo desde el HTML.

### 2. Head

Incluir en el campo head:
* Título (por ejemplo CV de + su nombre)
* Incluir la hoja de estilos `cv.css`

### 3. Header

Incluir header (`<header>`) que contenga:
* Campo con nombre y apellidos del alumno. La etiqueta utilizada, por ejemplo `<h1>`, debe incluir como atributo `id="nombre"`. 
* Fecha de nacimiento del alumno. La etiqueta utilizada, por ejemplo `<p>`, debe incluir como atributo `id="fecha_nacimiento"`.
* Fotografía del alumno (`img src="foto.jpg"`). La fotografía debe guardarse en el directorio raíz del proyecto y llamarse `foto.jpg`. 
* Otros datos personales como email, dirección, etc., que completen el CV.

### 4. Secciones

El CV debe incluir las siguientes secciones (marca HTML section):

* Sección 1 con atributo `id="estudios"`. El contendio de la sección debe incluir la información académica del alumno. Se recomienda utilizar una lista que muestre en orden cronológico inverso los estudios cursados.
* Sección 2 con atributo `id="laboral"`. El contenido de la sección debe incluir la experiencia laboral del alumno o intereses laborales. Se recomienda utilizar una lista que separe las distintas entradas.
* Sección 3 con atributo `id="otros"`. Se recomienda utilizar una lista como contenido de esta sección. El contenido de la sección debe incluir:
  * Un enlace al correo UPM del alumno (con el @alumnos.upm.es)
  * Información adicional, por ejemplo, idiomas, aficiones, etc.

### 5. Footer

Incluir un footer con la fecha de actualización del CV. Debe contener el siguiente texto: `Actualizado el` + fecha de actualización.

### 6. Modificar el CSS

Modificar el estilo de la página web. 

* Como mínimo se pide modificar el estilo de la etiqueta `<body>` (cambiar el color de fondo) y el estilo de la etiquet `<section>` (cualquier cambio, por ejemplo, añadir borde a las secciones). 
* Realizar otros cambios sobre el CSS.

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

- **10%:** Existen todas las etiquetas del esqueleto básico de HTML. 
- **10%:** La página web incluye la hoja de estilos (CSS).
- **30%:** Información de la cabecera:
  - **10%:** Existe la cabecera.
  - **10%:** La cabecera contiene la foto (foto.jpg).
  - **10%:** La cabecera contiene los datos personales (mímimo nombre y fecha de nacimiento).
- **20%:** información de las secciones:
  - **10%:** Existen las tres secciones pedidas (estudios, laboral, y otros).
  - **10%:** La sección otros incluye el correo del alumno (con @alumnos.upm.es)
- **10%:** Existe el pie de página con la fecha de actualización.
- **20%:** Se han añadido los estilos solicitados al body y sections de la página web.


Si pasa todos los tests se dará la máxima puntuación.
