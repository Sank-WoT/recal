GcurrentToken = "";
firebase.initializeApp({
      messagingSenderId: "577304670149"
});
var messaging = firebase.messaging();

messaging.requestPermission()
.then(function() {
  console.log('Notification permission granted.');
  // TODO(developer): Retrieve an Instance ID token for use with FCM.
  // ...
})
.catch(function(err) {
  console.log('Unable to get permission to notify.', err);
});


// извлечь объект сообщения
var messaging = firebase.messaging();
if (Notification.permission === 'granted') {
    getToken();
} 

function getToken() {
    // запрос на отправку
    messaging.requestPermission()
        .then(function() {
            // Get Instance ID token. Initially this makes a network call, once retrieved
            // subsequent calls to getToken will return from cache.
            messaging.getToken()
                .then(function(currentToken) {
                    if (currentToken) {
                        //??
                        GcurrentToken = currentToken;
                        console.log(currentToken);
                        sendTokenToServer(currentToken);
                    } else {
                        // Выводит сообщение об ошибке.
                        showError('No Instance ID token available. Request permission to generate one.');
                        updateUIForPushPermissionRequired();
                        setTokenSentToServer(false);
                    }
                })
                .catch(function(error) {
                    // Выводит сообщение об ошибке.
                    showError('An error occurred while retrieving token.', error);
                    //??
                    setTokenSentToServer(false);
                });
        })
        .catch(function(error) {
            // Выводит сообщение об ошибке.
            showError('Unable to get permission to notify.', error);
        });
}

function sendTokenToServer(currentToken) {
    if (!isTokenSentToServer(currentToken)) {
        // отправлен токен на сервер
        console.log('Sending token to server...');
        //??
        setTokenSentToServer(currentToken);
    } else {
        console.log('Token already sent to server so won\'t send it again unless it changes');
    }
}

function setTokenSentToServer(currentToken) {
    if (currentToken) {
        // установить значение из локального хранилища
        window.localStorage.setItem('sentFirebaseMessagingToken', currentToken);
    } else {
        // удалить значение локального хранилища
        window.localStorage.removeItem('sentFirebaseMessagingToken');
    }
}

function isTokenSentToServer(currentToken) {
    // получить значение из локального хранилища
    return window.localStorage.getItem('sentFirebaseMessagingToken') == currentToken;
}

function showError(error, error_data) {
    // 
    if (typeof error_data !== "undefined") {
        console.error(error + ' ', error_data);
    } else {
        console.error(error);
    }

    alert.show();
    alert_message.html(error);
}

messaging.onMessage(function(payload) {
    console.log('onMessage:', payload);
});

/**
 * function Ajax request
 * @param  {[type]} 
 * @param  {[type]} 
 * @return null
 */
$(function(){
    $('#form').submit(function(e){
        //отменяем стандартное действие при отправке формы
        e.preventDefault();
        var m_data=$('#name').val();
        console.log(m_data);
        $.ajax({
           type: 'POST',
           url: '/register',
           data: {name: m_data,token: GcurrentToken},
           success: function(msg){
             alert( "Data Saved: " + msg );
           }
        });
        $('#name').val('');
    });
});
