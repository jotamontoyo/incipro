
	// construye la DB y el modelo importando las estructuras de las tablas

	var path = require('path');

	// Postgres DATABASE_URL = postgres://user:passwd@host:port/database
	// SQLite   DATABASE_URL = sqlite://:@:/
	var url = process.env.DATABASE_URL.match(/(.*)\:\/\/(.*?)\:(.*)@(.*)\:(.*)\/(.*)/);
	var DB_name  = (url[6]||null);
	var user     = (url[2]||null);
	var pwd      = (url[3]||null);
	var protocol = (url[1]||null);
	var dialect  = (url[1]||null);
	var port     = (url[5]||null);
	var host     = (url[4]||null);
	var storage  = process.env.DATABASE_STORAGE;

	var Sequelize = require('sequelize');								// crea objeto de la clase modelo ORM

	var sequelize = new Sequelize(DB_name, user, pwd, 					// Usar BBDD SQLite o Postgres. Constructor de la DB
	  { dialect:  protocol,
		protocol: protocol,
		port:     port,
		host:     host,
		storage:  storage,  											// solo SQLite (.env)
		omitNull: true      											// solo Postgres
	  }
	);

	var Quiz = sequelize.import(path.join(__dirname, 'quiz'));				// importar estructura y definicion de la tabla Quiz
	var Comment = sequelize.import(path.join(__dirname, 'comment'));		// importar estructura y definicion de la tabla Comment
	var User = sequelize.import(path.join(__dirname, 'user'));				// importar estructura y definicion de la tabla User
	var Proveedor = sequelize.import(path.join(__dirname, 'proveedor'));	// importar estructura y definicion de la tabla Provider
	var Contador = sequelize.import(path.join(__dirname, 'contador'));		// importar estructura y definicion de la tabla Contador

	Quiz.belongsTo(User);												// integridad referncial. Cada Quiz es hijo de User
	User.hasMany(Quiz);													// cada User puede tener varios Quiz

	Comment.belongsTo(Quiz);											// integridad referncial. Cada Comment es hijo de Quiz
	Quiz.hasMany(Comment);												// el padre puede tener varios hijos

	exports.Quiz = Quiz;												// exportar tablas
	exports.Comment = Comment;
	exports.User = User;
	exports.Proveedor = Proveedor;
	exports.Contador = Contador;

	sequelize.sync().then(function() {									// sequelize.sync() inicializa tabla de preguntas en DB

	  	User.count().then(function( count ) {								// then() ejecuta el manejador una vez creada la tabla

	    	if(count === 0) {   											// la tabla se inicializa solo si está vacía

				User.bulkCreate(

	        		[ {username: 'admin', password: '1234', isAdmin: true},
	          		{username: 'pepe', password: '5678'}] 					// el valor por defecto de isAdmin es 'false'

	        	).then(function() {

	        		console.log('Base de datos: tabla user inicializada');
	        		Quiz.count().then(function( count ) {
	          			if(count === 0) {   																			// la tabla se inicializa solo si está vacía
	            			Quiz.bulkCreate(
	              				[ {pregunta: 'faltas', respuesta: 'Roma', tema: 'Central', proveedor: 'Central', proceso: 'true', UserId: 2, UserName: 'pepe', fecha: Date(), dia: 0, mes: 0, any: 0}, 			// estos quizes pertenecen al usuario pepe (2)
	                			{pregunta: 'retraso', respuesta: 'Lisboa', tema: 'Central', proveedor: 'Central', proceso: 'true', UserId: 2, UserName: 'pepe', fecha: Date(), dia: 0, mes: 0, any: 0},
	                			{pregunta: 'retraso', respuesta: 'Lisboa', tema: 'Central', proveedor: 'Central', proceso: 'true', UserId: 2, UserName: 'pepe', fecha: Date(), dia: 0, mes: 0, any: 0}]
	              			).then(function(){console.log('Base de datos: tabla parte inicializada')});
	          			};
	        		});

	        		Proveedor.count().then(function( count ) {
	          			if(count === 0) {   																			// la tabla se inicializa solo si está vacía
	            			Proveedor.bulkCreate(
	              				[ {nombre: 'provider1', telefono: '999999999', email: 'somenone@host.com'},
	                			{nombre: 'provider2', telefono: '999999999', email: 'someoneelse@host.com'}]
	              		    ).then(function(){console.log('Base de datos: tabla proveedor inicializada')});
	          			};
	        		});

					Contador.count().then(function( count ) {
	          			if(count === 0) {   																			// la tabla se inicializa solo si está vacía
	            			Contador.bulkCreate(

								[
									{ codigo: 1,
									nombre: 'contador 1',
									marca: 'marca',
									modelo: 'modelo',
									ubicaion: 'ubicacion',
									fecha_revision: 'fecha',
									lectura_actual: 0,
									maximo: 0,
									minimo: 0,
									medio: 0 },

									{ codigo: 2,
									nombre: 'contador 2',
									marca: 'marca',
									modelo: 'modelo',
									ubicaion: 'ubicacion',
									fecha_revision: 'fecha',
									lectura_actual: 0,
									maximo: 0,
									minimo: 0,
									medio: 0 }
								]

	              		    ).then(function() {console.log('Base de datos: tabla contador inicializada')});
	          			};
	        		});

	      		});
	    	};
	  	});
	});





/*

	sequelize.sync().then(function() {									// sequelize.sync() inicializa tabla de preguntas en DB
		Quiz.count().then(function(count) {								// success ejecuta el manejador cuando crea la tabla. Quiz.count().success() devuelve el numero de filas
			if (count === 0) {											// se inicializa solo si esta vacia
				Quiz.create({
					pregunta: 'Capital de Italia',
					respuesta: 'Roma',
					tema: 'Geografía',
					image: './images/jota.jpg'
				});
				Quiz.create({
					pregunta: 'Capital de Portugal',
					respuesta: 'Lisboa',
					tema: 'Geografía',
					image: './images/jota.jpg'
				})
				.then(function() {console.log('Base creada')});
			};
		});
	}); */
