
	// Definicion de modelo

	module.exports = function(sequelize, DataTypes) {			// crea la estructura de la tabla
		return sequelize.define('Comment', {
			texto: {
				type: DataTypes.STRING,
				validate: {notEmpty: {msg: "--> Falta Comentario"}}
			},
			publicado: {
				type: DataTypes.BOOLEAN,
				defaultValue: false
			}
		})
	};
