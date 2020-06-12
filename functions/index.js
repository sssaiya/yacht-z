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
    sum: "",
    bonus: "",
    three_of_a_kind: "",
    four_of_a_kind: "",
    full_house: "",
    small_straight: "",
    large_straight: "",
    chance: "",
    yacht_z: "",
    total_score: ""
  };

  res.render("scorecard", {
    body: { dicetotal: diceSum, rollNum: 0 },
    ai_scores: ai_scores,
    dice: newRolls,
    scores: scores,
    visibility: "style=visibility:hidden",
    Roll: "ROLL",
    playermode: "single",
    opponentName: "CPU",
    gameOver: "none"
  });
});

// ejs views app - POST
// For every subsequent post On clicking reRoll
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
  getMovesPlayed(req.body);

  let ai_scores = {};
  ai_scores.ai_scores = {
    ones: req.body.ai_ones,
    twos: req.body.ai_twos,
    threes: req.body.ai_threes,
    fours: req.body.ai_fours,
    fives: req.body.ai_fives,
    sixes: req.body.ai_sixes,
    sum: req.body.ai_sum,
    bonus: req.body.ai_bonus,
    three_of_a_kind: req.body.ai_three_of_a_kind,
    four_of_a_kind: req.body.ai_four_of_a_kind,
    full_house: req.body.ai_full_house,
    small_straight: req.body.ai_small_straight,
    large_straight: req.body.ai_large_straight,
    chance: req.body.ai_chance,
    yacht_z: req.body.ai_yacht_z,
    total_score: req.body.ai_total_score
  };

  let roll = "REROLL x" + (3 - req.body.rollNum);
  let visibility = "style=visibility:visible";
  if (req.body.reroll != '') {
    ai_scores = aiMove(req.body);
    roll = 'ROLL'
    req.body.rollNum = 0;
    visibility = "style=visibility:hidden";
  }

  let winningPlayer = 'none';
  if (ai_scores.ai_scores.total_score) {
    // console.log(ai_scores.ai_scores.total_score);
    let userScore = parseInt(req.body.sum) + parseInt(req.body.bonus) + parseInt(req.body.three_of_a_kind) + parseInt(req.body.four_of_a_kind) + parseInt(req.body.full_house) + parseInt(req.body.small_straight) + parseInt(req.body.large_straight) + parseInt(req.body.chance) + parseInt(req.body.yacht_z);

    winningPlayer = 'Game over, unfortunately you lost';
    if (userScore > ai_scores.ai_scores.total_score) {
      winningPlayer = 'Game over, congratulations you won!';
    }
  }

  res.render("scorecard", {
    body: req.body,
    dice: dice,
    scores: scores,
    visibility: visibility,
    Roll: roll,
    playermode: "single",
    opponentName: "CPU",
    ai_scores: ai_scores.ai_scores,
    newMove: ai_scores.newMove,
    gameOver: winningPlayer
  });
});

function getMovesPlayed(body) {
  let played = 0;
  for (let [key] of Object.entries(body)) {
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

  let blank_scores = {
    ones: "",
    twos: "",
    threes: "",
    fours: "",
    fives: "",
    sixes: "",
    sum: "",
    bonus: "",
    three_of_a_kind: "",
    four_of_a_kind: "",
    full_house: "",
    small_straight: "",
    large_straight: "",
    chance: "",
    yacht_z: "",
    total_score: ""
  };

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
    ai_scores: blank_scores,
    gameOver: "none"
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

function aiMove(body) {
  const aiRolls = getNRolls(5);
  const ai_scores = makeScoreArray(aiRolls);

  let ai_curr_scores = {};
  ai_curr_scores['ones'] = body.ai_ones;
  ai_curr_scores['twos'] = body.ai_twos;
  ai_curr_scores['threes'] = body.ai_threes;
  ai_curr_scores['fours'] = body.ai_fours;
  ai_curr_scores['fives'] = body.ai_fives;
  ai_curr_scores['sixes'] = body.ai_sixes;
  ai_curr_scores['three_of_a_kind'] = body.ai_three_of_a_kind;
  ai_curr_scores['four_of_a_kind'] = body.ai_four_of_a_kind;
  ai_curr_scores['full_house'] = body.ai_full_house;
  ai_curr_scores['small_straight'] = body.ai_small_straight;
  ai_curr_scores['large_straight'] = body.ai_large_straight;
  ai_curr_scores['chance'] = body.ai_chance;
  ai_curr_scores['yacht_z'] = body.ai_yacht_z;

  let movePool = [];
  let upperScores = [];
  let i = 0;
  Object.keys(ai_curr_scores).forEach(score => {
    i += 1;
    if (ai_curr_scores[score] != "" && i < 7) {
      upperScores.push(parseInt(ai_curr_scores[score]));
    }
    if (ai_curr_scores[score] == "") {
      movePool.push(score);
    }
  });

  let move = movePool[Math.floor(Math.random() * movePool.length)];
  ai_curr_scores[move] = ai_scores[move];

  if (upperScores.length == 5 && Object.keys(ai_curr_scores).indexOf(move) < 6) {
    upperScores.push(parseInt(ai_curr_scores[move]));
  }

  ai_curr_scores['sum'] = body.ai_sum;
  ai_curr_scores['bonus'] = body.ai_bonus;

  if (upperScores.length == 6) {
    let newSum = 0;
    upperScores.forEach(score => { newSum += score });
    ai_curr_scores['sum'] = newSum;
    ai_curr_scores['bonus'] = 0;

    if (newSum >= 63) {
      ai_curr_scores['bonus'] = 35;
    }
  }

  if (movePool.length <= 1) {
    let totalSum = 0;
    Object.keys(ai_curr_scores).forEach(score => {
      if (score != 'sum') {
        totalSum += parseInt(ai_curr_scores[score])
      }
    });
    ai_curr_scores['total_score'] = totalSum;
  }

  return { ai_scores: ai_curr_scores, newMove: move };
}

// Expose Express API as a single Cloud Function:
exports.app = functions.https.onRequest(app);
