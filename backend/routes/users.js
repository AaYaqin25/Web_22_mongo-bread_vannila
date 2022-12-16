var express = require('express');
var router = express.Router();
const { ObjectId } = require('mongodb');

module.exports = function (db) {
  const field = db.collection('manipulate');


  router.get('/', async function (req, res, next) {
    try {

      let params = {};

      if (req.query._id) {
        params._id = ObjectId(req.query._id)
      }
      
      if (req.query.string) { // harus sesuai dengan nama variable di event.preventDefault
        params.string = { $regex: req.query.string, $options: 'i'}
      }

      if (req.query.integer) { // harus sesuai dengan nama variable di event.preventDefault
        params.integer = parseInt(req.query.integer)
      }

      if (req.query.float) { // harus sesuai dengan nama variable di event.preventDefault
        params.float= parseFloat(req.query.float)

      }

      if (req.query.startdate && req.query.enddate) { // harus sesuai dengan nama variable di event.preventDefault
        params.date = {
          $gte:req.query.startdate,
          $lte:req.query.enddate
        }
      } 

      if (req.query.boolean) { // harus sesuai dengan nama variable di event.preventDefault
        params.boolean = req.query.boolean
      }

      console.log(params);
     
      const page = parseInt(req.query.page) || 1
      const limit = 3
      const offset = (page - 1) * limit
      const sortBy = req.query.sortBy || 'string'
      const sortMode = req.query.sortMode || 'asc'

      const total = await field.countDocuments(params)
      const totalPage = Math.ceil(total / limit)

      const read = await field.find(params).limit(limit).skip(offset).sort({[sortBy]: sortMode}).toArray()
      res.json({ result: read, page: page, totalPage: totalPage, offset, sortBy: sortBy, sortMode: sortMode})
    } catch (err) {
      res.json({ err })
    }
  });


  router.post('/', async function (req, res, next) {
    try {
      const add = await field.insertOne({ 
        string: req.body.string, 
        integer: Number(req.body.integer),
        float: Number(req.body.float),
        date: req.body.date,
        boolean: req.body.boolean
      })
      const result = await field.findOne({ _id: ObjectId(add.insertedId) })
      res.json(result)
    } catch (err) {
      console.log(err);
      res.json({ err })
    }
  });

  router.delete('/:id', async function (req, res, next) {
    try {
      const remove = await field.findOneAndDelete({ _id: ObjectId(req.params.id) })
      res.json(remove.value)
    } catch (err) {
      res.json({ err })
    }
  })

  
  router.get('/:id', async function (req, res, next) {
    try {
      const showEdit = await field.findOne({ _id: ObjectId(req.params.id) })
      res.json(showEdit)
    } catch (err) {
      res.json({ err })
    }
  })


  router.put('/:id', async function (req, res, next) {
    try {
      const update = await field.findOneAndUpdate({
        _id: ObjectId(req.params.id)
      }, {
        $set: {
          string: req.body.string,
          integer: req.body.integer,
          float: req.body.float,
          date: req.body.date,
          boolean: req.body.boolean
        }
      })
      res.json(update.value)
    } catch (err) {
      res.json({ err })
    }
  })

  return router;
}

