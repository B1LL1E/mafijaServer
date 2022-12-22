const express = require('express');
const app = express();
const { Server } = require('socket.io');
const http = require('http');
const cors = require('cors');
app.use(cors());

const server = http.createServer(app);


const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
    },
});

let players = {};
let rooms = {};

io.on('connection', (socket) => {

    //tworzy lobby
    socket.on('stworz', (room, nick) => {
        console.log('host ' + nick + ' dołacza do ' + room);


        players[socket.id] = {id: socket.id, room: room, nick: nick};
        socket.join(room);
        console.log(socket.rooms);
    })



    socket.on('dolacz', (room, nick) => {
        console.log('play ' + nick + ' dołacza do ' + room);

        players[socket.id] = {id: socket.id, room: room, nick: nick};
        socket.join(room);
        socket.to(room).emit('nowyGracz', socket.id ,room, nick);
        console.log(socket.rooms);
    })

    socket.on('lista', (room, {gracze}) => {
        socket.join(room);
        socket.to(room).emit('listaOdp', gracze);
        console.log(gracze);
        console.log(room + ' XD');
    })
    
    socket.on('disconnect', () => {
        console.log('wywalilo gracza o id: ' + socket.id);
        socket.broadcast.emit('usun', players[socket.id]);
        delete players[socket.id];
    })

});


server.listen(3001, () => {
    console.log('server dziala na 3001');
});