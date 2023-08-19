const inventoryModels = require("../../models/inventory.models");
exports.list = async function (req, res) {
    var ret = {
        resultCode: 200,
        resultDescription: 'Success'
    };
    try {
        var filter = {};
        var queryStr = req.query
        console.log(queryStr);

        if (queryStr.startDate) {
            var startDtArr = queryStr.startDate.split('|');
            filter.startDate = { $in: startDtArr };
        }
        if (queryStr.employee) {
            var employeeCodeArr = queryStr.employee.split('|');
            filter.employee = {};
            filter.employee.employeeCode = { $in: employeeCodeArr };
        }
        if (queryStr.mainBranch) {
            var branchCodeArr = queryStr.mainBranch.split('|');
            filter.mainBranch = {};
            filter.mainBranch.branchCode = { $in: branchCodeArr };
        }
        if (queryStr.subBranch) {
            var subBranchCodeArr = queryStr.subBranch.split('|');
            filter.subBranch = {};
            filter.subBranch.branchCode = { $in: subBranchCodeArr };
        }
        if (queryStr.operationStatus) {
            var statusArr = queryStr.operationStatus.split('|');
            filter.operationStatus = {};
            filter.operationStatus.code = { $in: statusArr };
        }

        const result = await inventoryModels.find(filter);

        ret.resultData = result;
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
