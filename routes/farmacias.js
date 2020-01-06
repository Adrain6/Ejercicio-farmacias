var express = require('express'); // Express para manejar restful.
const request = require('request'); // Para hacer solicitudes de forma más sencilla.

var router = express.Router();

router.get('/', async function(req, res, next) {
    nombre = req.query.nombre; // Nombre farmacia.
    comuna = +req.query.comuna; // Id comuna.
    let respuesta = []; // La respuesta que entregará el servicio.

    // Llamada asíncrona a la promesa que retorna la lista de farmacias.
    let farmacias = await obtenerFarmacias(); 
    console.log('terminamos', farmacias);
    
    // Se discrimina cómo se va a filtrar
    let tipoFiltro = "todo"; // Todas las farmacias por defecto.
	if(comuna !== 0 && nombre !== "") {
		tipoFiltro = "ambos"; // Se filtra por comuna y nombre.
	} else if(comuna !== 0) {
		tipoFiltro = "comuna"; // Se filtra solo por comuna.
	} else if(nombre !== "") {
		tipoFiltro = "nombre"; // Se filtra solo por nombre.
    }

    // Se itera cada farmacia.
    farmacias.forEach(el => {
        // Según el tipo de filtro se realiza la lógica.
		switch (tipoFiltro) {
            case "ambos": 
                // Se pregunta si el nombre o parte del nombre ingresado por parámetro existe en la farmacia en iteración.
                // También se pregunta por la comuna, si existe en la farmacia que se está iterando.
				if(el.local_nombre.includes(nombre.toUpperCase()) && el.fk_comuna == comuna) {
					respuesta.push(el); // De existir se agrega a la variable respuesta.
				}
				break;
			case "comuna":
                // Solo se filtra por comuna.
				if(el.fk_comuna == comuna) {
					respuesta.push(el);
				}
				break;
			case "nombre":
                // Solo se filtra por nombre.
				if(el.local_nombre.includes(nombre.toUpperCase())) {
					respuesta.push(el);
				}
				break;
			default:
                // Por defecto se envían todas las farmacias.
				respuesta = farmacias;
				break;	
		}

	});
    
    res.send(respuesta);
});

function obtenerFarmacias() {
    return new Promise((resolve, reject) => { // Declaración de la promesa.
        // Se va a la API a obtener la información.
        request('https://farmanet.minsal.cl/maps/index.php/ws/getLocalesRegion?id_region=7', function (error, response, body) {
            // Se controla errores
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

