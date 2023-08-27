const employeesModels = require("../../models/employee.models");
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
        let offset = req.query.offset || 0;
        let limit= req.query.limit ||10;

        if (queryStr.startDate) {
            var startDtArr = queryStr.startDate.split('|');
            filter.startDate = { $in: startDtArr };
        }
        if (queryStr.employeeCode) {
            var employeeCodeDtArr = queryStr.employeeCode.split('|');
            filter.employeeCode = { $in: employeeCodeDtArr };
        }
        if(queryStr.employeeFullName){
            const condition = {$regex : '.*' + queryStr.employeeFullName + '.*',$options: 'i'}
            filter.$or=[
                {"firstName": condition},
                {"lastName": condition},
                {"nickName": condition}
            ]
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

        const result = await employeesModels.find(filter).skip(offset).limit(limit);;
        const resultTotal = await employeesModels.find(filter);
        
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

exports.insert = async function (req, res) {
    const dataList = req.body.dataList;
    var ret = {
        resultCode: 200,
        resultDescription: 'Success',
        message : "เพิ่มพนักงานสำเร็จ"
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
            var emp = dataList[i];
            var filter = {};
            filter.firstName = emp.firstName;
            filter.lastName = emp.lastName;
            filter.status = "Active";

            const result = await employeesModels.find(filter);

            if (result.length > 0) {  
                ret.resultCode = 404;
                ret.message = 'มีพนักงานคนนี้อยู่แล้ว: '+ emp.firstName + ' ' + emp.lastName;
                ret.resultDescription = 'Duplicate';
                res.json(ret);
                return;
            }
        }

        var employeeList = [];
        for (let i = 0; i < dataList.length; i++) {
            var dataEmp = dataList[i];

            
            var seqEmpCode = await masterData.findOne({
                "type": "SEQ",
                "subType" : "EMPLOYEE_CODE",
                "status" : "Active"
            });

            if(seqEmpCode == null || seqEmpCode == undefined || seqEmpCode.length <= 0){
                ret.resultCode = 400;
                ret.message = 'ไม่พบข้อมูล SEQ';
                ret.resultDescription = 'Not Found';
                res.json(ret);
                return;
            }
            
            var employeeCode = seqEmpCode.value1 + seqEmpCode.value2;    //prefix + running number
            dataEmp.employeeCode = employeeCode;

            //update seq
            var seqOperCodeUpdate = await masterData.updateOne(
                {
                    "type": "SEQ",
                    "subType": "EMPLOYEE_CODE",
                    "status": "Active"
                },
                { 
                    $inc: {
                        value2 : 1
                    },
                    $currentDate: {
                        updatedDate: true
                    }
                });

            var now = new Date();
            dataEmp.createdDate = now;
            dataEmp.updatedDate = now;
            dataEmp.updatedBy = dataEmp.createdBy;

            const newEmployee = new employeesModels(dataEmp);
            employeeList.push(newEmployee);
            //await newEmployee.save();
        }

        var insertResult = await employeesModels.insertMany(dataList);

        //ret.data = {};
        res.json(ret);
      
    } catch (error) {
        ret.resultCode = 500;
        ret.message = 'ระบบเกิดข้อผิดพลาด';
        ret.resultDescription = "System error :" +error.message;
        res.json(ret);
    }
};