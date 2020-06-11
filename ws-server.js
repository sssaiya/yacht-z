var express = require('express');
var app = express();
var cors = require('cors');
var server = app.listen(process.env.PORT || 3000, "host.streamwithme.net", listen);

function listen() {
  console.log('Stream with Me listening at https://host.streamwithme.net');
}

app.use(express.static('public'));
const io = require('socket.io').listen(server);

// Holds all of the rooms, the users in those rooms, and the URL for that room
var roomList = {};

// Event handler for Web Socket Connections
io.on('connection', socket => {
  // Creates a new room for a host, hands them the room code
  // Stores the room and user info in roomList
  socket.on('create-room', () => {
    let newRoomCode = createRoom(socket.id);
    console.log(`Room Code: ${newRoomCode}`);
    socket.emit('new-room-created', newRoomCode);
    socket.join(`${newRoomCode}`);
  });

  // Joins users to a room after the URL has been fetched and loaded
  socket.on('join-room', data => {
    roomList[data.roomCode].socketIDs.push(socket.id);
    socket.join(`${data.roomCode}`);
    socket.emit('room-joined', data.roomCode);
    socket.to(`${data.roomCode}`).emit('opponent-joined', {
      message: 'Opponent has joined the match',
    });
  });

  // User left handlers
  socket.on('user-left', roomCode => {
    if (roomList[roomCode]) {
      socket.leave(`${roomCode}`);
      console.log(`Someone has left room ${roomCode}`);

      let index = roomList[roomCode].socketIDs.indexOf(socket.id);
      roomList[roomCode].socketIDs.splice(index, 1);

      // For every Socket ID still in the room, send them a message saying someone left
      for (let i = 0; i < roomList[roomCode].socketIDs.length; i++) {
        io.to(roomList[roomCode].socketIDs[i]).emit('user-left', 'Opponent left');
      }

      // If there are no more people in the room, delete it
      if (roomList[roomCode].socketIDs.length == 0) {
        delete roomList[roomCode];
        console.log(`Room ${roomCode} was deleted`);
      }
    }
  });

  // Receives the user's roll and passes it on
  socket.on('user-roll', dice => {
    socket.to(`${dice.roomCode}`).emit('opponent-rolls', {
      opponentRolls: dice.rolls
    });
  });

  // Receives the user's locked/unlocked die info and passes it no
  socket.on('user-locked-die', lockedInfo => {
    socket.to(`${lockedInfo.roomCode}`).emit('opponent-locked', {
      dieNum: lockedInfo.dieNum,
      checked: lockedInfo.checked
    });
  })

  socket.on('user-move', moveInfo => {
    socket.to(`${moveInfo.roomCode}`).emit('opponent-move', {
      move: moveInfo.move,
      score: moveInfo.score,
      opponentScore: moveInfo.opponentScore
    });
  });
});

// @param socketID: The socketID of the person making the room
function createRoom(socketID) {
  let roomCode = generateRoomCode();
  let numLoop = 0;
  while (roomCode in roomList) {
    numLoop += 1;
    roomCode = generateRoomCode();
    if (numLoop >= 100) {
      roomCode = 'ERROR, RELOAD';
      break;
    }
  }
  roomList[roomCode] = { socketIDs: [socketID] };
  return roomCode;
}

// Generates a unique 7 digit room code
function generateRoomCode() {
  let charset = 'BCDFGHJKMNPQRSTVWXYZ23456789';
  let roomCode = '';
  for (let i = 0; i < 7; i++) {
    roomCode += charset.charAt(Math.floor((Math.random() * 100) % 28));
  }
  return roomCode;
}