const mongoose = require('mongoose')

const masterData = new mongoose.Schema(
  {
    _id: { type: String, default: null },
    code: { type: String, default: null },
    type: { type: String, default: null },
    subType: { type: String, default: null },
    value1: { type: mongoose.Schema.Types.Mixed, default: null },
    value2: { type: mongoose.Schema.Types.Mixed, default: null }, // Can be String or Number
    value3: { type: mongoose.Schema.Types.Mixed, default: null },
    status: { type: String, default: null },
    description: { type: String, default: null },  // Added description field
    createdBy: { type: String, default: null },  // Added createdBy field
    createdDate: { type: Date, default: null },  // Added createdDate field
    updatedBy: { type: String, default: null },  // Added updatedBy field
    updatedDate: { type: Date, default: null },  // Added updatedDate field
    color: { type: String, default: null },
 
  },
  {
    versionKey: false,
  }
)




const collectionName = 'masterData'
module.exports = mongoose.model(collectionName, masterData, collectionName)
