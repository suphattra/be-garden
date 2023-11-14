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
    gender: CodeValueSchema
});
// Code-Value Schema
const CodeProductValueSchema = new mongoose.Schema({
    code: { type: String, default: null },
    value1: { type: String, default: null },
    amount: { type: String, default: null },
});
const PlanPictureSchema = new mongoose.Schema({
    filePath: { type: String, default: null }
});
// Branch Schema
const BranchSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, default: null },
    branchCode: { type: String, default: null },
    branchName: { type: String, default: null },
    branchType: CodeValueSchema,
    product: [CodeProductValueSchema],
    supervisor: EmployeeSchema,
    areaSize: { type: Number, default: null },
    address: { type: String, default: null },
    status: { type: String, default: null },
    annualIncome: { type: Array, default: [] },
    remark: { type: String, default: null },
    planPicture: PlanPictureSchema,
    createdBy: { type: String, default: null },
    createdDate: { type: Date, default: null },
    updatedBy: { type: String, default: null },
    updatedDate: { type: Date, default: null },

});


const collectionName = 'branches';  // Name of your collection in MongoDB
module.exports = mongoose.model(collectionName, BranchSchema, collectionName);
