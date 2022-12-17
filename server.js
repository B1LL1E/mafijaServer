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


io.on('connection', (socket) => {
    //console.log(`podlaczono nowego usera: ${socket.id}`)

    // socket.on('dolacz', (data) => {
    //     socket.join(data);
    // });

    // socket.on('rozlacz', (data) => {
    //     socket.data.size === 0;
    // });

    socket.on('wysWia', (data, room) => {
        if(room === ''){
            socket.broadcast.emit('odpowiedz', data);
        }
        else{
            socket.to(room).emit('odpowiedz', data);
        }  
    });

    socket.on('dolacz', (room) => {
        console.log('polaczono z ' + room);
        socket.join(room);
        socket.to(room).emit('odpowiedz', room);
    });

    socket.on('wiado', (data, room) => {
        console.log(data);
        socket.to(room).emit('odpo', data);
    })
    
});




server.listen(3001, () => {
    console.log('server dziala na 3001');
});