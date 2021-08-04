const ApiError = require('../error_handlers/ApiError')

module.exports = function(err, req, res, next){
    if(err instanceof ApiError){
        if(err.message === "Оценка уже была поставленна"){
            return res.json(err.message)
        }
        return res.status(err.status).json({message: err.message})
    }
    return res.status(500).json({message:"Непредвиденная ошибка"})
}