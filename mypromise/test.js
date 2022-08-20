let Promise = require("./mypromise")
let fs = require("fs")
const path = require('path')

const filePath01 = path.join(__dirname, './01.txt')
const filePath02 = path.join(__dirname, './02.txt')
const filePath03 = path.join(__dirname, './03.txt')


// let promise = new Promise((resolve, reject) => {
//     fs.readFile(filePath01, "utf8", function(err, data) {
//         err ? reject(err) : resolve(data)
//     });
// });
// let f1 = function(data) {
//     console.log(data)
//     return new Promise((resolve, reject) => {
//         fs.readFile(filePath02, "utf8", function(err, data) {
//             err ? reject(err) : resolve(data)
//         });
//     });
// }
// let f2 = function(data) {
//     console.log(data)
//     return new Promise((resolve, reject) => {
//         fs.readFile(filePath03, "utf8", function(err, data) {
//             err ? reject(err) : resolve(data)
//         });
//     });
// }
// let f3 = function(data) {
//     console.log(data);
// }
// let errorLog = function(error) {
//     console.log(error)
// }

let p1 = new Promise((resolve, reject) => {
    fs.readFile(filePath01, "utf8", function(err, data) {
        err ? reject(err) : resolve(data)
    });
})

let p2 = new Promise((resolve, reject) => {
    fs.readFile(filePath02, "utf8", function(err, data) {
        err ? reject(err) : resolve(data)
    });
})

Promise.all([p1, p2]).then(function(result) {
    console.log(result);
}, function(error) {
    console.log(error)
});

Promise.race([p1, p2]).then(function(result) {
    console.log(result);
}, function(error) {
    console.log(error)
});
// promise.then(f1).then(f2).then(f3).catch(errorLog)