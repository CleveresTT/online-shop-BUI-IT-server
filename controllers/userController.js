const ApiError = require('../error_handlers/ApiError')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {User, Basket} = require('../models/models')

const genereteJWT = (email, id, role) => {
    return jwt.sign(
        {id, email, role}, 
        process.env.SECRET_KEY,
        {expiresIn: '24h'}
    )
}

class UserController{
    async registration(req, res, next){
        try{
            const {email, password, role} = req.body
            if(!email || !password){
                next(ApiError.badRequest("Неверный email или пароль"))
            }
            const candidate = await User.findOne({where:{email}})
            if(candidate){
                return next(ApiError.badRequest("Пользователь с таким email уже существует"))
            }
            const hashedPassword = await bcrypt.hash(password, 5)
            const user = await User.create({email, role, password: hashedPassword})
            const basket = await Basket.create({userId: user.id})
            const token = genereteJWT(user.email, user.id, user.role)
            return res.json({token})
        }catch(e){
            next(ApiError.badRequest(e.message))
        }
    }

    async login(req, res, next){
        try{
            const {email, password} = req.body
            const user = await User.findOne({where:{email}})
            if(!user){
                return next(ApiError.internal("Пользователь с таким email не зарегестрирован"))
            }
            let comparePassword = bcrypt.compareSync(password, user.password)
            if(!comparePassword){
                return next(ApiError.internal("Неверный пароль"))
            }
            const token = genereteJWT(user.email, user.id, user.role)
            return res.json({token})
        }catch(e){
            next(ApiError.badRequest(e.message))
        }
    }

    async check(req, res, next){
        const token = genereteJWT(req.user.email, req.user.id, req.user.role)
        return res.json({token})
    }
}

module.exports = new UserController()