const employeesFinancialsModels = require("../../models/employeeFinancials.models");
const employeesModels = require("../../models/employee.models");
const masterData = require("../../models/masterData.models");
const mongoose = require('mongoose')
exports.list = async function (req, res) {
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
        if (queryStr.employeeCode) {
            var employeeCodeDtArr = queryStr.employeeCode.split('|');
            filter.employeeCode = { $in: employeeCodeDtArr };
        }
        if (queryStr.startDate && queryStr.endDate) {
            var startDtArr = queryStr.startDate.split('|');
            filter.transactionDate = { $gte: queryStr.startDate, $lt: queryStr.endDate + ' 23:59:59' };
        }
        if (queryStr.financialType) {
            var financialTypeArr = queryStr.financialType.split('|');
            filter["financialType.code"] = { $in: financialTypeArr };
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

        const result = await employeesFinancialsModels.find(filter).skip(offset).limit(limit).sort(sort);
        const resultTotal = await employeesFinancialsModels.find(filter);

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
    filter.employeeCode = id

    var o_id = new mongoose.Types.ObjectId(id);
    var ret = {
        resultCode: 200,
        resultDescription: 'Success'
    };
    try {
        try {
            const result = await employeesFinancialsModels.findById(o_id);

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
        message: "เพิ่มพนักงานสำเร็จ"
    };

    try {
        if (dataList == null || dataList == undefined || dataList.length <= 0) {
            ret.resultCode = 400;
            ret.message = 'Bad Request';
            ret.resultDescription = 'DataList is required';
            res.json(ret);
            return;
        }



        var employeeList = [];
        for (let i = 0; i < dataList.length; i++) {
            var dataEmp = dataList[i];

            var now = new Date();
            dataEmp.createdDate = now;
            dataEmp.updatedDate = now;
            dataEmp.updatedBy = dataEmp.createdBy;

            const newEmployee = new employeesFinancialsModels(dataEmp);
            employeeList.push(newEmployee);
            //await newEmployee.save();
        }

        var insertResult = await employeesFinancialsModels.insertMany(dataList);

        //ret.data = {};
        res.json(ret);

    } catch (error) {
        ret.resultCode = 500;
        ret.message = 'ระบบเกิดข้อผิดพลาด';
        ret.resultDescription = "System error :" + error.message;
        res.json(ret);
    }
};

exports.edit = async function (req, res) {
    var id = req.params.id;

    var ret = {
        resultCode: 200,
        resultDescription: 'Success',
        message: "แก้ไขข้อมูลพนักงานสำเร็จ"
    };
    try {
        var o_id = new mongoose.Types.ObjectId(id);
        const empEdit = await employeesFinancialsModels.findById(o_id);
        if (empEdit == null || empEdit == undefined) {
            ret.resultCode = 404;
            ret.resultDescription = 'Data Not Found';
            ret.message = "ไม่พบข้อมูล";
            return res.json(ret);
        }

        var dataEmp = req.body;
        if (dataEmp.firstName != empEdit.firstName || dataEmp.lastName != empEdit.lastName) {
            var filter = {};
            filter.firstName = dataEmp.firstName;
            filter.lastName = dataEmp.lastName;
            filter.status = "Active";

            const result = await employeesModels.find(filter);

            if (result.length > 0) {
                ret.resultCode = 400;
                ret.message = 'มีพนักงานคนนี้อยู่แล้ว: ' + dataEmp.firstName + ' ' + dataEmp.lastName;
                ret.resultDescription = 'Duplicate';
                res.json(ret);
                return;
            }
        }

        var now = new Date();
        dataEmp.updatedDate = now;
        dataEmp.updatedBy = dataEmp.updatedBy || dataEmp.createdBy;

        const updatedDoc = await employeesFinancialsModels.findOneAndUpdate(
            {
                _id: o_id
            }
            ,
            dataEmp
            ,
            { new: true }  // This option returns the updated document
        );



        ret.resultData = updatedDoc;
        res.json(ret);

    } catch (error) {
        ret.resultCode = 500;
        ret.message = 'ระบบเกิดข้อผิดพลาด';
        ret.resultDescription = "System error :" + error.message;
        res.json(ret);
    }
};

exports.listReport = async function (req, res) {
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
        if (queryStr.employeeCode) {
            var employeeCodeDtArr = queryStr.employeeCode.split('|');
            filter.employeeCode = { $in: employeeCodeDtArr };
        }
        if (queryStr.startDate && queryStr.endDate) {
            var startDtArr = queryStr.startDate.split('|');
            const startDate = new Date(queryStr.startDate);
            const endDate = new Date(queryStr.endDate + ' 23:59:59');
            filter.transactionDate = { $gte: startDate, $lt: endDate };
        }
        if (queryStr.financialType) {
            var financialTypeArr = queryStr.financialType.split('|');
            filter["financialType.code"] = { $in: financialTypeArr };
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

        // var queryStr = req.query
        // var result = []

        var pipeline = [
            {
                $match: {
                    $and: [filter],
                },
            },
            {
                $lookup: {
                    from: "employees",
                    localField: "employeeCode",
                    foreignField: "employeeCode",
                    as: "employeeData"
                }
            },
            {
                $unwind: "$employeeData" // Optional: Unwind the array if you want to work with a single document per match
            }
        ];
        result = await employeesFinancialsModels.aggregate(pipeline);

        ret.resultData = result;
        ret.total = result.length
        res.json(ret);


    } catch (error) {
        console.log(error)
        ret.resultCode = 500;
        ret.message = 'Fail';
        ret.resultDescription = error.message;
        res.json(ret);
    }
};