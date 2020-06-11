const MAX_REROLLS = 2;
// GLOBAL reference for dice values. after every roll, store values here
let currentRolls = []; 
// number of times player has rerolled
let numRerolls = 0;


// get sum of all numbers - used in reduce function to add all die values
function getSum(total, num) {
    return total + Math.round(num);
}

// get n occurences of value in array. for example, if currentRolls = [1, 2, 2, 3, 3], 
// getNOccurences(2, 2) would be true but getNOccurences(2, 1) would be false
function getNOccurences(n, value) {
    let temp = 0;
    for(const die of currentRolls){
        if (die == value) temp++;
    }
    return (n == temp);
}

// check for a 3 of a kind thru brute force, check if there are 3 occurences of each possible die value
function check3OAK(){
    for(let i = 1; i <= 6; i++){
        if(getNOccurences(3, i)) return true;
    }
    return false;
}

// check for a 4 of a kind thru brute force, check if there are 4 occurences of each possible die value
function check4OAK(){
    for(let i = 1; i <= 6; i++){
        if(getNOccurences(4, i)) return true;
    }
    return false;
}

// check for a full house thru brute force, check if there are 2 occurences of 1 value and 3 occurences of another
function checkFullHouse(){
    for(let i = 1; i <= 6; i++){
        for(let j = 1; j <= 6; j++){
            if(getNOccurences(2, i) && getNOccurences(3, j)) return true;
        }
    }
    return false;
}

function checkSmallStraight(){
    currentRolls.sort((a,b) => a-b);
    if (/1234|2345|3456/.test(currentRolls.join("").replace(/(.)\1/,"$1"))) {
       return true;
    }
    return false;
}

function checkLargeStraight(){
    currentRolls.sort((a,b) => a-b);
    if (/12345|23456/.test(currentRolls.join("").replace(/(.)\1/,"$1"))){
        return true;
    }
    return false;
}

// check for a 5 of a kind thru brute force, check if there are 5 occurences of each possible die value
function checkYachtZ(){
    for(let i = 1; i <= 6; i++){
        if(getNOccurences(5, i)) return true;
    }
    return false;
}

// get any number n of random dice rolls 
// use this for pressing roll / reroll buttons
function getNDiceRolls(rolls) {
    let temp = [];
    for(let i = 0; i < rolls; i++) {
        temp.push(Math.floor((Math.random()*6)) + 1);
    }
    return temp;
}

// make sure that each move is valid with the given die. for 1-6 and chance, you can use any set of die, but we need to validate for the others
function validateMove(value) {
    switch(value){
        case 'ones':
        case 'twos':
        case 'threes':
        case 'fours':
        case 'fives':
        case  'sixes':
        case  'chance':
            return true;
        case  '3-of-a-kind':
            return check3OAK();
        case '4-of-a-kind':
            return check4OAK;
        case  'full-house':
            return checkFullHouse();
        case 'small-straight':
            return checkSmallStraight();
        case 'large-straight':
            return checkLargeStraight();
        case 'yacht-z':
            return checkYachtZ();
        default: 
    }
}

// use the currentRolls to determine the correct score depending on which button is selected
function score(value) {
    let final = 0;
    switch(value){
        case 'ones':
            for(const die of currentRolls){
                if(die == 1) final++;
            }
        break;
        case 'twos':
            for(const die of currentRolls){
                if(die == 2) final+=2;
            }
        break;
        case 'threes':
            for(const die of currentRolls){
                if(die == 3) final+=3;
            }
        break;
        case 'fours':
            for(const die of currentRolls){
                if(die == 4) final+=4;
            }
        break;
        case 'fives':
            for(const die of currentRolls){
                if(die == 5) final+=5;
            }
        break;
        case 'sixes':
            for(const die of currentRolls){
                if (die == 6) final+=6;
            }
        break;
        case  '3-of-a-kind':
            final = currentRolls.reduce(getSum, 0);
        break;
        case '4-of-a-kind':
            final = currentRolls.reduce(getSum, 0);
        break;
        case  'full-house':
            final = 25;
        break;
        case 'small-straight':
            final = 30;
        break;
        case 'large-straight':
            final = 40;
        break;
        case  'chance':
            final = currentRolls.reduce(getSum, 0);
        break;
        case 'yacht-z':
            final = 50;
        break;
        default: 
    }
    return final;
}

// when a button is selected on the scorecard, make sure the move is valid, then add score
function completeMove(move){
    if(validateMove(move)){
        document.querySelector(`#${move}>.centerColumn`).innerHTML = score(move);
    }
    else{
        alert("Invalid move! Select another row");
    }
}

function updateDice(rollBtn,dice) {
    if (numRerolls == MAX_REROLLS) {
        rollBtn.disabled = true;
        rollBtn.style.opacity = .4;
    }
    rollBtn.innerText = 'REROLL';
    let rollValues = getNDiceRolls(5);
    currentRolls = [];
    for (let i = 0; i < 5; i++) {
        if (dice[i].checked) {
            currentRolls.push(dice[i].nextElementSibling.nextElementSibling.value);
            dice[i].checked = false;
        } else {
            dice[i].nextElementSibling.style.background = `url('images/die-${rollValues[i]}pips.png') no-repeat`;
            dice[i].nextElementSibling.style.backgroundSize = 'cover';
            dice[i].nextElementSibling.nextElementSibling.value = rollValues[i];
            currentRolls.push(rollValues[i]);
        }
    }
    numRerolls++;
}

window.onload = () => {
    // prevent form submission so that everything stays cient-side
    document.querySelector('#gameboard').onsubmit = (e) => {e.preventDefault()};
    
    // add click listener to each scorecard button to complete each move
    let scoringButtons = document.getElementById('scorecard').querySelectorAll('button');
    for(const button of scoringButtons){
        button.addEventListener('click', completeMove(button.name))
        console.log("added");
    }

    // dice checkbox reference  
    let dice = [];
    for (let i = 1; i < 5; i++) {
        dice.push(document.getElementById(`die${i}`));
    }
    
    let rollBtn = document.getElementById('rerollBtn');
    rollBtn.onclick = (e) => {updateDice(e.target, dice)};
};