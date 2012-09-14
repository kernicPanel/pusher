window.onload = function () {
  // Connect to socket.io
  var socket = io.connect();

    socket.on('log', function(data){
      console.log("data : ", data);
    });

  // React to a received message
  socket.on('connect', function (data) {
    console.log("data : ", data);

    // Modify the DOM to show the message
    document.getElementById("msg").innerHTML = data;

    // Send a message back to the server
    socket.emit('pong', {
      msg: "The web browser also knows socket.io."
    });
  });
};
