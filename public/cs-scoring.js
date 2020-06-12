/* eslint-disable no-use-before-define */

/* eslint-disable no-undef*/

const MAX_REROLLS = 2;
const AI_PAUSE = 1000;
// GLOBAL reference for dice values. after every roll, store values here
let currentRolls = [];
// number of times player has rerolled
let numRerolls = 0;
let totalScore = 0;
let opponentTotalScore = 0;

// Array of Current Scores
let playerScores = {};
let opponentScores = {};

// Dice checkboxes, having it load at start improves gameplay performance
let diceRow1Arr = Array.from(
    document.querySelectorAll("#playerDiceRow1 .player-dice")
);
let diceRow2Arr = Array.from(
    document.querySelectorAll("#playerDiceRow2 .player-dice")
);
let dice = diceRow1Arr.concat(diceRow2Arr);

let diceArr = [];
for (let i = 1; i <= 5; i++) {
    diceArr.push(document.getElementById(`die${i}`));
}

let cpuMoveList = [
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

// Scoring buttons, loading them at start improves gameplay performance
let scoringButtons = document
    .getElementById("scorecard")
    .querySelectorAll("button");
scoringButtons = Array.from(scoringButtons);

let btnsAndDiceShowing = false;

// get sum of all numbers - used in reduce function to add all die values
function getSum(total, num) {
    return total + Math.round(num);
}

// get n occurences of value in array. for example, if currentRolls = [1, 2, 2, 3, 3],
// getNOccurences(2, 2) would be true but getNOccurences(2, 1) would be false
function getNOccurences(n, value) {
    let numOccurences = 0;
    for (const die of currentRolls) {
        if (die == value) {
            numOccurences += 1;
        }
    }
    return n == numOccurences;
}

// check for a 3 of a kind
function check3OAK() {
    for (let i = 1; i <= 6; i++) {
        if (getNOccurences(3, i)) return true;
    }
    return false;
}

// check for a 4 of a kind thru brute force, check if there are 4 occurences of each possible die value
function check4OAK() {
    for (let i = 1; i <= 6; i++) {
        if (getNOccurences(4, i)) return true;
    }
    return false;
}

// check for a full house thru brute force, check if there are 2 occurences of 1 value and 3 occurences of another
function checkFullHouse() {
    for (let i = 1; i <= 6; i++) {
        for (let j = 1; j <= 6; j++) {
            if (getNOccurences(2, i) && getNOccurences(3, j)) return true;
        }
    }
    return false;
}

function checkSmallStraight() {
    currentRolls.sort((a, b) => a - b);
    if (/1234|2345|3456/.test(currentRolls.join("").replace(/(.)\1/, "$1"))) {
        return true;
    }
    return false;
}

function checkLargeStraight() {
    currentRolls.sort((a, b) => a - b);
    if (/12345|23456/.test(currentRolls.join("").replace(/(.)\1/, "$1"))) {
        return true;
    }
    return false;
}

// check for a 5 of a kind thru brute force, check if there are 5 occurences of each possible die value
function checkYachtZ() {
    for (let i = 1; i <= 6; i++) {
        if (getNOccurences(5, i)) return true;
    }
    return false;
}

// get any number n of random dice rolls
// use this for pressing roll / reroll buttons
function getNDiceRolls(rolls) {
    let temp = [];
    for (let i = 0; i < rolls; i++) {
        temp.push(Math.floor(Math.random() * 6) + 1);
    }
    return temp;
}

// make sure that each move is valid with the given die. for 1-6 and chance, you can use any set of die, but we need to validate for the others
function validateMove(value) {
    switch (value) {
        case "ones":
        case "twos":
        case "threes":
        case "fours":
        case "fives":
        case "sixes":
        case "chance":
            return true;
        case "three_of_a_kind":
            return check3OAK();
        case "four_of_a_kind":
            return check4OAK();
        case "full_house":
            return checkFullHouse();
        case "small_straight":
            return checkSmallStraight();
        case "large_straight":
            return checkLargeStraight();
        case "yacht_z":
            return checkYachtZ();
        default:
    }
}

// use the currentRolls to determine the correct score depending on which button is selected
function score(value) {
    let final = 0;
    switch (value) {
        case "ones":
            for (const die of currentRolls) {
                if (die == 1) final++;
            }
            break;
        case "twos":
            for (const die of currentRolls) {
                if (die == 2) final += 2;
            }
            break;
        case "threes":
            for (const die of currentRolls) {
                if (die == 3) final += 3;
            }
            break;
        case "fours":
            for (const die of currentRolls) {
                if (die == 4) final += 4;
            }
            break;
        case "fives":
            for (const die of currentRolls) {
                if (die == 5) final += 5;
            }
            break;
        case "sixes":
            for (const die of currentRolls) {
                if (die == 6) final += 6;
            }
            break;
        case "three_of_a_kind":
            final = currentRolls.reduce(getSum, 0);
            break;
        case "four_of_a_kind":
            final = currentRolls.reduce(getSum, 0);
            break;
        case "full_house":
            final = 25;
            break;
        case "small_straight":
            final = 30;
            break;
        case "large_straight":
            final = 40;
            break;
        case "chance":
            final = currentRolls.reduce(getSum, 0);
            break;
        case "yacht_z":
            final = 50;
            break;
        default:
    }
    return final;
}

function resetDice() {
    // Reset the roll button
    let rollBtn = document.getElementById("rerollBtn");
    rollBtn.innerHTML = "ROLL";
    rollBtn.disabled = false;
    rollBtn.style.opacity = 1;
    numRerolls = 0;
}

function toggleTurns() {
    let user = document.getElementById("user");
    let opponent = document.getElementById("opponent");
    let rollBtn = document.getElementById("rerollBtn");
    if (user.classList.contains("game-turn")) {
        user.classList.remove("game-turn");
        opponent.classList.add("game-turn");
        rollBtn.disabled = true;
        rollBtn.style.opacity = 0.4;
        if (!location.href.includes('multiplayer')) {
            aiMove();
        }
    } else {
        rollBtn.disabled = false;
        rollBtn.style.opacity = 1;
        opponent.classList.remove("game-turn");
        user.classList.add("game-turn");
    }
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
    let aiRolls = getNDiceRolls(5);
    let step1 = () => updateAIDice(aiRolls);
    // TODO Step 1.5 randomly reroll dice between 1-2 times

    // Step 2. Choose a button
    let cpuMove = cpuMoveList[Math.floor(Math.random() * cpuMoveList.length)];
    let step2 = () => completeMove(cpuMove, 'cpu');
    let steps = [step1, step2];
    let i = 0;
    let timer = setInterval(() => {
        steps[i++]();
        if (i === steps.length) { clearInterval(timer); }
    }, AI_PAUSE);

    cpuMoveList.splice(cpuMoveList.indexOf(cpuMove), 1);
}

function updateAIDice(opponentRolls) {
    for (let i = 0; i < 5; i++) {
        diceArr[i].nextElementSibling.style.background = `url('images/die-${opponentRolls[i]}pips.png') no-repeat`;
        diceArr[i].nextElementSibling.style.backgroundSize = "cover";
        diceArr[i].nextElementSibling.nextElementSibling.value = opponentRolls[i];
    }

    toggleDice("show");
}

// Toggles showing the dice, since opponent doesn't need to show buttons
function toggleDice(toggle) {
    let playerDice = Array.from(document.querySelectorAll(".player-dice"));

    if (toggle == "hide") {
        for (let i = 0; i < 5; i++) {
            diceArr[i].disabled = false;
            playerDice[i].style = "visibility: hidden !important";
        }
    } else {
        for (let i = 0; i < 5; i++) {
            diceArr[i].disabled = true;
            playerDice[i].style = "visibility: visible !important";
        }
    }
}

// when a button is selected on the scorecard, make sure the move is valid, then add score
function completeMove(move, user) {
    if (user == 'user') {
        toggleElements("row");
    } else {
        toggleDice("hide");
    }
    let scoreval = score(move);
    if (!validateMove(move)) {
        scoreval = 0;
    }
    let column = 'centerColumn';
    if (user == 'cpu') { column = 'rightColumn'; }
    document.querySelector(`#${move}>.${column}`).innerHTML = scoreval;
    if (user == 'cpu') {
        opponentScores[move] = scoreval;
        opponentTotalScore += scoreval;
    } else {
        playerScores[move] = scoreval;
        totalScore += scoreval;
    }

    if (user == 'cpu') {
        document.getElementById("opponentScore").innerHTML = `${opponentTotalScore} points`; // --> OFF
    } else {
        document.getElementById("userScore").innerHTML = `${totalScore} points`; // --> OFF
    }

    if (typeof socket !== "undefined") {
        socket.emit("user-move", {
            move: move,
            score: scoreval,
            roomCode: currRoomCode,
            opponentScore: totalScore,
        });
    }

    checkScorecard();

    resetDice();
    toggleTurns();
}

// Checks the scorecard and updates with sum/bonus/total score if applicable
function checkScorecard() {
    let userFinalScore = document.querySelector(`#totalScoreRow>.centerColumn`);
    let opponentFinalScore = document.querySelector(`#totalScoreRow>.rightColumn`);

    // Checks the upper half of the scorecard
    let upperScores = ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes'];
    let currScores = Object.keys(playerScores);
    let currOppScores = Object.keys(opponentScores);
    let sum = 0;
    let oppSum = 0;
    let upperSum = 0;
    let oppUpperSum = 0;

    upperScores.forEach(score => {
        if (currScores.includes(score)) {
            sum += 1;
            upperSum += playerScores[score];
        }

        if (currOppScores.includes(score)) {
            oppSum += 1;
            oppUpperSum += opponentScores[score];
        }
    });

    if (sum == 6) {
        document.querySelector(`#sum>.centerColumn`).innerHTML = upperSum;
        playerScores['Sum'] = upperSum;
        if (upperSum >= 63) {
            document.querySelector(`#bonus>.centerColumn`).innerHTML = 35;
            playerScores['Bonus'] = 35;
        } else {
            document.querySelector(`#bonus>.centerColumn`).innerHTML = 0;
            playerScores['Bonus'] = 0;
        }
        currScores = Object.keys(playerScores);
    }

    if (oppSum == 6) {
        document.querySelector(`#sum>.rightColumn`).innerHTML = oppUpperSum;
        opponentScores['Sum'] = oppUpperSum;
        if (oppUpperSum >= 63) {
            document.querySelector(`#bonus>.rightColumn`).innerHTML = 35;
            opponentScores['Bonus'] = 35;
        } else {
            document.querySelector(`#bonus>.rightColumn`).innerHTML = 0;
            opponentScores['Bonus'] = 0;
        }
        currOppScores = Object.keys(opponentScores);
    }

    if (currScores.length == 15) {
        let totalSum = 0;
        currScores.forEach(score => {
            if (!upperScores.includes(score)) {
                totalSum += playerScores[score];
            }
        });
        userFinalScore.innerHTML = totalSum;
    }

    if (currOppScores.length == 15) {
        let totalSum = 0;
        currOppScores.forEach(score => {
            if (!upperScores.includes(score)) {
                totalSum += opponentScores[score];
            }
        });
        opponentFinalScore.innerHTML = totalSum;
    }

    if (opponentFinalScore.innerHTML != "" && userFinalScore.innerHTML != "") {
        let oppScore = parseInt(opponentFinalScore.innerHTML);
        let usrScore = parseInt(userFinalScore.innerHTML);
        if (usrScore > oppScore) {
            setTimeout(function () {
                console.log('Game over, congratulations you won!');
                document.getElementById('modalPopupWrapper').style.display = 'grid';
                document.getElementById('modalMessage').innerHTML = 'Game over, congratulations you won!';
            }, 1000);
        } else {
            setTimeout(function () {
                console.log('Game over, unfortunately you lost');
                document.getElementById('modalPopupWrapper').style.display = 'grid';
                document.getElementById('modalMessage').innerHTML = 'Game over, unfortunately you lost';
            }, 1000);
        }
    }
}

function updateDice(rollBtn, dice) {
    if (rollBtn) {
        if (numRerolls == MAX_REROLLS) {
            rollBtn.disabled = true;
            rollBtn.style.opacity = 0.4;
        }
        rollBtn.innerText = `REROLL x${2 - numRerolls}`;
    }
    let rollValues = getNDiceRolls(5);
    currentRolls = [];
    for (let i = 0; i < 5; i++) {
        if (dice[i].checked) {
            currentRolls.push(
                parseInt(dice[i].nextElementSibling.nextElementSibling.value)
            );
            dice[i].checked = false;
        } else {
            dice[
                i
            ].nextElementSibling.style.background = `url('images/die-${rollValues[i]}pips.png') no-repeat`;
            dice[i].nextElementSibling.style.backgroundSize = "cover";
            dice[i].nextElementSibling.nextElementSibling.value = rollValues[i];
            currentRolls.push(rollValues[i]);
        }
    }

    // Send the new rolls to the opponent if multiplayer
    if (typeof socket !== "undefined") {
        socket.emit("user-roll", { rolls: currentRolls, roomCode: currRoomCode });
    }

    numRerolls++;
}

// Fills in the user buttons with the right moves
function updateButtons() {
    let moveList = [
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

    moveList.forEach((move) => {
        let scoreval = score(move);
        let button = document.querySelector(`#${move} button`);
        if (button) {
            if (validateMove(move)) {
                button.innerHTML = scoreval;
            } else {
                button.innerHTML = 0;
            }
        }
    });
}

// Displays the hidden dice/buttons when roll is clicked
function toggleElements(button) {
    if (btnsAndDiceShowing && button != "roll") {
        // Hide the dice / buttons
        scoringButtons.forEach((button) => {
            button.style = "visibility: hidden !important";
        });
        dice.forEach((die) => {
            die.style = "visibility: hidden !important";
        });
        btnsAndDiceShowing = !btnsAndDiceShowing;
    } else if (!btnsAndDiceShowing) {
        ``
        // Show all of the dice and buttons
        scoringButtons.forEach((button) => {
            button.style = "visibility: visible !important";
        });
        dice.forEach((die) => {
            die.style = "visibility: visible !important";
        });
        btnsAndDiceShowing = !btnsAndDiceShowing;
    }
}

window.addEventListener("DOMContentLoaded", () => {
    // prevent form submission so that everything stays client-side
    document.querySelector("#gameboard").onsubmit = (e) => {
        e.preventDefault();
    };

    // add click listener to each scorecard button to complete each move
    let scoringButtons = document
        .getElementById("scorecard")
        .querySelectorAll("button");
    scoringButtons = Array.from(scoringButtons);
    scoringButtons.forEach((button) => {
        button.addEventListener("click", function () {
            completeMove(button.name, 'user');
        });
    });

    // Set the user's turn
    document.getElementById("user").classList.add("game-turn");

    let rollBtn = document.getElementById("rerollBtn");
    rollBtn.onclick = (e) => {
        toggleElements("roll");
        updateDice(e.target, diceArr);
        updateButtons();
    };
});

document.getElementById('modalHome').addEventListener('click', e => {
    e.preventDefault();
    location.href = "/";
});

document.getElementById('modalButton').addEventListener('click', e => {
    e.preventDefault();
    location.href = "/app?";
});

/* eslint no-use-before-define: 2 */ // --> ON
/* eslint no-undef: 2 */