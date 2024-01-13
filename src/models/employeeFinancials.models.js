const mongoose = require('mongoose');

// Code-Value Schema
const CodeValueSchema = new mongoose.Schema({
    code: { type: String, default: null },
    value1: { type: String, default: null },
    value2: { type: mongoose.Schema.Types.Mixed, default: null } // Can be String or Number
});

// Employee Financials Schema
const EmployeeFinancialsSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, default: null },
    employeeCode: { type: String, default: null },
    transactionDate: { type: Date, default: null },
    financialType: CodeValueSchema,
    financialTopic: CodeValueSchema,
    amount: { type: String, default: null },
    paymentType: CodeValueSchema,
    receipt: new mongoose.Schema({
        filePath: { type: String, default: null },
        _id: { type: String, default: null },
    }),
    remark: { type: String, default: null },
    createdBy: { type: String, default: null },
    createdDate: { type: Date, default: null },
    updatedBy: { type: String, default: null },
    updatedDate: { type: Date, default: null }, 
    status: { type: String, default: null },
});


const collectionName = 'employeeFinancials';  // Name of your collection in MongoDB
module.exports = mongoose.model(collectionName, EmployeeFinancialsSchema, collectionName);
