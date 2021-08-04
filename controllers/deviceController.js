const {Device, DeviceInfo, Rating} = require('../models/models')
const ApiError = require('../error_handlers/ApiError')
const uuid = require('uuid')
const path = require('path')

class DeviceController{
    async create(req, res, next){
        try{
            const {name, price, brandId, typeId, info} = req.body
            const {img} = req.files
            let filename = uuid.v4() + '.jpg'
            img.mv(path.resolve(__dirname, '..', 'static', filename))

            const device = await Device.create({name, price, brandId, typeId, img: filename})

            let parsedInfo

            if(info){
                parsedInfo = JSON.parse(info)
                parsedInfo.forEach(i => 
                    DeviceInfo.create({
                        title: i.title,
                        description: i.description,
                        deviceId: device.id
                    })
                );
            }

            return res.json(device)
        }catch(e){
            next(ApiError.badRequest(e.message))  
        } 
    }

    async getAll(req, res){
        let {brandId, typeId, limit, page} = req.query;
        page = page || 1
        limit = limit || 16
        let offset = page*limit - limit
        let devices;
        if (!brandId && !typeId){
            devices = await Device.findAndCountAll({limit, offset})
        }
        if (brandId && !typeId){
            devices = await Device.findAndCountAll({where: {brandId}, limit, offset})
        }
        if (!brandId && typeId){
            devices = await Device.findAndCountAll({where: {typeId}, limit, offset})
        }
        if (brandId && typeId){
            devices = await Device.findAndCountAll({where: {brandId, typeId}, limit, offset})
        }
            return res.json(devices)
    }

    async getOne(req, res){
        const {id} = req.params
        const device = await Device.findOne(
            {
                where: {id}, 
                include: [{model: DeviceInfo, as: 'info'}]
            }, 
        )
        return res.json(device)
    }

    /*async setRating(req, res, next){
        try{
            const {userId, deviceId, rate} = req.body
            const candidate = await Rating.findOne({where:{userId}})
            if(candidate){
                return next(ApiError.badRequest("Оценка уже была поставленна"))
            }
            const myRate = await Rating.create({rate, userId, deviceId})

            const device = await Device.findOne({where:{deviceId}})
            const allRates = await Rating.findAll({where:{deviceId}})

            let allRatesArray = []
            let ratesCount = 0

            for(let key in allRates){
                allRatesArray.push(key.rate)
                ratesCount=ratesCount+1
            }

            device.rating = allRatesArray.reduce((acc, currentItem) => acc + currentItem)/ratesCount;

            return res.json(myRate)
        }catch(e){
            next(ApiError.badRequest(e.message))  
        }
    }*/
    
}

module.exports = new DeviceController()