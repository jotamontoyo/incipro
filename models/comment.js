
	// Definicion de modelo

	module.exports = function(sequelize, DataTypes) {			// crea la estructura de la tabla
		return sequelize.define('Comment', {

			texto: {
				type: DataTypes.STRING
			},

			publicado: {
				type: DataTypes.BOOLEAN,
				defaultValue: false
			},

			codigo: {
                type: DataTypes.INTEGER
            },

			nombre: {
                type: DataTypes.STRING

            },

            marca: {
                type: DataTypes.STRING
            },

            modelo: {
                type: DataTypes.STRING

            },

            ubicacion: {
                type: DataTypes.STRING
            },

            fecha_revision: {
                type: DataTypes.STRING
            },

            lectura_actual: {
                type: DataTypes.FLOAT
            },

            maximo: {
                type: DataTypes.FLOAT
            },

            minimo: {
                type: DataTypes.FLOAT
            },

            medio: {
                type: DataTypes.FLOAT
            },

			fecha: {
				type: DataTypes.DATE
			},

			dia: {
				type: DataTypes.INTEGER
			},

			mes: {
				type: DataTypes.INTEGER
			},

			any: {
				type: DataTypes.INTEGER
			}




		})
	};
