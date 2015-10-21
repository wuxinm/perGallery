var message = require('../controllers/message');
var notif = require('../controllers/notification');

module.exports = function (io) {
  io.on('connection', function (socket) {
    socket.on('notif', function (data) {
      notif.checkNotifExisted(data, function (notification) {
        if (notification.length === 0) {
          notif.addNewNotif(data);
          data.count = 1;
          socket.broadcast.emit('new notif', data);  
        } else {
          notif.addCount(notification[0]);
          socket.broadcast.emit('new notif', notification[0]);
        }
      });
    });
    
    socket.on('message', function (data) {
      notif.checkNotifExisted(data, function(notification) {
        if (notification.length === 0) {
          notif.addNewNotif(data);
          data.count = 1;
          socket.broadcast.emit('new notif', data);
          // add new msg as notification first
          message.addNewMessage(data);
          socket.broadcast.emit('private message', data);
        } else {
          notif.addCount(notification[0]);
          socket.broadcast.emit('new notif', notification[0]);
          message.addNewMessage(data);
          socket.broadcast.emit('private message', data);
        }
      });
      
    });
  });
}