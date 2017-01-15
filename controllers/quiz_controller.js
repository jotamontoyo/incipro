
	var models = require('../models/models.js');
	var fs = require('fs-extra');       						//File System - for file manipulation

	exports.ownershipRequired = function(req, res, next){   	// MW que permite acciones solamente si el quiz objeto pertenece al usuario logeado o si es cuenta admin
	    var objQuizOwner = req.quiz.UserId;						// userId del quiz
	    var logUser = req.session.user.id;						// userId de la sesion
	    var isAdmin = req.session.user.isAdmin;					// valor de isAdmin
	    if (isAdmin || objQuizOwner === logUser) {				// comprueba que el user del quiz es el mismo que el user logueado
	        next();
	    } else {
	        res.redirect('/');
	    }
	};

	exports.load = function(req, res, next, quizId) {			// autoload. solo se ejecuta si en la peticion GET existe un :quizId. ayuda a factorizar el codigo del resto de controladores
		models.Quiz.find({										// carga de registro quiz
			where: 		{id: Number(quizId)},					// where indice principal id <-- quizId recibido del GET
			include: 	[{model: models.Comment}]				// incluye la tabla Comment como hijo
			}).then(function(quiz) {
				if (quiz) {
					req.quiz = quiz;
					next();
				} else {
					next(new Error('No existe quizId=' + quiz[id]));
				}
			}
		).catch(function(error) {next(error);});
	};






	// GET /quizes   										--->>> GET sin req.user
	// GET /users/:userId/quizes							--->>> GET con req.user
	exports.index = function(req, res, next) {

		var qty_pagina = 31;

		var options = {
			order: [
				['fecha', 'ASC']
			]
		};

	  	if (req.user) {									// req.user se crea en autoload de user_controller si hay un GET con un user logueado
			options = {
				where: {UserId: req.user.id},
				order: [
            		['fecha', 'ASC']
        		]
			}
	  	};

	  	models.Quiz.findAll( options ).then(					// si hubo req.user ---> options contiene el SQL where UserId: req.user.id
	    	function(quizes) {
	      		res.render('quizes/index.ejs', {quizes: quizes, qty_pagina: qty_pagina, errors: []});
	    	}
	  	).catch(function(error){next(error)});

	};







	exports.resumen_index = function(req, res, next) {

		var fecha = new Date();

		var resumen = {
			mes: fecha.getUTCMonth() + 1,
			any: fecha.getUTCFullYear()
		};

		res.render('quizes/resumen_index', {resumen: resumen, errors: []});


	};










	exports.resumen = function(req, res, next) {




		var options = {

			where: {mes: req.body.resumen.mes, any: req.body.resumen.any},

			include: [{model: models.Comment, order: ['codigo', 'ASC']}],

			order: [
				['fecha', 'ASC']
			]

		};



/*		models.Quiz.findAll(options)

		.then(function(quizes) {

			var fecha_anterior = quizes[0].fecha;

		}).catch(function(error){next(error)}); */




		models.Quiz.findAll(options).then(function(quizes) {

			models.Contador.findAll({

				order: [['codigo', 'ASC']]

			}).then(function(contadores) {

				res.render('quizes/resumen', {quizes: quizes,  contadores: contadores, errors: []});

			}).catch(function(error){next(error)});

		}).catch(function(error){next(error)});

	};















	exports.show = function(req, res) {											// GET /quizes/:id
		models.Proveedor.find({
			where: 		{nombre: req.quiz.proveedor}
		}).then(function(proveedor) {
			res.render('quizes/show', {quiz: req.quiz, proveedor: proveedor, errors: []});				// renderiza la vista /quizes/show del quizId selecionado con load find()
		});																								// req.quiz: instancia de quiz cargada con autoload
	};









	exports.new = function(req, res) {																				// GET /quizes/new, baja el formulario

		var fecha = new Date();
		var dia = ("0" + fecha.getUTCDate()).slice(-2);
		var mes = ("0" + (fecha.getUTCMonth() + 1)).slice(-2);														// se le añade 1 porque van de 0 a 11
		var any = fecha.getUTCFullYear();

		var quiz = models.Quiz.build( 																				// crea el objeto quiz, lo construye con buid() metodo de sequilize
			{pregunta: "Motivo", respuesta: "Respuesta", proveedor: "Proveedor", dia: dia, mes: mes, any: any}		// asigna literales a los campos pregunta y respuestas para que se vea el texto en el <input> cuando creemos el formulario
		);

		models.Proveedor.findAll().then(function(proveedor) {
			res.render('quizes/new', {quiz: quiz, proveedor: proveedor, errors: []});   							// renderiza la vista quizes/new
		});


	};






	exports.create = function(req, res) {														// POST /quizes/create

		req.body.quiz.UserId = req.session.user.id;												// referenciamos el quiz con el UserId
		req.body.quiz.UserName = req.session.user.username;

		var quiz = models.Quiz.build( req.body.quiz );											// construccion de objeto quiz para luego introducir en la tabla
		quiz.fecha = new Date(req.body.quiz.any, req.body.quiz.mes - 1, req.body.quiz.dia);     // captura la fecha del form y la añade al quiz con clase Date()

		var errors = quiz.validate();															// objeto errors no tiene then(
		if (errors) {
			var i = 0;
			var errores = new Array();															// se convierte en [] con la propiedad message por compatibilidad con layout
			for (var prop in errors) errores[i++] = {message: errors[prop]};
			res.render('quizes/new', {quiz: quiz, errors: errores});
		} else {
			quiz 																// save: guarda en DB campos pregunta y respuesta de quiz
			.save({fields: ["pregunta", "respuesta", "tema", "UserId", "UserName", "proveedor", "fecha", "dia", "mes", "any"]})
			.then(function() {

				models.Contador.findAll({
		            order: [
						['codigo', 'ASC']
					]
		        }).then(function( contador ) {							// crea tantos comment como Contadores

					for (var i in contador) {

						var comment = models.Comment.build({

							codigo: contador[i].codigo,
							nombre: contador[i].nombre,
							ubicacion: contador[i].ubicacion,
							lectura_actual: 0,
							texto: '',
							publicado: true,
							fecha: quiz.fecha,
							dia: quiz.dia,
							mes: quiz.mes,
							any: quiz.any,
							QuizId: quiz.id														// al comment se le pasa el quizId del quiz para establecer la integridad referencial entre Quiz y Comment. indice secundario de Comment

						});

						var errors = comment.validate();
						if (errors) {
							var i = 0;
							var errores = new Array();
							for (var prop in errors) errores[i++] = {message: errors[prop]};
							res.render('comments/new', {comment: comment, errors: errores});
						} else {
							comment 																		// save: guarda en DB campos pregunta y respuesta de quiz
							.save({fields: ["codigo", "nombre", "ubicacion", "lectura_actual", "texto", "publicado", "fecha", "dia", "mes", "any", "QuizId"]})
							.then(function() {res.redirect('/quizes')});
						};

					};

				});

				res.redirect('/quizes')

			});

		};



	};










	exports.edit = function(req, res) {															// carga formulario edit.ejs
		var quiz = req.quiz;																	// req.quiz viene del autoload
		models.Proveedor.findAll().then(function(proveedor) {
			res.render('quizes/edit', {quiz: quiz, proveedor: proveedor, errors: []});   		// renderiza la vista quizes/edit junto con la lista de todos los proveedores
		});
	};








	exports.update = function(req, res) {										// modifica un quiz
//		req.quiz.fecha = req.body.quiz.fecha;

		req.quiz.fecha = new Date(req.body.quiz.any, req.body.quiz.mes - 1, req.body.quiz.dia);
		req.quiz.dia = req.body.quiz.dia;
		req.quiz.mes = req.body.quiz.mes;
		req.quiz.any = req.body.quiz.any;

		req.quiz.pregunta = req.body.quiz.pregunta;
		req.quiz.respuesta = req.body.quiz.respuesta;
		req.quiz.tema = req.body.quiz.tema;
		req.quiz.proveedor = req.body.quiz.proveedor;
		req.quiz.proceso = req.body.quiz.proceso;


/*		if (req.file) {
			req.quiz.image = req.file.buffer;
		}; */
		var errors = req.quiz.validate();
		if (errors) {
			var i = 0;
			var errores = new Array();											// se convierte en [] con la propiedad message por compatibilidad con layout
			for (var prop in errors) errores[i++] = {message: errors[prop]};
			res.render('quizes/edit', {quiz: req.quiz, errors: errores});
		} else {
			req.quiz 															// save: guarda en DB campos pregunta y respuesta de quiz
			.save({fields: ["fecha", "pregunta", "respuesta", "tema", "proveedor", "proceso", "fecha", "dia", "mes", "any"]})
			.then(function() {res.redirect('/quizes')});
		};
	};








	exports.destroy = function(req, res) {
		req.quiz.destroy().then(function() {
			for (var i in req.quiz.comments) {
				req.quiz.comments[i].destroy();
			};
			res.redirect('/quizes');
		}).catch(function(error) {next(error)});
	};

	exports.showtemas = function(req, res, next){
		models.Quiz.findAll(
			{
				attributes:['tema'],
				group: ['tema']
			}
		).then(
			function(quizes) {
				res.render('temas/index', { quizes: quizes, errors: []});
			}
		).catch(function(error) { next(error)});
	};

	exports.showbytema = function(req, res){
		models.Quiz.findAll({
			where: {tema: req.params.tema}
		}).then(
			function(quizes) {
				res.render('temas/showbytema.ejs', { quizes: quizes, errors: []});
			}
		).catch(function(error) {next(error)});
	};


	exports.image = function(req, res) {				// devuelve en la respuesta la imagen del quizId: solicitado
		res.send(req.quiz.image);
	};

	exports.page = function(req, res, next) {
		qty_pagina += 10;
		models.Quiz.findAll()
			.then(function(quizes) {
	      		res.render('quizes/index.ejs', {quizes: quizes, qty_pagina: qty_pagina, errors: []});
	    	}
	  	).catch(function(error){next(error)});
	};

	exports.uploadimg = function(req, res, next) {
        var fstream;
        req.pipe(req.busboy);
        req.busboy.on('file', function (fieldname, file, filename) {
            console.log("Uploading: " + filename);
            fstream = fs.createWriteStream('public/img/' + filename);					// Path where image will be uploaded
            file.pipe(fstream);
            fstream.on('close', function () {
                console.log("Upload Finished of " + filename);
                res.redirect('back');           										// where to go next
            });
        });
    };

	exports.search = function(req, res, next) {
		models.Quiz.findAll({
			where: {pregunta: req.param.search}
		}).then(
			function(quizes) {
				res.render('quizes/index.ejs', { quizes: quizes, errors: []});
			}
		).catch(function(error) {next(error)});
		console.log('hola search');
	};

	exports.opened = function(req, res) {
		models.Quiz.findAll({
			where: {proceso: true, UserId: req.session.user.id}
		}).then(
			function(quizes) {
				res.render('quizes/index.ejs', {quizes: quizes, errors: []});
			}
		).catch(function(error){next(error)});
	};

	exports.closed = function(req, res) {
		models.Quiz.findAll({
			where: {proceso: false, UserId: req.session.user.id}
		}).then(
			function(quizes) {
				res.render('quizes/index.ejs', {quizes: quizes, errors: []});
			}
		).catch(function(error){next(error)});
	};
	exports.answer = function(req, res) {										// GET /quizes/answer/:id
		var resultado = 'Incorrecto';
		if (req.query.respuesta === req.quiz.respuesta) {						// comprueba la variable respuesta de la peticion GET req recibida del form question.ejs vs req.quiz.respuesta, que es la respuesta que devuelve find() del autoload
			resultado = 'Correcto';
		};
		res.render('quizes/answer', {											// renderiza /views/answer.ejs con el objeto quiz y respuesta
			quiz: req.quiz,
			respuesta: resultado,
			errors: []
		});
	};
