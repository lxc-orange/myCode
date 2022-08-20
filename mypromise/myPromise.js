// 定义三种状态
const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'

function MyPromise(fn) {
    let self = this // 存放当前 promise 实例
    self.value = null // 成功时的值
    self.error = null // 失败时的值
    self.onFulfilledCallbacks = [] // 成功的回调函数
    self.onRejectedCallbacks = [] // 失败的回调函数
    self.status = PENDING // 初始化状态为 pending

    function resolve(value) {
        if(self.status === PENDING) {
            setTimeout(() => {
                self.status = FULFILLED
                self.value = value
                self.onFulfilledCallbacks.forEach(callback =>callback((self.value))) // resolve 时执行成功回调
            }, 0)
        }
    }

    function reject(error) {
        if(self.status === PENDING) {
            setTimeout(() => {
                self.status = REJECTED
                self.error = error
                self.onRejectedCallbacks.forEach(callback =>callback((self.value))) // reject 时执行失败回调
            }, 0)
        }
    }

    fn(resolve, reject)
}

MyPromise.prototype.then = function(onFulfilled, onRejected) {
    const self = this
    let bridgePromise
    // 防止使用者不穿入成功或失败的回调函数，所以成功失败都给了默认回调函数
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value
    onRejected = typeof onRejected === 'function' ? onRejected : error => { throw error }

    if(self.status === FULFILLED) {
        return bridgePromise = new MyPromise((resolve, reject) => {
            setTimeout(() => {
                try {
                    let x = onFulfilled(self.value)
                    resolvePromise(bridgePromise, x, resolve, reject)
                } catch(e) {
                    reject(e)
                }
            }, 0)
        })
    }
    if(self.status === REJECTED) {
        return bridgePromise = new MyPromise((resolve, reject) => {
            setTimeout(() => {
                try {
                    let x = onRejected(self.error)
                    resolvePromise(bridgePromise, x, resolve, reject)
                } catch(e) {
                    reject(e)
                }
            }, 0)
        })
    }

    if(this.status === PENDING) { // pending 时可能会有两种状态，将函数状态保存
        return bridgePromise = new MyPromise((resolve, reject) => {
            self.onFulfilledCallbacks.push(value => {
                try {
                    let x = onFulfilled(value)
                    resolvePromise(bridgePromise, x, resolve, reject)
                } catch(e) {
                    reject(e)
                }
            })
            self.onRejectedCallbacks.push(error => {
                try {
                    let x = onRejected(error)
                    resolvePromise(bridgePromise, x, resolve, reject)
                } catch(e) {
                    reject(e)
                }
            })
        })
        // 在这里给 promise 实例注册成功和失败的回调
        this.onFulfilledCallbacks.push(onFulfilled)
        this.onRejectedCallbacks.push(onRejected)
    }

    // 为了达到链式调用的摩的返回一个 this，后面的方法都能根据这个实例去调用对应的函数
    return this
}

// catch 是一个只用来传递 onRejected 状态的方法
MyPromise.prototype.catch = function(onRejected) {
    return this.then(null, onRejected)
}

MyPromise.all = function(promises) {
    return new MyPromise(function(resolve, reject) {
        let result = []
        let count = 0
        for(let i = 0; i < promises.length; i++) {
            promises[i].then(function(data) {
                result[i] = data
                if(++count === promises.length) {
                    resolve(result)
                }
            }, function(error) {
                reject(error)
            })
        }
    })
}

MyPromise.race = function(promises) {
    return new MyPromise(function(resolve, reject) {
        for(let i = 0; i < promises.length; i++) {
            promises[i].then(function(data) {
                resolve(data)
            }, function(error) {
                reject(error)
            })
        }
    })
}

MyPromise.resolve = function(value) {
    return new MyPromise(resolve => {
        resolve(value)
    })
}

MyPromise.reject = function(error) {
    return new MyPromise((resolve, reject) => {
        reject(error)
    })
}

// 用来解析回调函数的返回值 x ，x可能是普通值也可能是哥 promise 对象
function resolvePromise(bridegPromse, x, resolve, reject) {
    // 如果是一个 promise 对象
    if(x instanceof MyPromise) {
        // 如果这个 promise 是pending 状态，就在它的then方法里继续执行 resolvePromise 解析他的结果，知道返回值不是一个 pending状态的 promise 为止
        if(x.status === PENDING) {
            x.then(y=>{
                resolvePromise(bridegPromse, x, resolve, reject)
            }, err => {
                reject(err)
            })
        } else {
            x.then(resolve, reject)
        }
    } else {
        // 如果 x 是一个普通值，通过resolve将值床底下去
        resolve(x)
    }
}

module.exports = MyPromise

