/* eslint-disable no-undef*/
const socket = io("https://host.streamwithme.net/");
/* eslint-enable no-undef*/

var currRoomCode = "";

let diceArrWS = [];
for (let i = 1; i <= 5; i++) {
  diceArrWS.push(document.getElementById(`die${i}`));
}

let opponentScoresWS = {};

console.log("Websocket JS");

// If the user input a room code, join that room, else create one
if (window.location.search == "") {
  // Send message saying room is created
  socket.emit("create-room", "Create a room");
} else {
  let query = new URLSearchParams(window.location.search);
  currRoomCode = query.get("roomCode");
  socket.emit("join-room", { roomCode: currRoomCode });
}

// Receive message that room was created successfully
socket.on("new-room-created", (roomCode) => {
  currRoomCode = roomCode;
  console.log(`Room created @ ${roomCode}`);
  document.getElementById("roomCodeText").innerHTML = roomCode;

  let user = document.getElementById("user");
  user.classList.remove("game-turn");

  let rollBtn = document.getElementById("rerollBtn");
  rollBtn.disabled = true;
  rollBtn.style.opacity = 0.4;
});

// Receive message that room was joined successfully
socket.on("room-joined", (roomJoinedCode) => {
  document.getElementById("opponentName").innerHTML = "OPPONENT";
  document.getElementById("cpuHeader").innerHTML = "OPPONENT";
  console.log(`Joined room ${roomJoinedCode}`);
});

// Receive message that an opponent has joined the room
socket.on("opponent-joined", (message) => {
  toggleTurns();
  toggleTurns();
  document.getElementById("opponentName").innerHTML = "OPPONENT";
  document.getElementById("cpuHeader").innerHTML = "OPPONENT";
  console.log(message.message);
});

// Receive dice rolls from the opponent
socket.on("opponent-rolls", (dice) => {
  console.log(dice.opponentRolls);
  updateOpponentDice(dice.opponentRolls);
  diceArrWS.forEach((die) => (die.checked = false));
});

// If dice are received from the opponent, the new dice are updated on screen
function updateOpponentDice(opponentRolls) {
  for (let i = 0; i < 5; i++) {
    diceArrWS[
      i
    ].nextElementSibling.style.background = `url('images/die-${opponentRolls[i]}pips.png') no-repeat`;
    diceArrWS[i].nextElementSibling.style.backgroundSize = "cover";
    diceArrWS[i].nextElementSibling.nextElementSibling.value = opponentRolls[i];
  }

  toggleDice("show");
}

// Toggles the turns between the User and the Opponent
function toggleTurns() {
  let user = document.getElementById("user");
  let opponent = document.getElementById("opponent");
  let rollBtn = document.getElementById("rerollBtn");
  if (user.classList.contains("game-turn")) {
    user.classList.remove("game-turn");
    opponent.classList.add("game-turn");
    rollBtn.disabled = true;
    rollBtn.style.opacity = 0.4;
  } else {
    rollBtn.disabled = false;
    rollBtn.style.opacity = 1;
    opponent.classList.remove("game-turn");
    user.classList.add("game-turn");
  }
  diceArrWS.forEach((die) => (die.checked = false));
}

// Toggles showing the dice, since opponent doesn't need to show buttons
function toggleDice(toggle) {
  let playerDice = Array.from(document.querySelectorAll(".player-dice"));

  if (toggle == "hide") {
    for (let i = 0; i < 5; i++) {
      diceArrWS[i].disabled = false;
      playerDice[i].style = "visibility: hidden !important";
    }
  } else {
    for (let i = 0; i < 5; i++) {
      diceArrWS[i].disabled = true;
      playerDice[i].style = "visibility: visible !important";
    }
  }
}

// Sends message when the first die is locked/unlocked
diceArrWS[0].addEventListener("click", () => {
  if (document.getElementById("user").classList.contains("game-turn")) {
    socket.emit("user-locked-die", {
      dieNum: 1,
      checked: diceArrWS[0].checked,
      roomCode: currRoomCode,
    });
  }
});

// Sends message when the first die is locked/unlocked
diceArrWS[1].addEventListener("click", () => {
  if (document.getElementById("user").classList.contains("game-turn")) {
    socket.emit("user-locked-die", {
      dieNum: 2,
      checked: diceArrWS[1].checked,
      roomCode: currRoomCode,
    });
  }
});

// Sends message when the first die is locked/unlocked
diceArrWS[2].addEventListener("click", () => {
  if (document.getElementById("user").classList.contains("game-turn")) {
    socket.emit("user-locked-die", {
      dieNum: 3,
      checked: diceArrWS[2].checked,
      roomCode: currRoomCode,
    });
  }
});

// Sends message when the first die is locked/unlocked
diceArrWS[3].addEventListener("click", () => {
  if (document.getElementById("user").classList.contains("game-turn")) {
    socket.emit("user-locked-die", {
      dieNum: 4,
      checked: diceArrWS[3].checked,
      roomCode: currRoomCode,
    });
  }
});

// Sends message when the first die is locked/unlocked
diceArrWS[4].addEventListener("click", () => {
  if (document.getElementById("user").classList.contains("game-turn")) {
    socket.emit("user-locked-die", {
      dieNum: 5,
      checked: diceArrWS[4].checked,
      roomCode: currRoomCode,
    });
  }
});

// Receives locked message from the opponent
socket.on("opponent-locked", (lockedInfo) => {
  let dieElem = document.getElementById(`die${lockedInfo.dieNum}`);
  dieElem.checked = lockedInfo.checked;
});

// Receives a move message from the opponent
socket.on("opponent-move", (moveInfo) => {
  document.querySelector(`#${moveInfo.move}>.rightColumn`).innerHTML =
    moveInfo.score;
  document.getElementById(
    "opponentScore"
  ).innerHTML = `${moveInfo.opponentScore} points`;

  opponentScoresWS[moveInfo.move] = moveInfo.score;
  checkOpponentScorecard();

  toggleTurns();
  toggleDice("hide");
});

// Room wasn't found, route back to home page
socket.on('room-not-found', msg => {
  alert(msg);
  //TODO - Route back to homepage
});

// Room full, route back to home page
socket.on('room-full', msg => {
  alert(msg);
  //TODO - Route back to homepage
});

// Checks the scorecard and updates with sum/bonus/total score if applicable
function checkOpponentScorecard() {
  let userFinalScore = document.querySelector(`#totalScoreRow>.centerColumn`);
  let opponentFinalScore = document.querySelector(`#totalScoreRow>.rightColumn`);

  // Checks the upper half of the scorecard
  let upperScores = ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes'];
  let currScores = Object.keys(opponentScoresWS);
  let sum = 0;
  let upperSum = 0;

  upperScores.forEach(score => {
    if (currScores.includes(score)) {
      sum += 1;
      upperSum += opponentScoresWS[score];
    }
  });

  if (sum == 6) {
    document.querySelector(`#sum>.rightColumn`).innerHTML = upperSum;
    opponentScoresWS['Sum'] = upperSum;
    if (upperSum >= 63) {
      document.querySelector(`#bonus>.rightColumn`).innerHTML = 35;
      opponentScoresWS['Bonus'] = 35;
    } else {
      document.querySelector(`#bonus>.rightColumn`).innerHTML = 0;
      opponentScoresWS['Bonus'] = 0;
    }
    currScores = Object.keys(opponentScoresWS);
  }

  if (currScores.length == 15) {
    let totalSum = 0;
    currScores.forEach(score => {
      if (!upperScores.includes(score)) {
        totalSum += opponentScoresWS[score];
      }
    });
    opponentFinalScore.innerHTML = totalSum;
  }

  if (opponentFinalScore.innerHTML != "" && userFinalScore.innerHTML != "") {
    let oppScore = parseInt(opponentFinalScore.innerHTML);
    let usrScore = parseInt(userFinalScore.innerHTML);
    if (usrScore > oppScore) {
      console.log('Game over, congratulations you won!');
    } else {
      console.log('Game over, unfortunately you lost');
    }
  }
}

// Send message that user left room before page unloads
window.addEventListener("beforeunload", () => {
  socket.emit("user-left", currRoomCode);
});
