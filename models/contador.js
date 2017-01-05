
    // Definicion de modelo


    module.exports = function(sequelize, DataTypes) {			// crea la estructura de la tabla
        return sequelize.define('Contador', {

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

            lectura_anterior: {
                type: DataTypes.FLOAT
            },

            lectura_actual: {
                type: DataTypes.FLOAT
            }

/*            maximo: {
                type: DataTypes.FLOAT
            },

            minimo: {
                type: DataTypes.FLOAT
            },

            medio: {
                type: DataTypes.FLOAT
            } */


        })
    };
