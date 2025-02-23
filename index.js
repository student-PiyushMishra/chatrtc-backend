const express = require('express')
const socketio = require('socket.io')
const http = require('http')

const PORT = process.env.PORT || 5000;
const router = require('./router');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./userHandler')

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const activeRooms = new Set();

io.on('connection', (socket) => {
    socket.on('join', ({ name, room }, callback) => {
        let { error, user } = addUser({ id: socket.id, name, room })
        if (error) return callback({ error: error })
        socket.join(user.room)
        socket.emit('message', { user: 'System', text: `${user.name}, welcome to room ${user.room}` })
        socket.broadcast.to(user.room).emit('message', { user: 'System', text: `${user.name} has joined the chat!` })
        io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) })
        callback();
    })

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('message', { user: user.name, text: message });
        callback();
    })

    socket.on('disconnect', (reason) => {
        const user = removeUser(socket.id);
        if (user) {
            io.to(user.room).emit('message', { user: "System", text: `${user.name} has left the chat!` })
            io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) })
            if (getUsersInRoom(user.room).length == 0) {
                activeRooms.delete(user.room);
                io.socketsLeave(user.room);
            }
        }
    })
})

app.use(router)

server.listen(PORT, () => { console.log(`Server is running at PORT: ${PORT}`) })