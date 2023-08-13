const operationsModels = require("../../models/operations.models");
const masterData = require("../../models/masterData.models");

exports.list = async function (req, res) {
    //var lov = req.query.lov;
    var ret = {
        responseCode: 200,
        responseMessage: 'Success'
    };
    try {
        var filter = {};
        var queryStr  =  req.query
        console.log(queryStr);

        if(queryStr.startDate){
            var startDtArr = queryStr.startDate.split('|');
            filter.startDate = {$in: startDtArr};
        }
        if(queryStr.employee){
            var employeeCodeArr = queryStr.employee.split('|');
            filter.employee = {};
            filter.employee.employeeCode = {$in: employeeCodeArr};
        }
        if(queryStr.mainBranch){
            var branchCodeArr = queryStr.mainBranch.split('|');
            filter.mainBranch = {};
            filter.mainBranch.branchCode = {$in: branchCodeArr};
        }
        if(queryStr.subBranch){
            var subBranchCodeArr = queryStr.subBranch.split('|');
            filter.subBranch = {};
            filter.subBranch.branchCode = {$in: subBranchCodeArr};
        }
        if(queryStr.operationStatus){
            var statusArr = queryStr.operationStatus.split('|');
            filter.operationStatus = {};
            filter.operationStatus.code = {$in: statusArr};
        }
       
        const result = await operationsModels.find(filter);
    
        ret.data = result;
        res.json(ret);
        
      
    } catch (error) {
        ret.responseCode = 500;
        ret.responseMessage = 'Fail';
        ret.responseDescription = error.message;
        res.json(ret);
    }
};



exports.findById = async function (req, res) {
    var id = req.params.id;
    var filter = {};
    filter =  req.query
    filter.operationCode = id
    var ret = {
        responseCode: 200,
        responseMessage: 'Success'
    };
    try {
        try {
            const result = await operationsModels.find(filter);

            if (result.length <= 0) {
                ret.responseCode = 404;
                ret.responseMessage = 'Data Not Found';
            } else {
                ret.data = result;
            }

        } catch (error) {
            ret.responseCode = 500;
            ret.responseMessage = 'Fail';
            ret.responseDescription = error.message;
        }

        res.json(ret);

      
    } catch (error) {
        ret.responseCode = 500;
        ret.responseMessage = 'Fail';
        ret.responseDescription = error.message;
        res.json(ret);
    }
};

exports.insert = async function (req, res) {
    const dataList = req.body.dataList;
    var ret = {
        resultCode: 200,
        resultDescription: 'Success',
        message : "สร้างบันทึกการทำงานสำเร็จ"
    };

    try {
        if(dataList == null || dataList == undefined || dataList.length <= 0){
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
            filter.employee =  { employeeCode : dataOper.employee?.employeeCode };
            filter.mainBranch = { branchCode : dataOper.mainBranch?.branchCode };
            filter.task = {code : dataOper.task?.code };
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
                "subType" : "OPERATION_CODE",
                "status" : "Active"
            });

            if(seqOperCode == null || seqOperCode == undefined || seqOperCode.length <= 0){
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
                        "value2": 1
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
            await newOperation.save();
        }
       

        ret.data = {};
        res.json(ret);
      
    } catch (error) {
        ret.resultCode = 500;
        ret.message = 'ระบบเกิดข้อผิดพลาด';
        ret.resultDescription = "System error :" +error.message;
        res.json(ret);
    }
};

exports.edit = function (req, res) {
    var id = req.params.id;
    var filter = {};
    filter =  req.query
    var ret = {
        responseCode: 200,
        responseMessage: 'Success'
    };
    try {
        ret.data = {user:'admin',role:id};
        res.json(ret);
        // Employee.find(filter,{
        // }, function (err, result) {
        //     if (err) {
        //         logger.errorStack(err);
        //         ret.responseCode = 500;
        //         ret.responseMessage = 'Fail';
        //         ret.responseDescription = err.message;
        //         res.json(ret);
        //         throw err;
        //     }else{
        //         logger.info('get user name lov list size :: ' + result.length);
        //         if(result.length <= 0 ){
        //             ret.responseCode = 404;
        //             ret.responseMessage = 'Data Not Found';
        //             res.json(ret);
        //         }else{
        //             ret.data = result;
        //             res.json(ret);
        //         }
        //     }
            
        // });
      
    } catch (error) {
        ret.responseCode = 500;
        ret.responseMessage = 'Fail';
        ret.responseDescription = error.message;
        res.json(ret);
    }
};
