const DATAATTR = "data-action";
const OPERATORS = {add: opAdd , sub: opSub , mul: opMul, div: opDiv };
const COMMANDS = { acc: cmdAcc , clr : cmdClr , bck : cmdBck , 
                   equ : cmdEqu , dot : cmdDot };
const ADD= '+' , SUB= '-', MUL= 'x', DIV= '/';
const SYMBOLS = { add: ADD , sub: SUB , mul: MUL, div: DIV };

const MAX_LENGTH = 10;

//Whether pressing number or operator button causes effect
let started = false;
let clearWhenNum = false;

let firstNumber = null;
let firstOperator = null;
let secondNumber = null;
let secondOperator = null;
let visorNumber = null;

function opAdd(a,b){
    return (a + b);
}

function opSub(a,b){
    return (a - b);
}

function opMul(a,b){
    return (a * b);
}

function opDiv(a,b){
    return (a / b);
}

function cmdAcc(){
    started = true;
    waitNum = true;
    waitOp = true;
    firstNumber = null;
    firstOperator = null;
    secondNumber = null;
    secondOperator = null;
    visorNumber = 0;
    visorOrder = null;
}

function cmdClr(){
    if( started ) {
        visorNumber = 0;
        visorOrder = null;
    }
}

function cmdBck(){

    if( clearWhenNum ) {
        cmdClr();
        clearWhenNum = false;
    }

    if(visorOrder == 0){
        visorOrder = null;
    } else {
        if(visorOrder != null) {
            visorOrder--;
        }
        visorNumber = Math.trunc(visorNumber/10);
    }

}

function cmdEqu(){
    let result = parseFloat(getLowerDisplay());
    if(firstOperator != null) {
        if(secondOperator != null){
            result = OPERATORS[secondOperator](secondNumber,result);
        }
        result  = OPERATORS[firstOperator](firstNumber,result);
        firstNumber = result;
        secondNumber = null;
        firstOperator = null;
        secondOperator = null;
    }
    else {
        firstNumber = result;
    }
    clearWhenNum = true;
}

function cmdDot(){
    if( clearWhenNum ) {
        cmdClr();
        clearWhenNum = false;
    }
    if(visorOrder == null) {
        visorOrder = 0;
    }

}

function reduce(op) {
    let precedence = (SYMBOLS[op] == MUL || SYMBOLS[op] == DIV ? 1 : 0);
    if(firstNumber == null) {
        firstNumber = parseFloat(getLowerDisplay());
        firstOperator = op;
    }
    else if(firstOperator == null){
        if(!clearWhenNum){
            firstNumber = parseFloat(getLowerDisplay());
        }
        firstOperator = op;
    }
    else {
        let firstPrecedence = (firstOperator == MUL || firstOperator == DIV ? 1 : 0);
        if(secondNumber == null) {
            secondNumber = parseFloat(getLowerDisplay());
            secondOperator = op;
            if(firstPrecedence >= precedence){
                firstNumber = OPERATORS[firstOperator](firstNumber,secondNumber);
                firstOperator = op;
                secondNumber = null;
                secondOperator = null;
            }
        }
        else {
            let secondPrecedence = (firstOperator == MUL || firstOperator == DIV ? 1 : 0);
            if(secondPrecedence > precedence){
                firstNumber = OPERATORS[firstOperator](firstNumber,OPERATORS[secondOperator](secondNumber,parseFloat(getLowerDisplay())));
                firstOperator = op;
                secondOperator = null;
                secondNumber = null;
            } else {
                secondNumber = OPERATORS[secondOperator](secondNumber,parseFloat(getLowerDisplay()));
                secondOperator = op;
                if(firstPrecedence >= secondPrecedence){
                    firstNumber = OPERATORS[firstOperator](firstNumber,secondNumber);
                    firstOperator = op;
                    secondNumber = null;
                    secondOperator = null;
                }
            }
        }

    } 
}

function executeOp( op ) {
    reduce(op);
    clearWhenNum = true;
    writeDisplay();
}

function getTruncked(number) {
    let ret = `${number}`;
    if(ret.replace('.','').length > MAX_LENGTH){
        ret = number.toPrecision(6);
    }
    return ret;
}

function getUpperDisplay() {
    let upperDisplay = '_';
    if( firstNumber != null ) {
        upperDisplay = getTruncked(firstNumber);
        if( firstOperator != null ) {
            upperDisplay = `${upperDisplay} ${SYMBOLS[firstOperator]}`;
            if( secondNumber != null ) {
                upperDisplay = `${upperDisplay} ${getTruncked(secondNumber)}`;
                if( secondOperator != null ) {
                    upperDisplay = `${upperDisplay} ${SYMBOLS[secondOperator]}`;
                }
            }
        }
    }
    return upperDisplay;
}

function getLowerDisplay() {
    let ret = `${visorNumber}`;
    if(visorOrder != null){
        if(visorOrder >= (visorNumber>0? ret.length:0)) {
            ret = `0.${'0'.repeat(visorOrder - (visorNumber > 0 ? ret.length:0))}${visorNumber>0?visorNumber:''}`;
        }
        else {
            ret = ret.splice(ret.length-visorOrder,0,'.');
        }
    }
    return ret;
}

function writeDisplay() {
    if((isFinite(firstNumber) || firstNumber == null) &&  
       (isFinite(secondNumber) || secondNumber == null)){
        let upperDisplay = getUpperDisplay();
        let lowerDisplay = getLowerDisplay();
        document.querySelector('.display-head').textContent = upperDisplay;
        document.querySelector('.display-body').textContent = lowerDisplay;
    }
    else {
        started = false;
        document.querySelector('.display-head').textContent = "Operation ERROR press AC";
        document.querySelector('.display-body').textContent = "8.8.8.8.8.8.8.8.8.8.";
    }
}

function executeNum( num ) {
    if( clearWhenNum ) {
        cmdClr();
        clearWhenNum = false;
    }
    //Checking that number digit amount not including '.' won't overflow when add a digit
    if( waitNum && getLowerDisplay().replace('.','').length < MAX_LENGTH ){
        visorNumber = visorNumber*10 + parseInt(num);
        if(visorOrder != null) {
            visorOrder++;
        }
        writeDisplay();
    }
}

function executeCmd( cmd ) {
    COMMANDS[cmd]();
    writeDisplay();
}

function loadPage(){
    document.querySelectorAll(".cmd")
            .forEach(btn => btn.onclick = () => executeCmd(btn.getAttribute(DATAATTR)));
    document.querySelectorAll(".op")
            .forEach(btn => btn.onclick = () => executeOp(btn.getAttribute(DATAATTR)));
    document.querySelectorAll(".num")
            .forEach(btn => btn.onclick = () => executeNum(btn.getAttribute(DATAATTR)));
}

document.addEventListener('DOMContentLoaded',loadPage);

//Obiously this was c&p from stackoverflow
if (!String.prototype.splice) {
    /**
     * {JSDoc}
     *
     * The splice() method changes the content of a string by removing a range of
     * characters and/or adding new characters.
     *
     * @this {String}
     * @param {number} start Index at which to start changing the string.
     * @param {number} delCount An integer indicating the number of old chars to remove.
     * @param {string} newSubStr The String that is spliced in.
     * @return {string} A new string with the spliced substring.
     */
    String.prototype.splice = function(start, delCount, newSubStr) {
        return this.slice(0, start) + newSubStr + this.slice(start + Math.abs(delCount));
    };
}