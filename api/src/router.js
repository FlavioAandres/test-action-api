const router = require('express').Router()

router.get('/', (req,res)=>res.send({status: 'ok'}))
router.post('/upload/xml', (req,res)=>res.send({status: 'ok'}))

module.exports = router