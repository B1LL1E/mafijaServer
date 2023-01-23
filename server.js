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
        rooms[room] = {iloGra: 1, host: socket.id};

        socket.join(room);
        //socket.join(players[socket.id].id);
        console.log(socket.rooms);
    })


    //dolaczanie do lobby
    socket.on('dolacz', (room, nick) => {
        console.log('play ' + nick + ' dołacza do ' + room);

        players[socket.id] = {id: socket.id, room: room, nick: nick};
        rooms[room] = {iloGra: rooms[room].iloGra + 1, host: rooms[room].host};

        
        socket.join(players[socket.id].id);
        socket.join(room);
        if(rooms[players[socket.id].room].iloGra < 4){
            socket.join(room);
            
            socket.to(room).emit('nowyGracz', socket.id ,room, nick);
            console.log('dodano gracza ' + players[socket.id].nick);
        }
        else{
            let idgracza = players[socket.id].id;

            socket.join(idgracza);
            console.log('za duzo graczy w ' + room + ' usunieto ' + players[socket.id].id);
            // setTimeout(() => {
                console.log(idgracza);
                socket.emit('rozlaczOdp', room, socket.id);
                console.log('wyslasno rozlaczOdp'); 
            // }, 2000);
            
            let pokujGracza = players[socket.id].room
            rooms[pokujGracza] = {iloGra: rooms[room].iloGra - 1, host: rooms[room].host};
            delete players[socket.id];
        }
        
        // console.log('---');
        // console.log(socket.rooms);
        // console.log(rooms[room]);
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

        console.log(players[socket.id] );
        if(players[socket.id] !== undefined){
            let socId = socket.id;
            let pokojroom = players[socId].room;

            rooms[pokojroom] = {iloGra: rooms[pokojroom].iloGra - 1, host: rooms[pokojroom].host};
            delete players[socket.id];

            if(rooms[pokojroom].host === socket.id){
                console.log('rozlaczylo hosta ' + rooms[pokojroom].host);
                console.log('rozlaczylo hosta ' + socket.id);  

                delete rooms[pokojroom];
            }
        }
        else{
            delete players[socket.id];
        } 
    })

    //za duza liczba graczy
    // socket.on('rozlacz', (id1, room, nick) => {
    //     console.log(id1);
    //     console.log('za duzo graczy w ' + room + ' usunieto ' + id1);

    //     setTimeout(() => {
    //         socket.to(id1).emit('rozlaczOdp', room, id1);
    //     }, 2000);
    //     //socket.to(players[id1].room).emit('usun', players[socket.id]);
    //     delete players[socket.id];
    //     rooms[players[socket.id].room] = {iloGra: rooms[room].iloGra - 1, host: rooms[room].host};
    // });





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
    //wyrzucono emit
    socket.on('wyrzucono', (glosy1, room, gracze, glosyGracze) => {
        socket.to(room).emit('wyrzuconoOdp', glosy1, gracze, glosyGracze);
        console.log('wyrzucono ' + glosy1.id + ' z pokoju ' + room);
    });
    //nikt nie zginol
    socket.on('wyrzuconoNull', (room, gracze, glosy) => {
        socket.to(room).emit('wyrzuconoNullOdp', gracze, glosy);
    });




    //rozgrywkaGuest
    socket.on('startGry', (room) => {
        socket.to(room).emit('startGryOdp');
    })

    socket.on('twojaRola', (idGracza, nazwaKlasy) => {    
        players[idGracza].klasa = nazwaKlasy;   
        socket.to(idGracza).emit('twojaRolaOdp', idGracza, nazwaKlasy);
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


server.listen(process.env.PORT || 3001, () => {
    console.log(`server dziala na `);
});
