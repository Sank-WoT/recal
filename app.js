
var peremen = 'dfgfdg';
// подключение express
var express = require("express");
var bodyParser = require("body-parser");
var firebase = require("firebase");
var admin = require("firebase-admin");
var serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://recal-ru.firebaseio.com"
});
// создаем объект приложения
var app = express();
var config = {
    apiKey: "AIzaSyDDBrpA8SziMN8KECgpIk816a1qRNwfgnw",
    authDomain: "recal-ru.firebaseapp.com",
    databaseURL: "https://recal-ru.firebaseio.com/",
    storageBucket: "recal-ru.appspot.com",
    messagingSenderId: "577304670149"
    };
    firebase.initializeApp(config);
app.use(express.static(__dirname + "/public"));
process.env.NODE_ENV = 'production';

firebase.auth().signInAnonymously().catch(function(error) {
  // Handle Errors here.
  var errorCode = error.code;
  var errorMessage = error.message;
  // ...
});

// now time
function time(){
	return parseInt(new Date().getTime()/1000)
}

function Bdrequet(callback) {
	// Обращение к базе данных
	firebase.auth().onAuthStateChanged(function(user) {
	  if (user) {
	    // User is signed in.
	    var isAnonymous = user.isAnonymous;
	    var uid = user.uid;  
	    console.log(uid);
	    // создаем парсер для данных application/x-www-form-urlencoded
		var urlencodedParser = bodyParser.urlencoded({extended: false});
		app.post("/register", urlencodedParser, function (request, response) {
			var Utime = time();
			var refer = 'Users/' + request.body.token;   
			//console.log(" " + request.body.token);
		    if(!request.body) return response.sendStatus(400);
		    firebase.database().ref(refer).push({
		    "body": request.body.name,
		    "time": Utime,
		    "stadia": "-1"
		    });
		  response.send(`${request.body.name}`);
		});
	  } else {
	  }
	});
	callback();
}
// запуск ассинхронной функции
Bdrequet(function (err) {
    if(err) throw err;
});

function Update(callback, id, stadia, registrationToken) {	
	var refer = 'Users/' + registrationToken + '/' + id;
 	var fruits = [60, 1200, 86400, 1209600, 4838400];
 	var Utime = time() + fruits[stadia];
 	var ref = firebase.database().ref();
 	var user = ref.child(refer);
 	user.once('value', function(snapshot) {
    if( snapshot.val() === null ) {
        /* does not exist */
    } else {
        snapshot.ref.update({
	    "time": Utime,
	    "stadia": stadia
    });
    }

	});
 	callback();
}
// запросы на обновление
function Request(callback) {
	var ref = firebase.app().database().ref();
	var at= ref.child('/Users');
	at.on('child_added', registrationToken => {
		var attendees = ref.child('/Users/'+ registrationToken.key);
			attendees.on('child_added', snap => {
				let user = ref.child('/Users/'+ registrationToken.key + '/' + snap.key);
				user.once('value').then(userSnap => {
					// получить сообщение 
					Recals = userSnap.val();
					if(Recals.time < time()) {
						try {
							// ассинхронная отправка
							console.log("Send");
							MessageAsy(function (err){
   								if(err) throw err;
							}, registrationToken.key, snap.key);
							console.log("Update");
							Recals.stadia++;
							// обновляем данные в бд
							Update(function (err) {
							    if(err) throw err;
							}, snap.key, Recals.stadia, registrationToken.key);	
							//console.log("Time:   " + time());
							//console.log("TIME:" + Recals.time);
							// переход на новую стади.
						}
						catch(err) {
							console.log('Error  ' + err);
						}
					}
				});
			} );
	});	
}
// запрос каждые 60 секунд для обновления данных
var timerId = setTimeout(function tick() {
Request(function (err) {
    if(err) throw err;
});
	console.log('Обновление');
	timerId = setTimeout(tick, 60000);
}, 60000);


app.listen(433);

// отправка сообщения ассинхронно
function MessageAsy(callback, registrationToken, id){
	// получить сообщение
	var ref = firebase.app().database().ref('/Users/' + registrationToken + '/' + id + '/body');
	ref.once('value')
	.then(function (snap) {
		let call = new Recal(snap.val());
		call.SendRecal(registrationToken);
		//sends(snap.val());
	});
	callback();
}

class Recal {
	constructor(body, stad) {
    	this.body = body;
  	}  

	sends(registrationToken) {
		//данные нотификации
		var payload = {
			notification: {
			    title: "Recal Time",
			    body: this.body,
			    icon: "./favicon.png"
		  	}
		};

		var option = {
			priority: "high",
		    timeToLive: 60 * 60 * 24
		}

		admin.messaging().sendToDevice(registrationToken, payload, option)
		  .then(function(response) {
		    // See the MessagingDevicesResponse reference documentation for
		    // the contents of response.
		    console.log("Successfully sent message:", response);
		  })
		  .catch(function(error) {
		    console.log("Error sending message:", error);
		  });
		}

  	SendRecal(registrationToken) {
		this.sends(registrationToken);
  	}
}
