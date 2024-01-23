const mongoose = require('mongoose');

// Branch Schema
const AuthUserSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, default: null },
    username: { type: String, default: null },
    password: { type: String, default: null },
    status: { type: String, default: null },
    role: { type: String, default: null },
    createdBy: { type: String, default: null },
    createdDate: { type: Date, default: null },
    updatedBy: { type: String, default: null },
    updatedDate: { type: Date, default: null },

});


const collectionName = 'authUsers';  // Name of your collection in MongoDB
module.exports = mongoose.model(collectionName, AuthUserSchema, collectionName);
