
	var models = require('../models/models.js');

	exports.load = function(req, res, next, quizId, claveinvitado) {			// autoload. solo se ejecuta si en la peticion GET existe un :quizId. ayuda a factorizar el codigo del resto de controladores 
		models.Quiz.find({										// carga de registro quiz
			where: 		{id: Number(quizId), claveinvitado: claveinvitado},					// where indice principal id <-- quizId recibido del GET
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
