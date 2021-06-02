import createError from 'http-errors'
import express from 'express'
import path from 'path'
import morgan from 'morgan'
import swaggerUi from 'swagger-ui-express'
import YAML from 'yamljs'
import cookieParser from 'cookie-parser'
import logger from './lib/logger.js'
import helmet from 'helmet'
import indexRouter from './routes/index'

const app = express()
const swaggerDocument = YAML.load('./swagger.yaml')

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(helmet())
// app.use(morgan('short')) // this will log every request url
app.use(express.json())
app.use(express.urlencoded({
  extended: false
}))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', indexRouter)
// swagger doc
const option = {
  swaggerOptions: {
    operationsSorter: 'method'
  }
}
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, option))

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404))
})

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

logger.error('This is a message.')
logger.debug('This is a message.')
logger.warn('This is a message.')
logger.info('This is a message.')

module.exports = app
