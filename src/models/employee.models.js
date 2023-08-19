const mongoose = require('mongoose');

// Code-Value Schema
const CodeValueSchema = new mongoose.Schema({
    code: { type: String, default: null },
    value1: { type: String, default: null },
    value2: { type: mongoose.Schema.Types.Mixed, default: null } // Can be String or Number
});

// Employee Schema
const EmployeeSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, default: null },
    employeeCode: { type: String, default: null },
    title: CodeValueSchema,
    firstName: { type: String, default: null },
    lastName: { type: String, default: null },
    nickName: { type: String, default: null },
    gender: CodeValueSchema,
    nationality: CodeValueSchema,
    phoneContact1: { type: String, default: null },
    phoneContact2: { type: String, default: null },
    employeeType: CodeValueSchema,
    employeeRole: CodeValueSchema,
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    remark: { type: String, default: null },
    profilePicture: new mongoose.Schema({
        filePath: { type: String, default: null },
    }),
    createdBy: { type: String, default: null },
    createdDate: { type: Date, default: null },
    updatedBy: { type: String, default: null },
    updatedDate: { type: Date, default: null }
});


const collectionName = 'employees';  // Name of your collection in MongoDB
module.exports = mongoose.model(collectionName, EmployeeSchema, collectionName);
