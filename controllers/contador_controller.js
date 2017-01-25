
    var models = require('../models/models.js');


    exports.load = function(req, res, next, contadorId) {			// autoload. solo se ejecuta si en la peticion GET existe un :quizId. ayuda a factorizar el codigo del resto de controladores
		models.Contador.find({										// carga de registro quiz
			where: 		{id: Number(contadorId)},					// where indice principal id <-- quizId recibido del GET
			include: 	[{model: models.Criterio}]				// incluye la tabla Comment como hijo
        }).then(function( contador ) {
				if (contador) {
					req.contador = contador;
					next();
				} else {
					next(new Error('No existe contadorId=' + contador[id]));
				}
			}
		).catch(function(error) {next(error);});
	};




    exports.index = function(req, res, next) {

	  	models.Contador.findAll({
            order: [
				['id', 'ASC']
			]
        }).then(					// si hubo req.user ---> options contiene el SQL where UserId: req.user.id
	    	function( contadores ) {
	      		res.render('contadores/index.ejs', {contadores: contadores, errors: []});
	    	}
	  	).catch(function(error){next(error)});

	};




    exports.new = function(req, res) {																				// GET /quizes/new, baja el formulario


		var contador = models.Contador.build( 																				// crea el objeto quiz, lo construye con buid() metodo de sequilize
			{
                nombre: "",
                marca: "",
                modelo: "",
                ubicacion: "",
                fecha_revision: "",
                lectura_anterior: 0
            }
		);

		res.render('contadores/new', {contador: contador, errors: []});


	};


    exports.create = function(req, res) {														// POST /quizes/create

		var contador = models.Contador.build( req.body.contador );											// construccion de objeto quiz para luego introducir en la tabla


		var errors = contador.validate();

		if (errors) {
			var i = 0;
			var errores = new Array();															// se convierte en [] con la propiedad message por compatibilidad con layout
			for (var prop in errors) errores[i++] = {message: errors[prop]};
			res.render('contadores/new', {contador: contador, errors: errores});
		} else {
			contador 																// save: guarda en DB campos pregunta y respuesta de quiz
			.save()
			.then(function() {res.redirect('/contadores')});
		};

	};






    exports.show = function(req, res) {

        models.Criterio.findAll({
            where: 		{ContadorId: Number(req.contador.id)},
            order:      [['mes', 'ASC']]
        }).then(function( criterios  ) {
            res.render('contadores/show', {contador: req.contador, criterios: criterios, errors: []});
        });

	};






    exports.edit = function(req, res) {															// carga formulario edit.ejs

		res.render('contadores/edit', {contador: req.contador, errors: []});   		// renderiza la vista quizes/edit junto con la lista de todos los proveedores

	};




    exports.update = function(req, res) {										// modifica un quiz

//        req.contador.codigo = req.body.contador.codigo;
        req.contador.nombre = req.body.contador.nombre;
        req.contador.marca = req.body.contador.marca;
        req.contador.modelo = req.body.contador.modelo;
        req.contador.ubicacion = req.body.contador.ubicacion;
        req.contador.fecha_revision = req.body.contador.fecha_revision;

        var errors = req.contador.validate();
        if (errors) {
            var i = 0;
            var errores = new Array();											// se convierte en [] con la propiedad message por compatibilidad con layout
            for (var prop in errors) errores[i++] = {message: errors[prop]};
            res.render('contadores/edit', {contador: req.contador, errors: errores});
        } else {
            req.contador 															// save: guarda en DB campos pregunta y respuesta de quiz
            .save({fields: ["nombre", "marca", "modelo", "ubicacion", "fecha_revision"]})
            .then(function() {res.redirect('/contadores')});
        };
    };





    exports.destroy = function(req, res) {
		req.contador.destroy().then(function() {
            models.Criterio.findAll({
                where: 		{ContadorId: Number(req.contador.id)}
            }).then(function( criterios  ) {
                for (var i in criterios) {
    				criterios[i].destroy();
    			};
                res.redirect('/contadores');
            });
		}).catch(function(error) {next(error)});
	};
