const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const argv = yargs(hideBin(process.argv)).argv
const { Board, Proximity, Button } = require("johnny-five");
const io = require("socket.io-client");
require('dotenv').config()

const board = new Board({
  port: argv.port
});

const socket = io(process.env.SOCKET_SERVER); // cloud server
// const socket = io("ws://localhost:3000"); // localhost

let userId = 0;
// 事件參數管理
let count = 0;
let flag = 0;
// push-up事件參數
let pushUpStart = false;
let pushUpDistance = 0;
// plunk 事件參數
let plunkStart = false;
let plunkDistance = 0;


socket.on("connection", () => {
  console.log(socket.id)
}) 

socket.on("player-joined", (playerId) => {
  if(userId === 0){
    userId = playerId;
    console.log(`當前玩家 ${userId}`);
    // 監聽Pushup事件
    socket.on(`push-up-stop${userId}`, () =>{ pushUpStart = false; pushUpDistance = 0; count=0; flag=0});
    socket.on(`push-up-start${userId}`, (distance) => { pushUpStart = true; pushUpDistance = distance; });
    // 監聽Pushup dual事件
    
    // 監聽plunk事件
    socket.on(`plunk-inf-challenge-start${userId}`, (distance) =>{
      plunkDistance=distance; 
      plunkStart=true; 
    })
    socket.on(`plunk-set-challenge-end${userId}`, () => { plunkStart = false; })
  }
})

board.on("ready", () => {
  // HC-SR04
  const proximity = new Proximity({
    controller: "HCSR04",
    pin: "A0",
    freq: 100,
  });


  proximity.within([0, 100], "cm", () => {
    const { cm } = proximity;
    // console.log(cm)
    socket.emit("data", {userId, data: cm});

    // push up次數邏輯
    if(pushUpStart){
      console.log("伏地挺身開始: ",Math.floor(count/2))
      if (cm > pushUpDistance - 5 && flag === 1) {
        count += 1;
        flag = 0;
      } else if (flag === 0 && cm < 10) {
        count += 1;
        flag = 1;
      }
      socket.emit(`push-up-count`, {userId, count: Math.floor(count/2)});
    }
    
    // 處理plunk失誤: 超過+-5就失誤
    if(plunkStart){
      if(Math.abs(cm - plunkDistance) > 5){
        console.log("結束")
        plunkStart = false; 
        plunkDistance = 0;
        socket.emit(`plunk-inf-challenge-stop`, {userId})
      }
    }
  });
});
