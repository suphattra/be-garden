const inventoryModels = require("../../models/inventory.models");
exports.list = async function (req, res) {
    var ret = {
        resultCode: 200,
        resultDescription: 'Success'
    };
    try {
        var filter = {};
        var queryStr = req.query
        let offset = req.query.offset || 0;
        let limit = req.query.limit || 10;
        let sort = {}
        console.log(queryStr);

        if (queryStr.importDateFrom && queryStr.importDateTo) {
            filter.importDate = { $gte: queryStr.importDateFrom, $lt: queryStr.importDateTo + ' 00:00:00'};
        }
        if(queryStr.inventoryCode){
            const condition = {$regex : '.*' + queryStr.inventoryCode + '.*',$options: 'i'}
            filter.$or=[
                {"inventoryCode": condition}
            ]
        }
        if(queryStr.inventoryName){
            const condition = {$regex : '.*' + queryStr.inventoryName + '.*',$options: 'i'}
            filter.$or=[
                {"inventoryName": condition}
            ]
        }
        if (queryStr.inventoryType) {
            var codeArr = queryStr.inventoryType.split('|');
            filter["inventoryType.code"] = { $in: codeArr };
        }
        if (queryStr.paymentType) {
            var codeArr = queryStr.paymentType.split('|');
            filter["paymentType.code"] = { $in: codeArr };
        }
        const result = await inventoryModels.find(filter);
        const resultTotal = await inventoryModels.find(filter).skip(offset).limit(limit).sort(sort);
        ret.resultData = result;
        ret.total = resultTotal.length
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
    filter.inventoryCode = id
    var ret = {
        resultCode: 200,
        resultDescription: 'Success'
    };
    try {
        try {
            const result = await inventoryModels.find(filter);

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
