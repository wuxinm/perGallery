var user = require('../controllers/user');

module.exports = function (io) {
	io.on('connection', function (socket) {
      // socket.emit('news', { hello: 'world' });
      socket.on('user message', function (data) {
        console.log(data.message);
      });
    });
}