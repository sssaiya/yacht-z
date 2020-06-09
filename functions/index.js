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
  console.log(scores);
  res.render("scorecard-temp", {
    body: { dicetotal: diceSum },
    dice: newRolls,
  });
});

// ejs views app - POST
// For every subsequent post On clicking reRoll
app.post("/app", (req, res) => {
  let finalRolls = [];

  if (req.body.die1 == undefined) {
    finalRolls.push(getOneRoll());
  } else {
    finalRolls.push(parseInt(req.body.die1value));
  }
  if (req.body.die2 == undefined) {
    finalRolls.push(getOneRoll());
  } else {
    finalRolls.push(parseInt(req.body.die2value));
  }
  if (req.body.die3 == undefined) {
    finalRolls.push(getOneRoll());
  } else {
    finalRolls.push(parseInt(req.body.die3value));
  }
  if (req.body.die4 == undefined) {
    finalRolls.push(getOneRoll());
  } else {
    finalRolls.push(parseInt(req.body.die4value));
  }
  if (req.body.die5 == undefined) {
    finalRolls.push(getOneRoll());
  } else {
    finalRolls.push(parseInt(req.body.die5value));
  }

  const scores = makeScoreArray(finalRolls);
  console.log(scores);

  res.render("scorecard-temp", {
    body: req.body,
    dice: finalRolls,
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
  var counts = {};
  dice.forEach((die) => {
    counts[die] = (counts[die] || 0) + 1;
  });
  const diceCount = Object.values(counts);
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
  var counts = {};
  dice.forEach((die) => {
    counts[die] = (counts[die] || 0) + 1;
  });
  const diceCount = Object.values(counts);

  if (diceCount.includes(2) && diceCount.includes(3)) {
    return 25;
  } else return 0;
}

// Expose Express API as a single Cloud Function:
exports.app = functions.https.onRequest(app);

// TODO
// 1) Game Logic - After you roll, instead of "select" in the buttons it should have what your score
//for that box should be. This can be implemented easily using javascript within the EJS template file

// SUm in EJS logic

// 2) Game Logic - It needs to keep track of how many times you've rolled,
//it'll probably be easier to just hide the re-roll button after N rolls than
// like send a rejection response from the server for too many rolls

// 3) Game Logic - This should probably be done after the first two game logic issues have been solved,
//but we need to have some super basic opponent AI.
//Don't put too much effort into making the AI super good or anything,
//we just need the game to work.
//Once you can play an actual game then we can go back and improve the AI if we want.

// 4) Game Logic - We need a win condition. If we limit the number of times
// the user can roll and calculate the score for each row,
// and have an AI that does the same thing, that's basically the whole game.
// This should be done after the above 3 game logics, but we need something that determines
// if the game has been completed and who has won, and then a little popup congratulations with a replay button
