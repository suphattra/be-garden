const operationsModels = require("../../models/operations.models");
const masterData = require("../../models/masterData.models");
const inventoryModels = require("../../models/inventory.models");
const inventoryHistoriesModels = require("../../models/inventoryHistories.models");

exports.list = async function (req, res) {
    //var lov = req.query.lov;
    var ret = {
        resultCode: 200,
        resultDescription: 'Success'
    };
    try {
        var filter = {};
        var queryStr = req.query
        console.log(queryStr);
        let offset = req.query.offset || 0;
        let limit = req.query.limit || 10;
        let sort = {}

        if (queryStr.startDate && queryStr.endDate) {
            var startDtArr = queryStr.startDate.split('|');
            filter.startDate = { $gte: queryStr.startDate, $lt: queryStr.endDate + ' 00:00:00' };
        }
        if (queryStr.employee) {
            var employeeCodeArr = queryStr.employee.split('|');
            filter["employee.employeeCode"] = { $in: employeeCodeArr };
        }
        if (queryStr.mainBranch) {
            var branchCodeArr = queryStr.mainBranch.split('|');
            filter["mainBranch.branchCode"] = { $in: branchCodeArr };
        }
        if (queryStr.subBranch) {
            var subBranchCodeArr = queryStr.subBranch.split('|');
            filter["subBranch.branchCode"] = { $in: subBranchCodeArr };
        }
        if (queryStr.task) {
            var subtaskArr = queryStr.task.split('|');
            filter["task.code"] = { $in: subtaskArr };
        }
        if (queryStr.operationStatus) {
            var operationStatusArr = queryStr.operationStatus.split('|');
            //filter.operationStatus = {};
            //filter.operationStatus = { code : { $in: operationStatusArr} 
            filter["operationStatus.code"] = { $in: operationStatusArr };
        }
        if (queryStr.sort) {
            let desc = queryStr.desc == 'DESC' ? -1 : 1
            sort = { [req.query.sort]: desc };
        } else {
            sort = { updatedDate: 'DESC' };
        }
        console.log("Filter:", filter);
        const result = await operationsModels.find(filter).skip(offset).limit(limit).sort(sort);
        const resultTotal = await operationsModels.find(filter).countDocuments();
        ret.resultData = result;
        
        ret.total = resultTotal
        res.json(ret);


    } catch (error) {
        ret.resultCode = 500;
        ret.message = 'Fail';
        ret.resultDescription = error.message;
        res.json(ret);
    }
};



exports.findById = async function (req, res) {
    var id = req.params.id;
    var filter = {};
    filter = req.query
    filter.operationCode = id
    var ret = {
        resultCode: 200,
        resultDescription: 'Success'
    };
    try {
        try {
            const result = await operationsModels.find(filter);

            if (result.length <= 0) {
                ret.resultCode = 404;
                ret.resultDescription = 'Data Not Found';
                ret.message = "ไม่พบข้อมูล";
            } else {
                ret.resultData = result;
            }

        } catch (error) {
            ret.resultCode = 500;
            ret.message = 'ระบบเกิดข้อผิดพลาด';
            ret.resultDescription = error.message;
        }

        res.json(ret);


    } catch (error) {
        ret.resultCode = 500;
        ret.message = 'ระบบเกิดข้อผิดพลาด';
        ret.resultDescription = "System error :" + error.message;
        res.json(ret);
    }
};

exports.insert = async function (req, res) {
    const dataList = req.body.dataList;
    var ret = {
        resultCode: 200,
        resultDescription: 'Success',
        message: "สร้างบันทึกการทำงานสำเร็จ"
    };

    try {
        if (dataList == null || dataList == undefined || dataList.length <= 0) {
            ret.resultCode = 400;
            ret.message = 'Bad Request';
            ret.resultDescription = 'DataList is required';
            res.json(ret);
            return;
        }

        //check duplicate
        for (let i = 0; i < dataList.length; i++) {
            var dataOper = dataList[i];
            var filter = {};
            filter.startDate = dataOper.startDate;
            filter.employee = { employeeCode: dataOper.employee?.employeeCode };
            filter.mainBranch = { branchCode: dataOper.mainBranch?.branchCode };
            filter.task = { code: dataOper.task?.code };
            // filter.operationStatus = { code : { $in: [ "MD0034","MD0035"] } };
            filter['operationStatus.code'] = { $in: ["MD0034", "MD0035"] };
            const result = await operationsModels.find(filter);

            if (result.length > 0) {
                ret.resultCode = 400;
                ret.message = 'มีบันทึกการทำงานนี้อยู่แล้ว';
                ret.resultDescription = 'Duplicate';
                res.json(ret);
                return;
            }
        }
        for (let i = 0; i < dataList.length; i++) {
            var dataOper = dataList[i];


            var seqOperCode = await masterData.findOne({
                "type": "SEQ",
                "subType": "OPERATION_CODE",
                "status": "Active"
            });
            if (seqOperCode == null || seqOperCode == undefined || seqOperCode.length <= 0) {
                ret.resultCode = 400;
                ret.message = 'ไม่พบข้อมูล SEQ';
                ret.resultDescription = 'Not Found';
                res.json(ret);
                return;
            }

            var operationCode = seqOperCode.value1 + seqOperCode.value2;    //prefix + running number
            dataOper.operationCode = operationCode;

            //update seq
            var seqOperCodeUpdate = await masterData.updateOne(
                {
                    "type": "SEQ",
                    "subType": "OPERATION_CODE",
                    "status": "Active"
                },
                {
                    $inc: {
                        value2: 1
                    },
                    $currentDate: {
                        updatedDate: true
                    }
                });

            var now = new Date();
            dataOper.createdDate = now;
            dataOper.updatedDate = now;
            dataOper.updatedBy = dataOper.createdBy;

            //dataOper._id = new mongoose.Types.ObjectId();
            const newOperation = new operationsModels(dataOper);
            var result = await newOperation.save();
            if (result) {
                if (dataOper.inventory.length > 0) {
                    if (dataOper.operationStatus.code === 'MD0028') {
                        for (let i = 0; i < dataOper.inventory.length; i++) {
                            var inventory = dataOper.inventory[i];
                            let incamount = inventory.pickupAmount
                            const updatedDoc = await inventoryModels.findOneAndUpdate(
                                {
                                    inventoryCode: inventory.inventoryCode
                                },
                                { $inc: { "amount": -incamount } }
                                ,
                                { new: true }  // This option returns the updated document
                            );
                            //add his
                            const result = await inventoryModels.find({
                                inventoryCode: inventory.inventoryCode
                            });
                            if (result.length > 0) {
                                var resultHis = result[0]
                                let dataHis = {}
                                dataHis.inventoriesID = resultHis._id
                                dataHis.importDate = resultHis.importDate
                                dataHis.inventoryCode = resultHis.inventoryCode
                                dataHis.inventoryName = resultHis.inventoryName
                                dataHis.inventoryTradeName = resultHis.inventoryTradeName
                                dataHis.pricePerUnit = resultHis.pricePerUnit
                                dataHis.sellerName = resultHis.sellerName
                                dataHis.inventoryType = resultHis.inventoryType
                                dataHis.paymentType = resultHis.paymentType
                                dataHis.unit = resultHis.unit
                                dataHis.amount = resultHis.amount
                                dataHis.bill = resultHis.bill
                                dataHis.remark = resultHis.remark
                                dataHis.status = resultHis.status
                                dataHis.distribution = resultHis.distribution
                                dataHis.amountStock = '-' + incamount
                                dataHis.operation = 'NEW_OPERATION'
                                dataHis.createdDate = now;
                                dataHis.updatedDate = now;
                                dataHis.createdBy = dataOper.createdBy;
                                dataHis.updatedBy = dataOper.createdBy;
                                console.log("result dataHis", dataHis)
                                const newOperationHis = new inventoryHistoriesModels(dataHis);
                                await newOperationHis.save();
                            }

                        }
                    }
                }

            }
        }


        ret.data = {};
        res.json(ret);

    } catch (error) {
        ret.resultCode = 500;
        ret.message = 'ระบบเกิดข้อผิดพลาด';
        ret.resultDescription = "System error :" + error.message;
        res.json(ret);
    }
};

exports.edit = async function (req, res) {
    var operCode = req.params.id;

    //filter.operationCode = id

    var ret = {
        resultCode: 200,
        resultDescription: 'Success',
        message: "แก้ไขบันทึกการทำงานสำเร็จ"
    };
    try {
        const operEdit = await operationsModels.findOne({ operationCode: operCode });
        if (operEdit == null || operEdit == undefined) {
            ret.resultCode = 404;
            ret.resultDescription = 'Data Not Found';
            ret.message = "ไม่พบข้อมูล";
            return res.json(ret);
        }

        var dataOper = req.body;

        var filter = {};
        filter.startDate = dataOper.startDate;
        filter.employee = { employeeCode: dataOper.employee?.employeeCode };
        filter.mainBranch = { branchCode: dataOper.mainBranch?.branchCode };
        filter['operationStatus.code'] = { $in: ["MD0034", "MD0035"] };
        filter.operationCode = { $not: { $regex: operCode } };

        const result = await operationsModels.find(filter);
        if (result.length > 0) {
            ret.resultCode = 400;
            ret.message = 'มีบันทึกการทำงานนี้อยู่แล้ว';
            ret.resultDescription = 'Duplicate';
            res.json(ret);
            return;
        }

        var now = new Date();
        dataOper.updatedDate = now;
        dataOper.updatedBy = dataOper.createdBy;

        let inventoryInsert = []
        if (dataOper.inventory.length > 0) {
            const result = await operationsModels.find({ operationCode: operCode });
            if (result.length > 0) {
                let operation = result[0];
                let operationStatus = operation.operationStatus.code

                if ((operationStatus === 'MD0027' && dataOper.operationStatus.code === 'MD0028')) {
                    for (let i = 0; i < dataOper.inventory.length; i++) {
                        var inventory = dataOper.inventory[i];
                        const updatedDoc = await inventoryModels.findOneAndUpdate(
                            {
                                inventoryCode: inventory.inventoryCode
                            },
                            { $inc: { "amount": -inventory.pickupAmount } }
                            ,
                            { new: true }  // This option returns the updated document
                        );
                        //add his
                        const result = await inventoryModels.find({
                            inventoryCode: inventory.inventoryCode
                        });
                        if (result.length > 0) {
                            var resultHis = result[0]
                            let dataHis = {}
                            dataHis.inventoriesID = resultHis._id
                            dataHis.importDate = resultHis.importDate
                            dataHis.inventoryCode = resultHis.inventoryCode
                            dataHis.inventoryName = resultHis.inventoryName
                            dataHis.inventoryTradeName = resultHis.inventoryTradeName
                            dataHis.pricePerUnit = resultHis.pricePerUnit
                            dataHis.sellerName = resultHis.sellerName
                            dataHis.inventoryType = resultHis.inventoryType
                            dataHis.paymentType = resultHis.paymentType
                            dataHis.unit = resultHis.unit
                            dataHis.amount = resultHis.amount
                            dataHis.bill = resultHis.bill
                            dataHis.remark = resultHis.remark
                            dataHis.status = resultHis.status
                            dataHis.distribution = resultHis.distribution
                            dataHis.amountStock = '-' + inventory.pickupAmount
                            dataHis.operation = 'UPDATE_OPERATION'
                            dataHis.createdDate = now;
                            dataHis.updatedDate = now;
                            dataHis.createdBy = dataOper.createdBy;
                            dataHis.updatedBy = dataOper.createdBy;
                            const newOperationHis = new inventoryHistoriesModels(dataHis);
                            await newOperationHis.save();
                        }
                        inventoryInsert.push(inventory)
                    }
                } else if (dataOper.operationStatus.code === 'MD0028') {
                    for (let i = 0; i < dataOper.inventory.length; i++) {
                        var inventory = dataOper.inventory[i];
                        if (inventory.action === 'DELETE') {
                            console.log("inventory DELETE", inventory)
                            let incamountAdd = inventory.pickupAmount
                            const updatedDoc = await inventoryModels.findOneAndUpdate(
                                {
                                    inventoryCode: inventory.inventoryCode
                                },
                                { $inc: { "amount": +incamountAdd } }
                                ,
                                { new: true }  // This option returns the updated document
                            );
                            //add his
                            const result = await inventoryModels.find({
                                inventoryCode: inventory.inventoryCode
                            });
                            if (result.length > 0) {
                                var resultHis = result[0]
                                let dataHis = {}
                                dataHis.inventoriesID = resultHis._id
                                dataHis.importDate = resultHis.importDate
                                dataHis.inventoryCode = resultHis.inventoryCode
                                dataHis.inventoryName = resultHis.inventoryName
                                dataHis.inventoryTradeName = resultHis.inventoryTradeName
                                dataHis.pricePerUnit = resultHis.pricePerUnit
                                dataHis.sellerName = resultHis.sellerName
                                dataHis.inventoryType = resultHis.inventoryType
                                dataHis.paymentType = resultHis.paymentType
                                dataHis.unit = resultHis.unit
                                dataHis.amount = resultHis.amount
                                dataHis.bill = resultHis.bill
                                dataHis.remark = resultHis.remark
                                dataHis.status = resultHis.status
                                dataHis.distribution = resultHis.distribution
                                dataHis.amountStock = '+' + incamountAdd
                                dataHis.operation = 'UPDATE_OPERATION_RESTOCK'
                                dataHis.createdDate = now;
                                dataHis.updatedDate = now;
                                dataHis.createdBy = dataOper.createdBy;
                                dataHis.updatedBy = dataOper.createdBy;
                                const newOperationHis = new inventoryHistoriesModels(dataHis);
                                await newOperationHis.save();
                            }
                        } else if (inventory.action === 'NEW') {
                            console.log("inventory NEW", inventory)
                            let incamountDel = inventory.pickupAmount
                            inventoryInsert.push(inventory)
                            const updatedDoc = await inventoryModels.findOneAndUpdate(
                                {
                                    inventoryCode: inventory.inventoryCode
                                },
                                { $inc: { "amount": -incamountDel } }
                                ,
                                { new: true }  // This option returns the updated document
                            );
                            //add his
                            const result = await inventoryModels.find({
                                inventoryCode: inventory.inventoryCode
                            });
                            if (result.length > 0) {
                                var resultHis = result[0]
                                let dataHis = {}
                                dataHis.inventoriesID = resultHis._id
                                dataHis.importDate = resultHis.importDate
                                dataHis.inventoryCode = resultHis.inventoryCode
                                dataHis.inventoryName = resultHis.inventoryName
                                dataHis.inventoryTradeName = resultHis.inventoryTradeName
                                dataHis.pricePerUnit = resultHis.pricePerUnit
                                dataHis.sellerName = resultHis.sellerName
                                dataHis.inventoryType = resultHis.inventoryType
                                dataHis.paymentType = resultHis.paymentType
                                dataHis.unit = resultHis.unit
                                dataHis.amount = resultHis.amount
                                dataHis.bill = resultHis.bill
                                dataHis.remark = resultHis.remark
                                dataHis.status = resultHis.status
                                dataHis.distribution = resultHis.distribution
                                dataHis.amountStock = '-' + incamountDel
                                dataHis.operation = 'UPDATE_OPERATION'
                                dataHis.createdDate = now;
                                dataHis.updatedDate = now;
                                dataHis.createdBy = dataOper.createdBy;
                                dataHis.updatedBy = dataOper.createdBy;
                                const newOperationHis = new inventoryHistoriesModels(dataHis);
                                await newOperationHis.save();
                            }
                        } else {
                            inventoryInsert.push(inventory)
                        }
                    }
                } else {
                    inventoryInsert = dataOper.inventory
                }
            }
        }
        dataOper.inventory = inventoryInsert;
        const updatedDoc = await operationsModels.findOneAndUpdate(
            {
                operationCode: operCode
            }
            ,
            dataOper
            ,
            { new: true }  // This option returns the updated document
        );
        // }


        ret.resultData = updatedDoc;
        res.json(ret);

    } catch (error) {
        ret.resultCode = 500;
        ret.message = 'ระบบเกิดข้อผิดพลาด';
        ret.resultDescription = "System error :" + error.message;
        res.json(ret);
    }
};
