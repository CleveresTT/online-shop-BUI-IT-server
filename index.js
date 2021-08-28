require('dotenv').config()
const sequelize=require('./db')
const express = require('express')
const cors = require('cors')
const fileUpload = require('express-fileupload')
const router = require('./routes/index')
const errorHandlerMiddleware = require('./middlewares/ErrorHandlingMiddleware')
const filePathMiddleware = require('./middlewares/filePathMiddleware')
const path = require('path')
const config = require('config')
const models = require('./models/models')

const PORT = config.get("port") || 5000

const app = express()

app.use(cors())
app.use(filePathMiddleware(path.resolve(__dirname, 'files')))
app.use(express.json())
app.use(express.static(path.resolve(__dirname, 'static')))
app.use(fileUpload({}))
app.use('/api', router)

app.use(errorHandlerMiddleware)

const start = async () => {
    try{
        await sequelize.authenticate()
        await sequelize.sync()

        app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
    }catch(e){
        console.log(e)
    }
}

start()