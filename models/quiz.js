	// Definicion de modelo

	module.exports = function(sequelize, DataTypes) {			// crea la estructura de la tabla
		return sequelize.define('Quiz', { 
			pregunta: {
				type: DataTypes.STRING,
				validate: {notEmpty: {msg: "--> Falta Pregunta"}}
			},
			respuesta: {
				type: DataTypes.STRING,
				validate: {notEmpty: {msg: "--> Falta Respuesta"}}
			},
			tema: {
				type: DataTypes.STRING,
				validate: {notEmpty: {msg: "--> Falta Tema"}}
			},
			image: {
				type: DataTypes.BLOB
			}
		})
	};