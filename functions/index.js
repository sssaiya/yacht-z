const functions = require('firebase-functions');
// The Firebase Admin SDK to access Cloud Firestore.
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
const cors = require('cors');
const express = require('express');
const app = express();

// Allow cross-origin requests
app.use(cors({ origin: true }));

// app.get("/", (req, res) => {
//     res.status(200).send(leaderboard)
// });

// Route handler for the move choice
app.get('/move/:choice', (req, res) => {
  let moveChoice = req.params.choice;

  if (moveChoice === 'ones') {
    res.status(200).send(moveChoice);
  } else if (moveChoice === 'twos') {
    res.status(200).send(moveChoice);
  } else if (moveChoice === 'threes') {
    res.status(200).send(moveChoice);
  } else if (moveChoice === 'fours') {
    res.status(200).send(moveChoice);
  } else if (moveChoice === 'fives') {
    res.status(200).send(moveChoice);
  } else if (moveChoice === 'sixes') {
    res.status(200).send(moveChoice);
  } else if (moveChoice === 'three-of-a-kind') {
    res.status(200).send(moveChoice);
  } else if (moveChoice === 'four-of-a-kind') {
    res.status(200).send(moveChoice);
  } else if (moveChoice === 'full-house') {
    res.status(200).send(moveChoice);
  } else if (moveChoice === 'small-straight') {
    res.status(200).send(moveChoice);
  } else if (moveChoice === 'large-straight') {
    res.status(200).send(moveChoice);
  } else if (moveChoice === 'chance') {
    res.status(200).send(moveChoice);
  } else if (moveChoice === 'yacht-z') {
    res.status(200).send(moveChoice);
  } else {
    res.status(200).send('Not recognized');
  }
  
});

// Route handler for a basic roll
app.get('/roll/:numRolls', (req, res) => {
  let numRolls = req.params.numRolls;
  if (numRolls < 1 || numRolls > 6) {
    res.status(400).send({error: 'Incorrect syntax'} );
  }
  let diceRolls = [];
  for (let i = 0; i < numRolls; i++) {
    diceRolls.push(1 + Math.floor(Math.random()*6));
  }
  res.status(200).send(diceRolls);
});

// Expose Express API as a single Cloud Function:
exports.move = functions.https.onRequest(app);