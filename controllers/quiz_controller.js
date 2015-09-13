
	var models = require('../models/models.js');

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
	exports.index = function(req, res) {  
		var options = {};
	  	if (req.user) {										// req.user se crea en autoload de user_controller si hay un GET con un user logueado
		    options.where = {UserId: req.user.id}			
	  	};
	  	models.Quiz.findAll(options).then(					// si hubo req.user ---> options contiene el SQL where UserId: req.user.id
	    	function(quizes) {
	      		res.render('quizes/index.ejs', {quizes: quizes, errors: []});
	    	}
	  	).catch(function(error){next(error)});
	};

	exports.show = function(req, res) {											// GET /quizes/:id
		res.render('quizes/show', {quiz: req.quiz, errors: []});				// renderiza la vista /quizes/show del quizId selecionado con load find()
	};									          								// req.quiz: instancia de quiz cargada con autoload
	
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

	exports.new = function(req, res) {															// GET /quizes/new, baja el formulario
		var quiz = models.Quiz.build( 															// crea el objeto quiz, lo construye con buid() metodo de sequilize
			{pregunta: "Pregunta", respuesta: "Respuesta", proveedor: "Proveedor"}				// asigna literales a los campos pregunta y respuestas para que se vea el texto en el <input> cuando creemos el formulario
		);
		models.Proveedor.findAll().then(function(proveedor) {
			res.render('quizes/new', {quiz: quiz, proveedor: proveedor, errors: []});   		// renderiza la vista quizes/new
		}); 											
	};

		        
	exports.create = function(req, res) {										// POST /quizes/create  	
		req.body.quiz.UserId = req.session.user.id;								// referenciamos el quiz con el UserId
		req.body.quiz.UserName = req.session.user.username;
		var quiz = models.Quiz.build( req.body.quiz );							// construccion de objeto quiz para luego introducir en la tabla
		if (req.file) {
			req.quiz.image = req.file.filename;
		};
		var errors = quiz.validate();											// objeto errors no tiene then(
		if (errors) {
			var i = 0; 
			var errores = new Array();											// se convierte en [] con la propiedad message por compatibilidad con layout
			for (var prop in errors) errores[i++] = {message: errors[prop]};        
			res.render('quizes/new', {quiz: quiz, errors: errores});
		} else {
			quiz 																// save: guarda en DB campos pregunta y respuesta de quiz
			.save({fields: ["pregunta", "respuesta", "tema", "image", "UserId", "UserName", "proveedor"]})
			.then(function() {res.redirect('/quizes')});
		};
	};
	
	exports.edit = function(req, res) {															// carga formulario edit.ejs
		var quiz = req.quiz;																	// req.quiz viene del autoload
		models.Proveedor.findAll().then(function(proveedor) {
			res.render('quizes/edit', {quiz: quiz, proveedor: proveedor, errors: []});   		// renderiza la vista quizes/edit junto con la lista de todos los proveedores
		});
	};
	
	exports.update = function(req, res) {										// modifica un quiz
		req.quiz.pregunta = req.body.quiz.pregunta;
		req.quiz.respuesta = req.body.quiz.respuesta;
		req.quiz.tema = req.body.quiz.tema;
		req.quiz.proveedor = req.body.quiz.proveedor;
		req.quiz.proceso = req.body.quiz.proceso;
		if (req.file) {
			req.quiz.image = req.file.buffer;
		};
		var errors = req.quiz.validate();											
		if (errors) {
			var i = 0; 
			var errores = new Array();											// se convierte en [] con la propiedad message por compatibilidad con layout
			for (var prop in errors) errores[i++] = {message: errors[prop]};        
			res.render('quizes/edit', {quiz: req.quiz, errors: errores});
		} else {
			req.quiz 															// save: guarda en DB campos pregunta y respuesta de quiz
			.save({fields: ["pregunta", "respuesta", "tema", "image", "proveedor", "proceso"]})
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
//		tema = req.params.tema;
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
	
	
	
	
	
	
	
	
	
	