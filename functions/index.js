const functions = require("firebase-functions");
// The Firebase Admin SDK to access Cloud Firestore.
const admin = require("firebase-admin");
admin.initializeApp(functions.config().firebase);
const cors = require("cors");
const express = require("express");
const app = express();

// Allow cross-origin requests
app.use(cors({ origin: true }));

// ejs HTML templater
app.set("view engine", "ejs");
app.set("views", "./views");

// Parse form post body
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

const moveList = [
  "ones",
  "twos",
  "threes",
  "fours",
  "fives",
  "sixes",
  "three_of_a_kind",
  "four_of_a_kind",
  "full_house",
  "small_straight",
  "large_straight",
  "chance",
  "yacht_z",
];

// ejs views app - GET
// For the initial start request
app.get("/app", (req, res) => {
  let newRolls = [];
  newRolls = getNRolls(5);
  let diceSum = 0;
  newRolls.forEach((num) => {
    diceSum += num;
  });
  const scores = makeScoreArray(newRolls);

  let ai_scores = {
    ones: "",
    twos: "",
    threes: "",
    fours: "",
    fives: "",
    sixes: "",
    three_of_a_kind: "",
    four_of_a_kind: "",
    full_house: "",
    small_straight: "",
    large_straight: "",
    chance: "",
    yacht_z: "",
  };

  res.render("scorecard", {
    body: { dicetotal: diceSum, rollNum: 0, ai_scores: ai_scores },
    dice: newRolls,
    scores: scores,
    visibility: "style=visibility:hidden",
    Roll: "ROLL",
    playermode: "single",
    opponentName: "CPU",
  });
});

// ejs views app - POST
// For every subsequent post On clicking reRoll
let moveCount = 0;
app.post("/app", (req, res) => {
  let dieNames = ["die1", "die2", "die3", "die4", "die5"];
  let dice = [];

  for (let i = 0; i < dieNames.length; i++) {
    if (req.body[dieNames[i]] == undefined) {
      dice.push(getOneRoll());
    } else {
      dice.push(parseInt(req.body[dieNames[i] + "value"]));
    }
  }

  const scores = makeScoreArray(dice);

  //Check if player has just completed a turn
  const movesPlayed = getMovesPlayed(req.body);

  if (movesPlayed > moveCount) {
    console.log("HERE\n\n\n\nAI TIME\n");
    aiMove();
    moveCount = movesPlayed;
    //modify ai_scores
  }

  res.render("scorecard", {
    body: req.body,
    dice: dice,
    scores: scores,
    visibility: "style=visibility:visible",
    Roll: "REROLL x" + (3 - req.body.rollNum),
    playermode: "single",
    opponentName: "CPU",
  });
});

function getMovesPlayed(body) {
  let played = 0;
  for (let [key, value] of Object.entries(body)) {
    if (moveList.includes(key)) {
      played++;
    }
  }
  return played;
}

// ejs views app - GET
// For the initial start multiplayer request
app.get("/multiplayer", (req, res) => {
  let newRolls = [];
  newRolls = getNRolls(5);
  let diceSum = 0;
  newRolls.forEach((num) => {
    diceSum += num;
  });
  const scores = makeScoreArray(newRolls);
  res.render("scorecard", {
    body: { dicetotal: diceSum, rollNum: 0 },
    dice: newRolls,
    scores: scores,
    visibility: "style=visibility:hidden",
    Roll: "ROLL",
    playermode: "multiplayer",
    roomCode: req.query.roomCode,
    opponentName: "Waiting...",
  });
});

// Rolls a die n number of times and returns an array
function getNRolls(n) {
  if (n < 1 || n > 6) {
    return [];
  }
  let diceRolls = [];
  for (let i = 0; i < n; i++) {
    diceRolls.push(1 + Math.floor(Math.random() * 6));
  }
  return diceRolls;
}

function getOneRoll() {
  return 1 + Math.floor(Math.random() * 6);
}

function makeScoreArray(dice) {
  let scores = {
    ones: upperScores(1, dice),
    twos: upperScores(2, dice),
    threes: upperScores(3, dice),
    fours: upperScores(4, dice),
    fives: upperScores(5, dice),
    sixes: upperScores(6, dice),
    three_of_a_kind: threeFourOfAKindScore(3, dice),
    four_of_a_kind: threeFourOfAKindScore(4, dice),
    full_house: fullHouseScore(dice),
    small_straight: straight(4, dice),
    large_straight: straight(5, dice),
    chance: chanceScore(dice),
    yacht_z: yacht_z_score(dice),
  };
  return scores;
}

// For ones - sixes
function upperScores(n, dice) {
  let score = 0;
  dice.forEach((die) => {
    if (die == n) {
      score = score + n;
    }
  });
  return score;
}

// For 3 and 4 of a kind
function threeFourOfAKindScore(n, dice) {
  if (![3, 4].includes(n)) return;
  let score = 0;
  const diceCount = dieCounter(dice);
  diceCount.forEach((count) => {
    if (count >= n) {
      let diceSum = 0;
      dice.forEach((die) => {
        diceSum += die;
      });
      score = diceSum;
    }
  });
  return score;
}

// For Full House
function fullHouseScore(dice) {
  const diceCount = dieCounter(dice);

  if (diceCount.includes(2) && diceCount.includes(3)) {
    return 25;
  } else return 0;
}

function dieCounter(dice) {
  var counts = {};
  dice.forEach((die) => {
    counts[die] = (counts[die] || 0) + 1;
  });
  return Object.values(counts);
}

const smallStraights = [
  [1, 2, 3, 4, 5],
  [1, 2, 3, 4, 6],
  [2, 3, 4, 5, 6],
  [1, 2, 3, 4],
  [2, 3, 4, 5],
  [3, 4, 5, 6],
];
const largeStraights = [
  [1, 2, 3, 4, 5],
  [2, 3, 4, 5, 6],
];

// Checks if a specific array is in an array
function isArrayInArray(arr, item) {
  var item_as_string = JSON.stringify(item);

  var contains = arr.some(function (ele) {
    return JSON.stringify(ele) === item_as_string;
  });
  return contains;
}

// n = 4 for small straight, 5 for large straight
// TODO - Test this !! :)
function straight(n, dice) {
  if (![4, 5].includes(n)) return 0;
  let score = 0;
  let copy = [...dice];
  const diceSorted = copy.sort();

  const diceSortedUnique = new Set(diceSorted);
  const diceSortedUniqueArray = [...diceSortedUnique];

  if (n == 4) {
    //small straight check
    if (isArrayInArray(smallStraights, diceSortedUniqueArray)) {
      score = 30;
    }
  } else {
    //large straight check
    if (isArrayInArray(largeStraights, diceSortedUniqueArray)) score = 40;
  }

  return score;
}

function yacht_z_score(dice) {
  const diceCount = dieCounter(dice);
  if (diceCount.includes(5)) {
    return 50;
  }
  return 0;
}

function chanceScore(dice) {
  let score = 0;
  dice.forEach((die) => {
    score += die;
  });
  return score;
}

function aiMove() {
  //   // greedy ai
  //   maxScore = 0;
  //   maxScoreMove = "";
  //   for (move of moveList) {
  //     let score = score(move);
  //     if (score >= maxScore) {
  //         maxScore = score;
  //         maxScoreMove = move;
  //     }
  //   }
  //   completeMove(maxScoreMove);

  // Step 1. Roll the dice
  const aiRolls = getNRolls(5);
  console.log(aiRolls);

  const ai_scores = makeScoreArray(aiRolls);
  console.log("AI options");
  console.log(ai_scores);
  // let step1 = () => updateAIDice(aiRolls);
  // TODO Step 1.5 randomly reroll dice between 1-2 times

  // Step 2. Choose a button
  // let cpuMove = cpuMoveList[Math.floor(Math.random() * cpuMoveList.length)];
  // let step2 = () => completeMove(cpuMove, "cpu");
  // let steps = [step1, step2];
  // let i = 0;
  // let timer = setInterval(() => {
  //   steps[i++]();
  //   if (i === steps.length) {
  //     clearInterval(timer);
  //   }
  // }, AI_PAUSE);

  // cpuMoveList.splice(cpuMoveList.indexOf(cpuMove), 1);
}

// Expose Express API as a single Cloud Function:
exports.app = functions.https.onRequest(app);
