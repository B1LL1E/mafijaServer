const express = require('express');
const app = express();
const { Server } = require('socket.io');
const http = require('http');
const cors = require('cors');
require('dotenv').config();

app.use(cors());

const server = http.createServer(app);


const io = new Server(server, {
    cors: {
        origin: process.env.STRONA_CLIENTA,
    },
});

let players = {};
let rooms = {};

console.log(process.env.STRONA_CLIENTA);

io.on('connection', (socket) => {

    //tworzy lobby
    socket.on('stworz', (room, nick) => {
        console.log('host ' + nick + ' dołacza do ' + room);


        players[socket.id] = {id: socket.id, room: room, nick: nick};
        socket.join(room);
        //socket.join(players[socket.id].id);
        console.log(socket.rooms);
    })


    //dolaczanie do lobby
    socket.on('dolacz', (room, nick) => {
        console.log('play ' + nick + ' dołacza do ' + room);

        players[socket.id] = {id: socket.id, room: room, nick: nick};
        socket.join(room);
        socket.join(players[socket.id].id);

        socket.to(room).emit('nowyGracz', socket.id ,room, nick);
        console.log(socket.rooms);
    })

    socket.on('lista', (room, {gracze}) => {
        // socket.join(room);
        socket.to(room).emit('listaOdp', gracze);
        console.log(gracze);
        console.log(room + ' XD');
    })
    
    socket.on('disconnect', () => {
        console.log('wywalilo gracza o id: ' + socket.id);
        socket.broadcast.emit('usun', players[socket.id]);
        delete players[socket.id];
    })




    //rozrywka host

    //iloscGlosujacych
    socket.on('iloscGlosujacych', (liczGlos, room) => {
        socket.to(room).emit('iloscGlosujacychOdp',liczGlos);
        console.log('liczba glosujacych to ' + liczGlos);
    });

    //liczba glosow
    socket.on('liczbaGlosow', (glosy, room) => {
        socket.to(room).emit('liczbaGlosowOdp', glosy);
        console.log('H nowe glosu to ');
        console.log(glosy);
    })




    //rozgrywkaGuest
    socket.on('startGry', (room) => {
        socket.to(room).emit('startGryOdp');
    })

    socket.on('twojaRola', (idGracza, nazwaKlasy) => {       
        socket.to(idGracza).emit('twojaRolaOdp' , nazwaKlasy);
        console.log(idGracza + "  " + nazwaKlasy);
    });

    //glos
    socket.on('Glos', (glos, room) => {
        console.log(room);
        socket.to(room).emit('GlosOdp', glos);
        console.log('G nowe glosu to ');
        console.log(glos);
    });

    

    

});


server.listen(3001, () => {
    console.log('server dziala na 3001');
});
