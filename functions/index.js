const functions = require('firebase-functions');
// The Firebase Admin SDK to access Cloud Firestore.
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
const cors = require('cors');
const express = require('express');
const app = express();

// Allow cross-origin requests
app.use(cors({ origin: true }));

// ejs HTML templater
app.set('view engine', 'ejs');
app.set('views', './views');

// Parse form post body
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req,res) =>{
  res.redirect('scorecard');
})

// ejs views aoo - GET
// For the initial start request
app.get('/app', (req, res) => {
  let diceRolls = [];
  diceRolls = getNRolls(6);
  let diceSum = 0;
  diceRolls.forEach(num => { diceSum += num });
  res.render('scorecard', { body: { 
    dicetotal: diceSum, 
    die1: '', 
    die2: '',
    die3: '',
    die4: '',
    die5: '',
    die6: ''
  }, dice: diceRolls });
});

// ejs views app - POST
// For every subsequent post
app.post('/app', (req, res) => {
  let diceRolls = [];

  // Find num to reroll
  let numRolls = 0;
  Object.keys(req.body).forEach(elem => { 
    if (elem.substr(0,3) === 'die') { 
      numRolls += 1;
    } 
  });
  
  diceRolls = getNRolls(numRolls);
  let diceSum = 0;
  diceRolls.forEach(num => { diceSum += num });
  req.body.dicetotal = diceSum;
  res.render('scorecard', { body: req.body, dice: diceRolls });
});

// Rolls a die n number of times and returns an array
function getNRolls(n) {
  if (n < 1 || n > 6) {
    return [];
  }
  let diceRolls = [];
  for (let i = 0; i < n; i++) {
    diceRolls.push(1 + Math.floor(Math.random()*6));
  }
  return diceRolls;
}

// Expose Express API as a single Cloud Function:
exports.app = functions.https.onRequest(app);