const mongoose = require('mongoose');

// Code-Value Schema
const CodeValueSchema = new mongoose.Schema({
    code: { type: String, default: null },
    value1: { type: String, default: null },
    value2: { type: mongoose.Schema.Types.Mixed, default: null } // Can be String or Number
});

// Branch Schema
const BranchSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, default: null },
    branchCode: { type: String, default: null },
    branchName: { type: String, default: null },
    branchType: CodeValueSchema
});


const collectionName = 'branches';  // Name of your collection in MongoDB
module.exports = mongoose.model(collectionName, BranchSchema, collectionName);
