
	var models = require('../models/models.js');

	exports.load = function(req, res, next, claveinvitado) {			// autoload. solo se ejecuta si en la peticion GET existe un :quizId. ayuda a factorizar el codigo del resto de controladores 
		models.Quiz.find({										// carga de registro quiz
			where: 		{claveinvitado: (claveinvitado)},					// where indice principal id <-- quizId recibido del GET
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

	exports.show = function(req, res) {											// GET /quizes/:id
		models.Proveedor.find({
			where: 		{nombre: req.quiz.proveedor} 
		}).then(function(proveedor) {
			res.render('invitados/show', {quiz: req.quiz, proveedor: proveedor, errors: []});				// renderiza la vista /quizes/show del quizId selecionado con load find()
		});
	};	

	exports.new = function(req, res) {														// GET /quizes/:quizId/comments/new, baja el formulario /views/comment.ejs
		res.render('comments/new.ejs', {quizid: req.params.quizId, errors: []}); 			// renderiza la vista comments/new del quiz -->> quizid: req.params.quizId
	};
	
	exports.create = function(req, res, next) {													// POST /quizes/:quizId/comments
		if (req.body.comment.texto) {
			var comment = models.Comment.build({												// construccion objeto comment para lugego introducir en la tabla
				texto: req.body.comment.texto,													// texto que llega del formulario
				QuizId: req.params.quizId														// al comment se le pasa el quizId del quiz para establecer la integridad referencial entre Quiz y Comment. indice secundario de Comment
			});
			var errors = comment.validate();
			if (errors) {
				var i = 0; 
				var errores = new Array();												
				for (var prop in errors) errores[i++] = {message: errors[prop]};        
				res.render('comments/new', {comment: comment, errors: errores});
			} else {
				comment 																		// save: guarda en DB campos pregunta y respuesta de quiz
				.save()
				.then(function() {res.redirect('/quizes/' + req.params.quizId)});		
			};
		} else {
			next(new Error('Introuzca un texto'));
		};
	};	