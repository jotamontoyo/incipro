	// Definicion de modelo

//	var models = require('../models/models.js');

	module.exports = function(sequelize, DataTypes) {			// crea la estructura de la tabla
		return sequelize.define('Quiz', {
			pregunta: {														// guarda el motivo de la incidencia
				type: DataTypes.STRING,
				validate: {notEmpty: {msg: "--> Falta Pregunta"}}
			},
			respuesta: {
				type: DataTypes.STRING
			},
			tema: {															// guarda el centro que la graba
				type: DataTypes.STRING,
				validate: {notEmpty: {msg: "--> Falta Centro"}}
			},
			image: {
				type: DataTypes.BLOB
			},
			proveedor: {													// guarda el proveedor que la origina
				type: DataTypes.STRING,
				validate: {notEmpty: {msg: "--> Falta Proveedor"}}
			},
			proceso: {
				type: DataTypes.BOOLEAN,
				defaultValue: true
			},
			UserName: {
				type: DataTypes.STRING
			},
			fecha: {
				type: DataTypes.STRING
			}
		})
	};
