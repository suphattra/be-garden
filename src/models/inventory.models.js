const mongoose = require('mongoose');

// Code-Value Schema
const CodeValueSchema = new mongoose.Schema({
    code: { type: String, default: null },
    value1: { type: String, default: null },
    // value2: { type: mongoose.Schema.Types.Mixed, default: null } // Can be String or Number
});
const CodeValueDisSchema = new mongoose.Schema({
    branchCode: { type: String, default: null },
    branchName: { type: String, default: null },
    amount: { type: String, default: null },
    // value2: { type: mongoose.Schema.Types.Mixed, default: null } // Can be String or Number
});
const BillPictureSchema = new mongoose.Schema({
    filePath: { type: String, default: null }
});
// Employee Schema
const InventorySchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, default: null },
    importDate: { type: Date, default: null },
    inventoryCode: { type: String, default: null },
    inventoryName: { type: String, default: null },
    inventoryTradeName: { type: String, default: null },
    pricePerUnit: { type: String, default: null },
    sellerName: { type: String, default: null },
    inventoryType: CodeValueSchema,
    paymentType: CodeValueSchema,
    unit: { type: String, default: null },
    amount: { type: String, default: null },
    bill: BillPictureSchema,
    remark: { type: String, default: null },
    status: { type: String, default: null },
    distribution : [CodeValueDisSchema],
    // nickName: { type: String, default: null },
    // gender: CodeValueSchema,
    // nationality: CodeValueSchema,
    // phoneContact1: { type: String, default: null },
    // phoneContact2: { type: String, default: null },
    // employeeType: CodeValueSchema,
    // employeeRole: CodeValueSchema,
    // startDate: { type: Date, default: null },
    // endDate: { type: Date, default: null },
    // remark: { type: String, default: null },
    // profilePicture: new mongoose.Schema({
    //     filePath: { type: String, default: null },
    // }),
    createdBy: { type: String, default: null },
    createdDate: { type: Date, default: null },
    updatedBy: { type: String, default: null },
    updatedDate: { type: Date, default: null }
});


const collectionName = 'inventories';  // Name of your collection in MongoDB
module.exports = mongoose.model(collectionName, InventorySchema, collectionName);
