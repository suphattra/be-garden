const branchsModels = require("../../models/branch.models");
const masterData = require("../../models/masterData.models");
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
        const resultTotal = await branchsModels.find(filter);
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
                "subType": "BRANCH_CODE",
                "status": "Active"
            });
            if (seqOperCode == null || seqOperCode == undefined || seqOperCode.length <= 0) {
                ret.resultCode = 400;
                ret.message = 'ไม่พบข้อมูล SEQ';
                ret.resultDescription = 'Not Found';
                res.json(ret);
                return;
            }

            var branchCode  = seqOperCode.value1 + seqOperCode.value2;    //prefix + running number
            dataOper.branchCode  = branchCode ;

            //update seq
            var seqOperCodeUpdate = await masterData.updateOne(
                {
                    "type": "SEQ",
                    "subType": "BRANCH_CODE",
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
            const newOperation = new branchsModels(dataOper);
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