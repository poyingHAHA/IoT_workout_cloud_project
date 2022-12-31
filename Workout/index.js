const express = require("express");
const app = express();
const server = require("http").createServer(app)
const io = require("socket.io")(server);
const route = require("./router/route")
const imageRoute = require("./router/image")
const singlePushup = require("./router/single_pushUp")
const singlePlunk = require("./router/single_plunk")
const dualPushup = require("./router/dual_pushUp")
const dualPlunk = require("./router/dual_plunk")

const port = 3000;
app.use(express.json());

app.use(route);
app.use(singlePlunk);
app.use(singlePushup);
app.use(dualPlunk);
app.use(dualPushup);
app.use("/img", imageRoute);

const rooms = [{room:'room1', time: 0}, {room:'room2', time:0}, {room:'room3', time:0}, {room:'room4', time: 0}];
// socket.io
io.on('connection', async(socket) => {
  console.log(socket.id + " is connected");

  socket.on("player-joined",(userId) => {
    io.emit("player-joined", userId)
  })
  socket.on("data", (data) => {
      // console.log(data)
      io.emit(`distance${data.userId}`, data.data);
  })

  // push up 處裡=========================================
  socket.on("push-up-start", (data) => {
    console.log(data);
    io.emit(`push-up-start${data.userId}`, data.distance);
  })
  socket.on("push-up-count", (data) => {
    io.emit(`push-up-count${data.userId}`, data.count);
  })
  socket.on('push-up-stop', (data) => {
    io.emit(`push-up-stop${data.userId}`);
  })
  // =====================================================

  // plunk 處理===========================================
  socket.on("plunk-inf-challenge-start", (data) => {
    io.emit(`plunk-inf-challenge-start${data.userId}`, data.distance);
  })
  socket.on("plunk-inf-challenge-stop", (data) => {
    io.emit(`plunk-inf-challenge-stop`, data);
  })
  socket.on("plunk-set-challenge-end", () => {
    io.emit(`plunk-set-challenge-end`);
  })
  // =====================================================

  // 多人push up 處理======================================
  socket.on("join-push-up", (time) => {
    // 一個room最多二人，總共有四個房間
    for(const room of rooms) {
      if(!io.sockets.adapter.rooms.get(room.room) || io.sockets.adapter.rooms.get(room.room).size < 2){
        socket.join(room.room);

        // 第二個人進來通知第一個人，並用第一個人的時間做設定
        if(io.sockets.adapter.rooms.get(room.room).size === 1){
          room.time = time
        }
        else if(io.sockets.adapter.rooms.get(room.room).size === 2){
          // 當兩人都進入房間就設定時間
          io.to(room.room).emit("set-push-up-time", {roomTime: room.time, roomName: room.room})
        }
        break;
      }
    }
  })
  // 監聽兩人的次數
  socket.on('push-up-count-to', (data) => {
    io.to(data.roomName).emit('push-up-count-to', data)
  })
  // =====================================================

  // 多人plunk============================================
  socket.on("join-plunk", () => {
    for(const room of rooms) {
      if(!io.sockets.adapter.rooms.get(room.room) || io.sockets.adapter.rooms.get(room.room).size < 2){
        socket.join(room.room);

        // 第二個人進來通知第一個人，並用第一個人的時間做設定
        if(io.sockets.adapter.rooms.get(room.room).size === 2){
          // 當兩人都進入房間就設定時間
          io.to(room.room).emit("set-plunk-room", {roomTime: room.time, roomName: room.room})
        }
        break;
      }
    }
  })
  // 監聽輛人距離與時間
  socket.on('plunk-distance-to', (data) => {
    io.to(data.roomName).emit('plunk-distance-to', data)
  })

  socket.on('plunk-second-to', (data) => {
    io.to(data.roomName).emit('plunk-second-to', data)
  })

  socket.on('plunk-goalDistance-to', (data) => {
    io.to(data.roomName).emit('plunk-goalDistance-to', data)
  })
  // =====================================================

});

server.listen(port, () => {
  console.log("Server is up on port " + port);
});