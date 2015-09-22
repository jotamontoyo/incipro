
	var models = require('../models/models.js');

	exports.load = function(req, res, next, claveinvitado) {			
		models.Quiz.find({												
			where: 		{claveinvitado: claveinvitado},
			include: 	[{model: models.Comment}]							
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
