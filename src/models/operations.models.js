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

// Branch Schema
const BranchSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, default: null },
    branchCode: { type: String, default: null },
    branchName: { type: String, default: null },
    branchType: CodeValueSchema
});

// Inventory Schema
const InventorySchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, default: null },
    inventoryCode: { type: String, default: null },
    inventoryName: { type: String, default: null },
    pickupAmount: { type: Number, default: null },
    unit: { type: String, default: null }
});

// Main Schema
const operationsSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, default: null },
    startDate: { type: String, default: null },
    employee: EmployeeSchema,
    mainBranch: BranchSchema,
    subBranch: BranchSchema,
    task: CodeValueSchema,
    taskAmount: { type: Number, default: null },
    taskPaymentRate: { type: Number, default: null },
    otAmount: { type: Number, default: null },
    otRate: { type: Number, default: null },
    otTotal: { type: Number, default: null },
    product: [CodeValueSchema],
    inventory: [InventorySchema],
    wageType: CodeValueSchema,
    operationStatus: CodeValueSchema,
    remark: { type: String, default: null },
    createdBy: { type: String, default: null },
    createdDate: { type: Date, default: null },
    updatedBy: { type: String, default: null },
    updatedDate: { type: Date, default: null }
}, {
    versionKey: false
});

const collectionName = 'operations';  // Name of your collection in MongoDB
module.exports = mongoose.model(collectionName, operationsSchema, collectionName);
