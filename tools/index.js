Math.random().toString(36).substr(2); //"2jdz2ecva7k"
Math.random().toString(36).substr(2); //"tnn3ygzrky"


console.log(Math.random().toString(36).substr(2))

function randomStr1(){
    return Math.random().toString(36).substr(2)
}


function randomStr2(min, max, randomLen = false){
    let str = "",
        range = min,
        arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
            '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
            'A', 'B', 'C', 'D', 'E', 'F',
            'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
            'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    // 随机产生
    if(randomLen){
        range = Math.round(Math.random() * (max-min)) + min;
    }
    for(let i=0; i<range; i++){
        const pos = Math.round(Math.random() * (arr.length-1));
        str += arr[pos];
    }
    return str.toUpperCase();
}

module.exports = {
    randomStr1,
    randomStr2
}
