const express = require('express');
const app = express();
const server = require('http').Server(app);
const { v4: uuidV4 } = require('uuid');
const io = require('socket.io')(server);

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`);
});

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room });
});

io.on('connection', (socket) => {
  socket.on('join-room', (roomId, userId) => {
    console.log(roomId, userId);
    socket.join(roomId);
    io.to(roomId).emit('user-connected', userId);

    socket.on('disconnect', () => {
      console.log('user disconnected');
      io.to(roomId).emit('user-disconnected', userId);
    });
  });
});

server.listen(5000);

process.on('warning', (e) => {
  console.log(e.stack);
});
