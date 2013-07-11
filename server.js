var express = require('express');
var socket = require('socket.io');
var fs = require('fs');
var http = require('http')
var app = express();
var server = http.createServer(app)
var io = require('socket.io').listen(server);

// Configure the server to use static content (the Cargo-Webpage)
app.configure(function () {
  app.use(
    "/", //the URL throught which you want to access to you static content
    express.static(__dirname) //where your static content is located in your filesystem
  );
});

server.listen(8080);
console.log("Started listening on Port 8080");

// Handle Client connection
io.sockets.on('connection', function (socket) {
  socket.on('myEvent', function (data) {
    console.log(data);
  });

  socket.on('getAvailableFiles', function (data) {
    var files = fs.readdirSync('./data/vtk/');
    socket.emit('sendAvailableFiles', files);
  });
  socket.on('requestVTKFile', function(data){
  	console.log("Requested file " + data.filename);

  	fs.readFile('./data/vtk/' + data.filename, 'utf8', function (err,data) {
		  if (err) {
		    return console.log(err);
		  }
		  socket.emit('receiveVTKFile', data);
		});
  });
});