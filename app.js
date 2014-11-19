var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http');
var five = require('johnny-five');

var routes = require('./routes/index');
var users = require('./routes/users');

//Variables para iniciar el servidor
var app = express();
var server = app.listen(3000);
var io = require('socket.io').listen(server);

//Variables de nuestra arduino
var board = new five.Board();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;

board.on('ready', function() {

    var led = new five.Led(13);

    var piezo = new five.Piezo(3);

    //Código para socket
    io.sockets.on('connection', function(socket){
        console.log('Un tío se conectó');

        socket.on('enciende', function(data, callback){
            led.on();
            piezo.play({
                // song is composed by an array of pairs of notes and beats
                // The first argument is the note (null means "no note")
                // The second argument is the length of time (beat) of the note (or non-note)
                song: [
                  ["C4", 1 / 4],
                  ["D4", 1 / 4],
                  ["F4", 1 / 4],
                  ["D4", 1 / 4],
                  ["A4", 1 / 4],
                  [null, 1 / 4],
                  ["A4", 1],
                  ["G4", 1],
                  [null, 1 / 2],
                  ["C4", 1 / 4],
                  ["D4", 1 / 4],
                  ["F4", 1 / 4],
                  ["D4", 1 / 4],
                  ["G4", 1 / 4],
                  [null, 1 / 4],
                  ["G4", 1],
                  ["F4", 1],
                  [null, 1 / 2]
                ],
                tempo: 120
              });
        });

        socket.on('apaga', function(data, callback){
            led.off();
            piezo.noTone();
        });

        socket.on('disconnect', function(data, callback){
            console.log('Un tío se desconectó');
        })

    });

});

