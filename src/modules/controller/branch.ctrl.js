const branchsModels = require("../../models/branch.models");
exports.list = async function (req, res) {
    var ret = {
        resultCode: 200,
        resultDescription: 'Success'
    };
    try {
        var filter = {};
        var queryStr = req.query
        console.log(queryStr);

        if (queryStr.branchCode) {
            var branchCodeDtArr = queryStr.branchCode.split('|');
            filter.branchCode = { $in: branchCodeDtArr };
        }
        if (queryStr.branchName) {
            var branchNameCodeArr = queryStr.branchName.split('|');
            filter.branchName = {};
            filter.branchName = { $in: branchNameCodeArr };
        }
        if (queryStr.branchType) {
            var branchTypeArr = queryStr.branchType.split('|');
            filter["branchType.code"] = { $in: branchTypeArr };
        }
        if (queryStr.status) {
            var statusArr = queryStr.status.split('|');
            filter.status = {};
            filter.status = { $in: statusArr };
        }

        const result = await branchsModels.find(filter);

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
    filter.branchCode = id
    var ret = {
        resultCode: 200,
        resultDescription: 'Success'
    };
    try {
        try {
            const result = await branchsModels.find(filter);

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
