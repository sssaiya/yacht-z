// GLOBAL reference for dice values. after every roll, store values here
let currentRolls = []; 

// get sum of all numbers - used in reduce function to add all die values
function getSum(total, num) {
    return total + Math.round(num);
}

// get n occurences of value in array. for example, if currentRolls = [1, 2, 2, 3, 3], 
// getNOccurences(2, 2) would be true but getNOccurences(2, 1) would be false
function getNOccurences(n, value) {
    let temp = 0;
    for(let die in currentRolls){
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
        temp.push((Math.random()*6) + 1);
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
            // TODO check for small straight
        break;
        case 'large-straight':
            // TODO check for large straight
        break;
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
            for(let die in currentRolls){
                if(die == 1) final++;
            }
        break;
        case 'twos':
            for(let die in currentRolls){
                if(die == 2) final+=2;
            }
        break;
        case 'threes':
            for(let die in currentRolls){
                if(die == 3) final+=3;
            }
        break;
        case 'fours':
            for(let die in currentRolls){
                if(die == 4) final+=4;
            }
        break;
        case 'fives':
            for(let die in currentRolls){
                if(die == 5) final+=5;
            }
        break;
        case 'sixes':
            for(let die in currentRolls){
                if(die == 6) final+=6;
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
        document.getElementById(move).innerHTML = score(move);
    }
    else{
        // TODO error 
    }
}