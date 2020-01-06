var express = require('express');
var router = express.Router();
const request = require('request');

/* GET home page. */
router.get('/', async function(req, res, next) {
  let comuna = 0; // El id de la comuna, 0 es sin comuna.
  let nombre = ""; // El nombre de la farmacia, un vacío es sin farmacia.
  if (typeof req.query.comuna !== 'undefined') { // valida si viene una comuna en la ruta.
    comuna = req.query.comuna; // Se asigna la comuna que viene por la ruta a la variable.
  }
  if (typeof req.query.nombre !== 'undefined') { // Valida si viene un nombre de farmacia en la ruta.
    nombre = req.query.nombre; // Se asigna el nombre de farmacia que viene por la ruta a la variable.
  }
  let coordenadas = []; // En esta variable guardaremos los datos para renderizar el mapa.
  let comunas = await obtenerComunas(); // Obtenemos las comunas.
  let farmacias = await obtenerFarmacias(comuna , nombre); // Obtenemos las farmacias.
  farmacias.forEach(el => {
    // Asignamos a nustra variable de coordenadas el nombre de la farmacia, su latitud y longitud.
    coordenadas.push([el.local_nombre, parseFloat(el.local_lat), parseFloat(el.local_lng)]);
  })
  // Enviamos la data a la vista llamada index.
  res.render('index', { title: 'Buscador de Farmacias', comunas, data: JSON.stringify(coordenadas) });
});

// Función que obtiene las comunas.
function obtenerComunas() {
	return new Promise((resolve, reject) => {
		request.post('https://midastest.minsal.cl/farmacias/maps/index.php/utilidades/maps_obtener_comunas_por_regiones', {
			formData: {reg_id: 7}, // La función recibe como parámetro un id de la región. 7 es la región metropolitana.
		}, (error, res, body) => {
			if (error) {
				reject(error);
			}
			resolve(body); // Envía los datos a donde sea que se haya llamado la función.
		})
	});
}

function obtenerFarmacias(comuna, nombre) {
	return new Promise((resolve, reject) => {
    request('http://localhost:3000/farmacias?comuna='+comuna+'&nombre='+nombre, function (error, response, body) {
      // Se controla errores.
      if (error) return reject(error);
      try {
          resolve(JSON.parse(body));
      } catch(e) {
          reject(e);
      }
    });
	});
}

module.exports = router;
