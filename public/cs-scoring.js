/* eslint-disable no-use-before-define */

/* eslint-disable no-undef*/

const MAX_REROLLS = 2;
// GLOBAL reference for dice values. after every roll, store values here
let currentRolls = [];
// number of times player has rerolled
let numRerolls = 0;
let totalScore = 0;

// Dice checkboxes, having it load at start improves gameplay performance
let diceRow1Arr = Array.from(
    document.querySelectorAll("#playerDiceRow1 .player-dice")
);
let diceRow2Arr = Array.from(
    document.querySelectorAll("#playerDiceRow2 .player-dice")
);
let dice = diceRow1Arr.concat(diceRow2Arr);

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
    } else {
        rollBtn.disabled = false;
        rollBtn.style.opacity = 1;
        opponent.classList.remove("game-turn");
        user.classList.add("game-turn");
    }
}

// when a button is selected on the scorecard, make sure the move is valid, then add score
function completeMove(move) {
    toggleElements("row");
    let scoreval = score(move);
    if (!validateMove(move)) {
        scoreval = 0;
    }
    document.querySelector(`#${move}>.centerColumn`).innerHTML = scoreval;

    totalScore += scoreval;
    document.getElementById("userScore").innerHTML = `${totalScore} points`; // --> OFF
    if (socket !== "undefined") {
        socket.emit("user-move", {
            move: move,
            score: scoreval,
            roomCode: currRoomCode,
            opponentScore: totalScore,
        });
    }

    resetDice();
    toggleTurns();
}

function updateDice(rollBtn, dice) {
    if (numRerolls == MAX_REROLLS) {
        rollBtn.disabled = true;
        rollBtn.style.opacity = 0.4;
    }
    rollBtn.innerText = "REROLL";
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
    if (socket !== "undefined") {
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
            completeMove(button.name);
        });
    });

    // dice checkbox reference
    let dice = [];
    for (let i = 1; i <= 5; i++) {
        dice.push(document.getElementById(`die${i}`));
    }

    // Set the user's turn
    document.getElementById("user").classList.add("game-turn");

    let rollBtn = document.getElementById("rerollBtn");
    rollBtn.onclick = (e) => {
        toggleElements("roll");
        updateDice(e.target, dice);
        updateButtons();
    };
});

/* eslint no-use-before-define: 2 */ // --> ON
/* eslint no-undef: 2 */
