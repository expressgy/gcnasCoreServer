console.log((new Date().getTime()).toString().length)

const a = {
    a:'xasx',
    b:'xasxaxasxasx'
}
console.log(Object.values(a))
// console.log(Object.values(a).forEach((item,index) => {return item + '/'}).pop())
console.log(Object.values(a).join('/'))