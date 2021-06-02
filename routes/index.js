import express from 'express'
import file from '../api/file.js'
import errorHandler from '../lib/error_handler.js'

const router = express.Router()

/* GET home page. */
router.get('/', errorHandler(file.get))
router.post('/encrypt', errorHandler(file.encrypt))
router.post('/decrypt', errorHandler(file.decrypt))

module.exports = router
