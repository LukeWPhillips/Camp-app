// Async error catch/wrap function 
// function to wrap all errors
// we return a function that accepts a function then executes a 
// function but catches any errors if any and passes them to next



module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next)
    }
}