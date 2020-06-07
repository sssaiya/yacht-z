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
  newRolls = getNRolls(6);
  let diceSum = 0;
  newRolls.forEach((num) => {
    diceSum += num;
  });
  res.render("scorecard-temp", {
    body: { dicetotal: diceSum },
    dice: newRolls,
  });
});

// ejs views app - POST
// For every subsequent post
app.post("/app", (req, res) => {
  let diceRolls = [];

  // Find num to reroll and keep previous rolls
  let numRolls = 0;
  let prevRolls = [];
  let submitSelect = false;
  Object.keys(req.body).forEach((elem) => {
    if (elem.substr(0, 3) === "die") {
      if (elem.includes('value')) {
        prevRolls.push(req.body[`${elem}`]);
      } else {
        numRolls += 1;
      }
    }
    if (elem.includes('Select')) {
      submitSelect = true;
    }
  });

  diceRolls = getNRolls(5 - numRolls);
  let diceSum = 0;
  diceRolls.forEach((num) => {
    diceSum += num;
  });
  req.body.dicetotal = diceSum;

  if (submitSelect) {
    diceRolls = prevRolls;
  }

  res.render("scorecard-temp", { body: req.body, dice: diceRolls, prevRolls: prevRolls });
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

// Expose Express API as a single Cloud Function:
exports.app = functions.https.onRequest(app);
