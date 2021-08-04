const {Rating, Device} = require('../models/models')
const ApiError = require('../error_handlers/ApiError')
const sequelize=require('../db')

class RatingController{
    async set(req, res, next){
        try{
            const {userId, deviceId, rate} = req.body
            const candidate = await Rating.findOne({where:{userId, deviceId}})
            if(candidate){
                return next(ApiError.badRequest("Оценка уже была поставленна"))
            }
            const myRate = await Rating.create({rate, userId, deviceId})

            const device = await Device.findOne({where:{id: deviceId}})
            const allRates = await Rating.findAll({where:{deviceId}})

            let allRatesArray = []
            let ratesCount = 0

            for(let key in allRates){
                allRatesArray.push(allRates[key].dataValues.rate)
                ratesCount=ratesCount+1
            }

            let deviceRate = allRatesArray.reduce((acc, currentItem) => acc + currentItem)/ratesCount

            try{sequelize.query(`UPDATE devices SET rating = ${deviceRate} where id = ${deviceId}`, (err, res) => {
                console.log(err, res)
            })
            }catch(e){
                console.log(e)
            }

            return res.json(myRate)
        }catch(e){
            next(ApiError.badRequest(e.message))
        }
    }

    async get(req, res, next){ 
        try{
            const {userId, deviceId} = req.query
            const rate = await Rating.findOne({where:{userId, deviceId}})
            return res.json(rate)
        }catch(e){
            next(ApiError.badRequest(e.message))  
        }
    }
}

module.exports = new RatingController()