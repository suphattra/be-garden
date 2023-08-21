const employeesModels = require("../../models/employee.models");
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
        if (queryStr.employeeCode) {
            var employeeCodeDtArr = queryStr.employeeCode.split('|');
            filter.employeeCode = { $in: employeeCodeDtArr };
        }
        if (queryStr.gender) {
            var genderArr = queryStr.gender.split('|');
            filter["gender.code"] = { $in: genderArr };
        }
        if (queryStr.nationality) {
            var nationalityArr = queryStr.nationality.split('|');
            filter["nationality.code"] = { $in: nationalityArr };
        }
        if (queryStr.employeeType) {
            var employeeTypeArr = queryStr.employeeType.split('|');
            filter["employeeType.code"] = { $in: employeeTypeArr };
        }
        if (queryStr.employeeRole) {
            var employeeRoleArr = queryStr.employeeRole.split('|');
            filter["employeeRole.code"] = { $in: employeeRoleArr };
        }
        if (queryStr.status) {
            var statusDtArr = queryStr.status.split('|');
            filter.status = { $in: statusDtArr };
        }
        if (queryStr.operationAssignDate) {
            // var statusDtArr = queryStr.operationAssignDate.split('|');
            // filter.status = {$in: operationAssignDate}; // รอ spec
        }

        const result = await employeesModels.find(filter);

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
            const result = await employeesModels.find(filter);

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
exports.unassign = async function (req, res) {
    var ret = {
        resultCode: 200,
        resultDescription: 'Success'
    };
    try {
        var filter = {};
        var queryStr = req.query
        var result =[]
        if (queryStr.operationAssignDate) {
            var pipeline = [
                // {
                //     $match: {
                //         $and: condition,
                //     },
                // },
                {
                    $lookup: {
                        from: "operations",
                        let: { emp_code: "$employeeCode" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$employee.employeeCode", "$$emp_code"] },
                                            { $not: [{ $eq: ["$operationStatus.code", "MD0029"] }] },
                                            { $eq: ["$startDate", queryStr.operationAssignDate] }

                                        ]
                                    }
                                }
                            }
                        ],
                        as: "matched_operations"
                    },
                },
                {
                    $match: {
                        "matched_operations": { $size: 0 }  // Filtering out documents where matched_operations array is empty
                    }
                },
                {
                    $project: {
                        matched_operations: 0  // Excluding the matched_operations field from the final output
                    }
                }
            ];
            result =  await employeesModels.aggregate(pipeline);
        }else{
            ret.resultCode = 500;
            ret.message = 'ระบบเกิดข้อผิดพลาด';
            ret.resultDescription = "กรุณาระบุ Operation Assign Date";
        }

        ret.resultData = result;
        res.json(ret);


    } catch (error) {
        ret.resultCode = 500;
        ret.message = 'Fail';
        ret.resultDescription = error.message;
        res.json(ret);
    }
};

