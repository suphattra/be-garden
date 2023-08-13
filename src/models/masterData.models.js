const mongoose = require('mongoose')

const masterData = new mongoose.Schema(
  {
    _id: { type: String, default: null },
    code: { type: String, default: null },
    type: { type: String, default: null },
    subType: { type: String, default: null },
  },
  {
    versionKey: false,
  }
)

const collectionName = 'masterData'
module.exports = mongoose.model(collectionName, masterData, collectionName)
