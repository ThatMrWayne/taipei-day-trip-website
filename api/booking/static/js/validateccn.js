function handleCreditNumber(){
    const ccn = document.getElementById("ccn");
    ccn.addEventListener('input',handleCreditInput);
    ccn.addEventListener('input',validateCreditCardNumber);
}

function fixDouble(number){
    return number > 9 ? number - 9 :number
}

function validateCreditCardNumber(e){
    if(e.target.value.length === 19){
        let digits = e.target.value.replaceAll(' ','').split('').map(Number);
        let sum;

        if(digits.length%2 === 0){
            digits = digits.map((digit,idx) => idx%2 === 0 ? fixDouble(digit*2) : digit);
        }else{
            digits = digits.map((digit,idx) => idx%2 === 1 ? fixDouble(digit*2) : digit);
        }

        sum  = digits.reduce((acc,digit)=> acc += digit,0);
        if(sum %10 === 0){
            console.log('solid number')
        }else{
            console.log('not valid number')
        }
    }

}


function handleCreditInput(e){
    const creditNumber = document.getElementById("ccn");
    const input_credit = e.target.value;
    if(e.inputType === "insertText"){
        if(! Number(e.data) && Number(e.data) !== 0){
            console.log('please input number');
            creditNumber.value = input_credit.slice(0,input_credit.length-1);
            return 
        }
        if((input_credit.length-4)%5 === 0 && input_credit.length !== 19){
            creditNumber.value = input_credit+' ';
        }else if(input_credit.length%5 === 0){
            lastWord = input_credit.substr(input_credit.length-1);
            creditNumber.value = input_credit.slice(0,input_credit.length-1)+" "+lastWord;
        }
    }else if(e.inputType === "deleteContentBackward"){
        if(input_credit.length%5 === 0){
            creditNumber.value = e.target.value.trimEnd();
        }
    }    
}




window.addEventListener('load',handleCreditNumber);





