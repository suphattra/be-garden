const inventoryModels = require("../../models/inventory.models");
const masterData = require("../../models/masterData.models");
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
        if (queryStr.status) {
            var statusDtArr = queryStr.status.split('|');
            filter.status = { $in: statusDtArr };
        }
        if (queryStr.sort) {
            let desc = queryStr.desc == 'DESC' ? -1 : 1
            sort = { [req.query.sort]: desc };
        } else {
            sort = { updatedDate: 'DESC' };
        }
        const result = await inventoryModels.find(filter).skip(offset).limit(limit).sort(sort);
        const resultTotal = await inventoryModels.find(filter);
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

        for (let i = 0; i < dataList.length; i++) {
            var dataOper = dataList[i];


            var seqOperCode = await masterData.findOne({
                "type": "SEQ",
                "subType": "INVENTORY_CODE",
                "status": "Active"
            });
            if (seqOperCode == null || seqOperCode == undefined || seqOperCode.length <= 0) {
                ret.resultCode = 400;
                ret.message = 'ไม่พบข้อมูล SEQ';
                ret.resultDescription = 'Not Found';
                res.json(ret);
                return;
            }

            var inventoryCode  = seqOperCode.value1 + seqOperCode.value2;    //prefix + running number
            dataOper.inventoryCode  = inventoryCode ;

            //update seq
            var seqOperCodeUpdate = await masterData.updateOne(
                {
                    "type": "SEQ",
                    "subType": "INVENTORY_CODE",
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
            const newOperation = new inventoryModels(dataOper);
            await newOperation.save();
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
    var inventoryCode = req.params.id;

    var ret = {
        resultCode: 200,
        resultDescription: 'Success',
        message : "แก้ไขข้อมูลพนักงานสำเร็จ"
    };
    try {
        const empEdit = await inventoryModels.findOne({ inventoryCode: inventoryCode });
        if ( empEdit == null || empEdit == undefined) {
            ret.resultCode = 404;
            ret.resultDescription = 'Data Not Found';
            ret.message = "ไม่พบข้อมูล";
            return res.json(ret);
        }

        var dataBranch = req.body;
        // if(dataBranch.firstName != empEdit.firstName || dataBranch.lastName != empEdit.lastName){
        //     var filter = {};
        //     filter.firstName = dataBranch.firstName;
        //     filter.lastName = dataBranch.lastName;
        //     filter.status = "Active";
    
        //     const result = await inventoryModels.find(filter);
    
        //     if (result.length > 0) {  
        //         ret.resultCode = 400;
        //         ret.message = 'มีพนักงานคนนี้อยู่แล้ว: '+ dataBranch.firstName + ' ' + dataBranch.lastName;
        //         ret.resultDescription = 'Duplicate';
        //         res.json(ret);
        //         return;
        //     }
        // }

        var now = new Date();
        dataBranch.updatedDate = now; 
        dataBranch.updatedBy = dataBranch.updatedBy || dataBranch.createdBy;

        const updatedDoc = await inventoryModels.findOneAndUpdate(
            {
                inventoryCode: inventoryCode
            }
             , 
             dataBranch
             ,
            { new: true }  // This option returns the updated document
        );
        


        ret.resultData = updatedDoc;
        res.json(ret);
      
    } catch (error) {
        ret.resultCode = 500;
        ret.message = 'ระบบเกิดข้อผิดพลาด';
        ret.resultDescription = "System error :" +error.message;
        res.json(ret);
    }
};