const operationsModels = require("../../models/operations.models");

exports.list = function (req, res) {
    //var lov = req.query.lov;
    var filter = {};
    filter =  req.query
    console.log(req.query);
    var ret = {
        responseCode: 200,
        responseMessage: 'Success'
    };
    try {
        ret.data = {user:'admin',role:'admin '};
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
