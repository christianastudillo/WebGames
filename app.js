'use strict';

/* ============================================================
   JUEGALAB · JAVASCRIPT
   1. Configuración que puedes editar.
   2. Tarjetas y ventana compartida.
   3. Juego de colorear.
   4. Juego de sumas.
   5. Ayuda y pantalla completa.
   No usa bibliotecas ni necesita internet.
   ============================================================ */

// 1. CONFIGURACIÓN ------------------------------------------------
// Cada objeto representa una tarjeta. El id debe ser único.
// Para activar otro juego: añade su función en ACCIONES y cambia disponible.
const JUEGOS = [
  {
    id: 'colorear',
    titulo: 'Dale color',
    categoria: 'CREATIVIDAD',
    descripcion: 'Tu imaginación pone los colores.',
    simbolo: '✎',
    tono: 'tono-morado',
    disponible: true
  },
  {
    id: 'sumas',
    titulo: 'Suma y descubre',
    categoria: 'NÚMEROS',
    descripcion: 'Pequeñas sumas, grandes logros.',
    simbolo: '3 + 2',
    tono: 'tono-amarillo',
    disponible: true
  },
  {
    id: 'juego3',
    titulo: 'Algo nuevo viene',
    categoria: 'PRÓXIMAMENTE',
    descripcion: 'Un nuevo juego por descubrir.',
    simbolo: '✿',
    tono: '',
    disponible: false
  },
  {
    id: 'juego4',
    titulo: 'Más por explorar',
    categoria: 'PRÓXIMAMENTE',
    descripcion: 'Este espacio espera una nueva idea.',
    simbolo: '◇',
    tono: '',
    disponible: false
  },
  {
    id: 'juego5',
    titulo: 'La próxima sorpresa',
    categoria: 'PRÓXIMAMENTE',
    descripcion: 'Pronto habrá otra forma de jugar.',
    simbolo: '✳',
    tono: '',
    disponible: false
  }
];

// PERSONALIZAR: añade o cambia colores con su nombre y código hexadecimal.
const COLORES = [
  { nombre: 'Morado', valor: '#a997d3' },
  { nombre: 'Rosa', valor: '#e99dba' },
  { nombre: 'Rojo', valor: '#e47c69' },
  { nombre: 'Amarillo', valor: '#f2cd64' },
  { nombre: 'Verde', valor: '#93bf89' },
  { nombre: 'Azul', valor: '#88bdd9' },
  { nombre: 'Marrón', valor: '#ae876a' },
  { nombre: 'Blanco', valor: '#ffffff' }
];

// maximo es el valor máximo de CADA número; por ejemplo, 5 + 5 puede salir.
const NIVELES = [
  { nombre: 'Primeros pasos · del 0 al 5', maximo: 5 },
  { nombre: 'A practicar · del 0 al 10', maximo: 10 },
  { nombre: 'Un nuevo reto · del 0 al 20', maximo: 20 }
];

// Relaciona el id de una tarjeta con la función que abre su juego.
const ACCIONES = {
  colorear: iniciarColorear,
  sumas: iniciarSumas
};

// 2. TARJETAS Y VENTANA --------------------------------------------
// Guardamos referencias a elementos usados varias veces.
const ventana = document.getElementById('ventana');
const contenido = document.getElementById('contenido-ventana');
let ultimoElemento = null; // Permite devolver el foco al botón de entrada.

// Crea las tarjetas desde JUEGOS; no es necesario duplicarlas en el HTML.
function mostrarTarjetas() {
  const lista = document.getElementById('lista-juegos');
  lista.replaceChildren();
  let disponibles = 0;

  JUEGOS.forEach(function (juego, indice) {
    // Solo se ofrece jugar cuando también existe su función.
    const activo = juego.disponible && typeof ACCIONES[juego.id] === 'function';
    const tarjeta = document.createElement('article');
    tarjeta.className = 'tarjeta ' + (activo ? 'tarjeta-activa' : 'tarjeta-pendiente');

    const dibujo = document.createElement('div');
    dibujo.className = 'ilustracion ' + juego.tono;
    dibujo.textContent = juego.simbolo;
    dibujo.setAttribute('aria-hidden', 'true');

    const bloque = document.createElement('div');
    bloque.className = 'tarjeta-contenido';
    const categoria = document.createElement('span');
    categoria.className = 'categoria';
    categoria.textContent = juego.categoria;
    const titulo = document.createElement('h3');
    titulo.textContent = juego.titulo;
    const descripcion = document.createElement('p');
    descripcion.textContent = juego.descripcion;
    bloque.append(categoria, titulo, descripcion);

    if (activo) {
      disponibles++;
      const boton = document.createElement('button');
      boton.type = 'button';
      boton.className = 'boton-jugar';
      boton.textContent = 'Jugar ahora →';
      boton.setAttribute('aria-label', 'Jugar: ' + juego.titulo);
      boton.addEventListener('click', ACCIONES[juego.id]);
      bloque.append(boton);
    } else {
      const aviso = document.createElement('span');
      aviso.className = 'pendiente';
      aviso.textContent = 'Juego ' + String(indice + 1).padStart(2, '0') + ' · En preparación';
      bloque.append(aviso);
    }

    tarjeta.append(dibujo, bloque);
    lista.append(tarjeta);
  });

  document.getElementById('contador-juegos').textContent =
    '● ' + disponibles + (disponibles === 1 ? ' juego disponible' : ' juegos disponibles');
}

// Copia una plantilla del HTML y abre la ventana con un título accesible.
function abrirVentana(titulo, idPlantilla) {
  ultimoElemento = document.activeElement;
  const plantilla = document.getElementById(idPlantilla);
  contenido.replaceChildren(plantilla.content.cloneNode(true));
  document.getElementById('titulo-ventana').textContent = titulo;
  ventana.showModal();
  document.body.classList.add('ventana-abierta');
  ventana.scrollTop = 0;
}

// También se ejecuta cuando el navegador cierra el diálogo con Escape.
function alCerrarVentana() {
  document.body.classList.remove('ventana-abierta');
  if (ultimoElemento) ultimoElemento.focus();
}

document.getElementById('boton-cerrar').addEventListener('click', function () {
  ventana.close();
});
ventana.addEventListener('close', alCerrarVentana);

// 3. JUEGO DE COLOREAR ---------------------------------------------
function iniciarColorear() {
  abrirVentana('01 / Creatividad', 'plantilla-colorear');

  // Estado de esta partida. Se reinicia al volver a abrir el juego.
  let colorActual = COLORES[0].valor;
  const historial = []; // Guarda cambios para poder deshacerlos.
  const paleta = contenido.querySelector('#paleta');
  const zonas = contenido.querySelectorAll('[data-zona]');
  const mensaje = contenido.querySelector('#mensaje-color');
  const deshacer = contenido.querySelector('#boton-deshacer');
  const originales = new Map(); // Relaciona cada zona con su color inicial.

  // Actualiza la selección visual y el nombre, sin depender solo del color.
  function seleccionarColor(color, botonElegido) {
    colorActual = color.valor;
    contenido.querySelector('#color-elegido').textContent = 'Color seleccionado: ' + color.nombre;
    paleta.querySelectorAll('button').forEach(function (boton) {
      boton.setAttribute('aria-pressed', String(boton === botonElegido));
    });
  }

  // Genera un botón accesible por cada color configurado arriba.
  COLORES.forEach(function (color, indice) {
    const grupo = document.createElement('div');
    grupo.className = 'color';
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'muestra';
    boton.style.backgroundColor = color.valor;
    boton.setAttribute('aria-label', color.nombre);
    boton.setAttribute('aria-pressed', 'false');
    boton.addEventListener('click', function () {
      seleccionarColor(color, boton);
    });
    const nombre = document.createElement('span');
    nombre.className = 'nombre-color';
    nombre.textContent = color.nombre;
    grupo.append(boton, nombre);
    paleta.append(grupo);
    if (indice === 0) seleccionarColor(color, boton);
  });

  // Pintar solo cambia el atributo fill del elemento SVG.
  function pintar(zona) {
    const anterior = zona.getAttribute('fill');
    if (anterior === colorActual) return; // No guarda cambios repetidos.
    historial.push({ zona: zona, anterior: anterior });
    zona.setAttribute('fill', colorActual);
    deshacer.disabled = false;
    mensaje.textContent = zona.getAttribute('aria-label') + ' coloreado. ¡Sigue creando!';
  }

  zonas.forEach(function (zona) {
    originales.set(zona, zona.getAttribute('fill'));
    zona.setAttribute('tabindex', '0');
    zona.setAttribute('role', 'button');
    zona.addEventListener('click', function () { pintar(zona); });
    // SVG no activa botones automáticamente al pulsar Enter o espacio.
    zona.addEventListener('keydown', function (evento) {
      if (evento.key === 'Enter' || evento.key === ' ') {
        evento.preventDefault();
        pintar(zona);
      }
    });
  });

  // Deshace el último cambio. El botón se desactiva si ya no quedan pasos.
  deshacer.addEventListener('click', function () {
    const cambio = historial.pop();
    if (!cambio) return;
    cambio.zona.setAttribute('fill', cambio.anterior);
    deshacer.disabled = historial.length === 0;
    mensaje.textContent = 'Último cambio deshecho.';
    if (deshacer.disabled) cambio.zona.focus();
  });

  // Recupera el paisaje inicial y vacía el historial.
  contenido.querySelector('#boton-reiniciar-dibujo').addEventListener('click', function () {
    originales.forEach(function (color, zona) { zona.setAttribute('fill', color); });
    historial.length = 0;
    deshacer.disabled = true;
    mensaje.textContent = 'Dibujo reiniciado. ¡Un nuevo comienzo!';
  });

  // Guarda el dibujo como SVG: conserva colores y se puede abrir en un navegador.
  // Se incluyen los bordes porque el CSS de la página no viaja con la descarga.
  contenido.querySelector('#boton-descargar').addEventListener('click', function () {
    const copia = contenido.querySelector('#dibujo').cloneNode(true);
    copia.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    copia.querySelectorAll('[data-zona]').forEach(function (zona) {
      zona.setAttribute('stroke', '#35483c');
      zona.setAttribute('stroke-width', '3');
      zona.setAttribute('stroke-linejoin', 'round');
      zona.removeAttribute('tabindex');
      zona.removeAttribute('role');
    });
    const archivo = new Blob([new XMLSerializer().serializeToString(copia)], { type: 'image/svg+xml;charset=utf-8' });
    const direccion = URL.createObjectURL(archivo);
    const enlace = document.createElement('a');
    enlace.href = direccion;
    enlace.download = 'mi-dibujo-juegalab.svg';
    document.body.append(enlace);
    enlace.click();
    enlace.remove();
    // Libera la dirección temporal después de iniciar la descarga.
    setTimeout(function () { URL.revokeObjectURL(direccion); }, 1000);
    mensaje.textContent = 'Dibujo preparado para descargar. Revisa las descargas de tu navegador.';
  });
}

// 4. JUEGO DE SUMAS ------------------------------------------------
// Devuelve un entero entre cero y maximo, incluyendo ambos extremos.
function numeroAleatorio(maximo) {
  return Math.floor(Math.random() * (maximo + 1));
}

function iniciarSumas() {
  abrirVentana('02 / Números', 'plantilla-sumas');

  // Estado: números actuales, aciertos y si la operación ya fue resuelta.
  let numeroA = 0;
  let numeroB = 0;
  let aciertos = 0;
  let resuelta = false;

  const nivel = contenido.querySelector('#nivel');
  const entrada = contenido.querySelector('#resultado');
  const formulario = contenido.querySelector('#formulario-sumas');
  const mensaje = contenido.querySelector('#mensaje-suma');
  const siguiente = contenido.querySelector('#boton-siguiente');
  const comprobar = contenido.querySelector('#boton-comprobar');
  const pista = contenido.querySelector('#boton-pista');

  // Las opciones se crean desde NIVELES para evitar repetir su configuración.
  NIVELES.forEach(function (configuracion, indice) {
    const opcion = document.createElement('option');
    opcion.value = indice;
    opcion.textContent = configuracion.nombre;
    nivel.append(opcion);
  });

  function actualizarPuntuacion() {
    contenido.querySelector('#puntuacion').textContent =
      aciertos + (aciertos === 1 ? ' suma resuelta' : ' sumas resueltas');
  }

  // Prepara una nueva pregunta y vuelve a habilitar los controles.
  function nuevaSuma() {
    const maximo = NIVELES[Number(nivel.value)].maximo;
    numeroA = numeroAleatorio(maximo);
    numeroB = numeroAleatorio(maximo);
    resuelta = false;
    contenido.querySelector('#operacion').textContent = numeroA + ' + ' + numeroB + ' = ?';
    entrada.value = '';
    entrada.disabled = false;
    comprobar.disabled = false;
    pista.hidden = false;
    siguiente.hidden = true;
    mensaje.textContent = '';
    mensaje.classList.remove('exito');
  }

  // submit permite comprobar tanto con un clic como con Enter.
  formulario.addEventListener('submit', function (evento) {
    evento.preventDefault(); // Evita recargar la página al enviar el formulario.
    if (resuelta) return;

    const respuesta = entrada.valueAsNumber;
    // El navegador también valida required, min y step definidos en el HTML.
    if (!Number.isInteger(respuesta) || respuesta < 0) {
      mensaje.textContent = 'Escribe un número entero igual o mayor que cero.';
      entrada.focus();
      return;
    }

    if (respuesta === numeroA + numeroB) {
      resuelta = true; // Impide sumar puntos varias veces en la misma pregunta.
      aciertos++;
      actualizarPuntuacion();
      mensaje.textContent = '✦ ¡Muy bien! ' + numeroA + ' + ' + numeroB + ' = ' + respuesta;
      mensaje.classList.add('exito');
      entrada.disabled = true;
      comprobar.disabled = true;
      pista.hidden = true;
      siguiente.hidden = false;
      siguiente.focus();
    } else {
      mensaje.textContent = 'Todavía no. Puedes intentarlo otra vez o pedir una pista.';
      entrada.focus();
      entrada.select();
    }
  });

  // La pista usa grupos de puntos para representar los dos números.
  pista.addEventListener('click', function () {
    const grupoA = numeroA === 0 ? 'cero puntos' : '● '.repeat(numeroA).trim();
    const grupoB = numeroB === 0 ? 'cero puntos' : '● '.repeat(numeroB).trim();
    mensaje.textContent = 'Cuenta los dos grupos: ' + grupoA + ' + ' + grupoB;
  });

  siguiente.addEventListener('click', function () {
    nuevaSuma();
    entrada.focus();
  });

  // Cada nivel empieza con su propio contador temporal.
  nivel.addEventListener('change', function () {
    aciertos = 0;
    actualizarPuntuacion();
    nuevaSuma();
  });

  nuevaSuma();
}

// 5. AYUDA Y PANTALLA COMPLETA -------------------------------------
document.getElementById('boton-ayuda').addEventListener('click', function () {
  abrirVentana('Cómo jugar', 'plantilla-ayuda');
});

const botonPantalla = document.getElementById('boton-pantalla');

// Si el navegador no admite esta función, el botón no se muestra.
if (!document.fullscreenEnabled || !document.documentElement.requestFullscreen) {
  botonPantalla.hidden = true;
}

botonPantalla.addEventListener('click', async function () {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await document.documentElement.requestFullscreen();
    }
  } catch (error) {
    // Un rechazo del navegador no debe impedir seguir utilizando los juegos.
    abrirVentana('Pantalla completa', 'plantilla-ayuda');
    const aviso = document.createElement('p');
    aviso.textContent = 'Tu navegador no pudo ampliar la página. Puedes seguir jugando en esta ventana.';
    contenido.prepend(aviso);
  }
});

// También actualiza el botón cuando la persona sale con Escape.
document.addEventListener('fullscreenchange', function () {
  const activa = Boolean(document.fullscreenElement);
  botonPantalla.setAttribute('aria-pressed', String(activa));
  botonPantalla.setAttribute('aria-label', activa ? 'Salir de pantalla completa' : 'Activar pantalla completa');
});

// ARRANQUE: el script usa defer, así que el HTML ya está disponible.
mostrarTarjetas();
