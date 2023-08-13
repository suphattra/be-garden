const operationsModels = require("../../models/operations.models");

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
            filter.employee.employeeCode = {$in: employeeCodeArr};
        }
        if(queryStr.mainBranch){
            var branchCodeArr = queryStr.mainBranch.split('|');
            filter.mainBranch.branchCode = {$in: branchCodeArr};
        }
        if(queryStr.subBranch){
            var subBranchCodeArr = queryStr.subBranch.split('|');
            filter.subBranch.branchCode = {$in: subBranchCodeArr};
        }
        if(queryStr.operationStatus){
            var statusArr = queryStr.operationStatus.split('|');
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



exports.insert = function (req, res) {
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
