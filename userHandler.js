const users = [];

const addUser = ({ id, name, room }) => {
    if(name && room){
        name = name.split(" ").join("").toLowerCase();
        room = room.split(" ").join("").toLowerCase();
    }
    else{
        return {error: "Something went wrong..."}
    }

    const existingUser = users.find(user => user.room === room && user.name === name)
    if (!name || !room) return { error: "Username and room is required..." }
    if (existingUser) return { error: "This username is already taken in this room!" }

    const user = { id, name, room };

    users.push(user)

    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex(user => user.id === id);

    if (index != -1)  return users.splice(index, 1)[0] 
}

const getUser = (id) => users.find(user => user.id === id);

const getUsersInRoom = (room) => users.filter(user => user.room === room)

module.exports = {addUser, removeUser, getUser, getUsersInRoom}