var message = require('../controllers/message');
var notif = require('../controllers/notification');

module.exports = function (io) {
	io.on('connection', function (socket) {
    socket.on('message', function (data) {
      message.addNewMessage(data);
      socket.broadcast.emit('private message', data);
      // add new msg as notification first
      data.category = 'msg';
      notif.addNewNotif(data);
      socket.broadcast.emit('new notification', data);
    });
  });
}