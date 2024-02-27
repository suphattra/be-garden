
const branchsModels = require("../../models/branch.models");
const operationsModels = require("../../models/operations.models");
const masterData = require("../../models/masterData.models");
exports.costOfWorkPerBranch = async function (req, res) {
    var ret = {
        resultCode: 200,
        resultDescription: 'Success'
    };
    try {
        var filter = {};
        var queryStr = req.query
        var result = []
        var resultTable = []
        let month = []
        let monthLabel = []
        let monthGroup = []
        let period = queryStr.period ? queryStr.period : '1'
        let resultTableTemp = []
        if (period === '1') {
            month = ["01", "02", "03"]
            monthLabel = ['January', 'February', 'March']
            monthGroup = [
                { display: 'January', value: "01" },
                { display: 'February', value: "02" },
                { display: 'March', value: "03" },

            ]
        } else if (period === '2') {
            month = ["04", "05", "06"]
            monthLabel = ['April', 'May', 'June']
            monthGroup = [
                { display: 'April', value: "04" },
                { display: 'May', value: "05" },
                { display: 'June', value: "06" },
            ]
        } else if (period === '3') {
            month = ["07", "08", "09"]
            monthLabel = ['July', 'August', 'September']
            monthGroup = [
                { display: 'July', value: "07" },
                { display: 'August', value: "08" },
                { display: 'September', value: "09" },
            ]
        } else if (period === '4') {
            month = ["10", "11", "12"]
            monthLabel = ['October', 'November ', 'December']
            monthGroup = [
                { display: 'October', value: "10" },
                { display: 'November', value: "11" },
                { display: 'December', value: "12" }
            ]
        }
        for (let i = 0; i < month.length; i++) {
            var pipeline = [
                {
                    $lookup: {
                        from: "operations",
                        localField: "branchCode",
                        foreignField: "mainBranch.branchCode",
                        as: "operationsData"
                    }
                },
                {
                    $unwind: {
                        path: "$operationsData",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $match: {
                        "operationsData.operationStatus.code": { $in: ["MD0028"] },
                        "operationsData.startDate": { $gte: queryStr.year + "-" + month[i] + "-01", $lte: queryStr.year + "-" + month[i] + "-31 1:59:59" }
                    }
                },
                {
                    $group: {
                        _id: "$branchCode",
                        branchDetails: { $first: "$$ROOT" },
                        totalOperations: { $sum: 1 }, // Count of operations
                        allOperations: { $push: "$operationsData" } // Include all operation details
                    }
                },
                {
                    $match: {
                        totalOperations: { $gt: 0 },
                        "branchDetails.branchType.code": "MD0014"
                    }
                },
                {
                    $unwind: "$allOperations"
                },
                {
                    $group: {
                        _id: "$_id",
                        branchName: { $first: "$branchDetails.branchName" },
                        totalTaskPaymentRate: { $sum: "$allOperations.taskPaymentRate" },
                        // totalOT: { $sum: "$allOperations.otTotal" },
                        totalOT: {
                            "$sum": {
                                "$multiply": ["$allOperations.otRate", "$allOperations.otAmount"]
                            }
                        },
                        data: { $first: "$totalOperations" }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        label: "$_id",
                        branchName: 1,
                        totalTaskPaymentRate: 1,
                        totalOT: 1,
                        data: 1
                    }
                },
                { $sort: { branchName: 1 } }
            ];
            let response = await branchsModels.aggregate(pipeline);
            const projection = {
                branchCode: 1,
                branchName: 1,
                color: 1,
                _id: 0,
            };
            var filter = {};
            filter["branchType.code"] = { $in: 'MD0014' };
            const branchs = await branchsModels.find(filter, projection).sort({ branchName: 1 });

            const resultaaa = branchs.map((branch) => {
                const { branchCode, branchName, color } = branch;
                let data = 0
                const branchData = response.find((el) => el.label === branchCode);
                if (branchData) {
                    data = branchData.totalTaskPaymentRate + branchData.totalOT
                }
                return { branchCode, branchName, data, color };
            });
            result.push(resultaaa)
            let round = []
            if (response.length <= 0) {
            } else {
                response.forEach(item => {
                    let bbb = {
                        [monthGroup.find(ele => ele.value == month[i]).display]: item.totalTaskPaymentRate + item.totalOT,
                        branchName: item.branchName,
                    }
                    round.push(bbb)
                })
            }
            resultTable.push(round)
        }
        console.log('resultTable', resultTable)
        const combinedResult = result.reduce((combined, currentArray) => {
            currentArray.forEach((branch) => {
                const existingBranch = combined.find((item) => item.branchCode === branch.branchCode);
                // let color = generateColorPalette(5)
                if (existingBranch) {
                    existingBranch.data.push(branch.data);
                } else {
                    combined.push(
                        {
                            branchCode: branch.branchCode,
                            label: branch.branchName,
                            data: [branch.data],
                            backgroundColor: branch.color,
                            borderColor: branch.color,
                            // borderWidth: 1,
                            // barPercentage: 0.5,
                            // barThickness: 6,
                            // maxBarThickness: 8,
                            // minBarLength: 2,
                        });
                }
            });

            return combined;
        }, []);
        const mergedData = {};

        resultTable.forEach(dataArray => {
            dataArray.forEach(item => {
                const branchName = item.branchName;
                if (!mergedData[branchName]) {
                    mergedData[branchName] = {};
                }
                Object.keys(item).forEach(key => {
                    if (key !== 'branchName') {
                        mergedData[branchName][key] = (mergedData[branchName][key] || 0) + item[key];
                    }
                });
            });
        });

        const outputArray = Object.keys(mergedData).map(branchName => ({
            branchName,
            ...mergedData[branchName]
        }));
        //Data result not found return branchName
        if (outputArray.length <= 0) {
            const branchTemp = await branchsModels.find(filter).sort({ taskCode: 1 });
            branchTemp.map((branch) => {
                resultTableTemp.push({
                    branchName: branch.branchName
                })
            })
        }
        let dataSet = {
            datasets: combinedResult,
            labels: monthLabel
        }
        ret.monthGroup = monthGroup
        ret.resultTable = outputArray.length > 0 ? outputArray : resultTableTemp
        ret.resultData = dataSet;
        res.json(ret);


    } catch (error) {
        ret.resultCode = 500;
        ret.message = 'Fail';
        ret.resultDescription = error.message;
        res.json(ret);
    }
};

const generateRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};
const generateColorPalette = (size) => {
    const colors = [];
    for (let i = 0; i < size; i++) {
        colors.push(generateRandomColor());
    }
    return colors;
};
exports.costOfWorkPerTask = async function (req, res) {
    var ret = {
        resultCode: 200,
        resultDescription: 'Success'
    };
    try {
        var filter = {};
        var queryStr = req.query
        var result = []
        var resultTable = []
        let monthGroup = []
        let resultTableTemp = []
        let period = queryStr.period ? queryStr.period : '1'
        if (period === '1') {
            month = ["01", "02", "03"]
            monthLabel = ['January', 'February', 'March']
            monthGroup = [
                { display: 'January', value: "01" },
                { display: 'February', value: "02" },
                { display: 'March', value: "03" },

            ]
        } else if (period === '2') {
            month = ["04", "05", "06"]
            monthLabel = ['April', 'May', 'June']
            monthGroup = [
                { display: 'April', value: "04" },
                { display: 'May', value: "05" },
                { display: 'June', value: "06" },
            ]
        } else if (period === '3') {
            month = ["07", "08", "09"]
            monthLabel = ['July', 'August', 'September']
            monthGroup = [
                { display: 'July', value: "07" },
                { display: 'August', value: "08" },
                { display: 'September', value: "09" },
            ]
        } else if (period === '4') {
            month = ["10", "11", "12"]
            monthLabel = ['October', 'November ', 'December']
            monthGroup = [
                { display: 'October', value: "10" },
                { display: 'November', value: "11" },
                { display: 'December', value: "12" }
            ]
        }
        for (let i = 0; i < month.length; i++) {
            var pipeline = [
                {
                    $match: {
                        "startDate": { $gte: queryStr.year + "-" + month[i] + "-01", $lte: queryStr.year + "-" + month[i] + "-31 1:59:59" },
                        "operationStatus.code": { $in: ["MD0028"] }
                    }
                },
                {
                    $group: {
                        _id: "$task.code",
                        total: { $sum: 1 },
                        uniqueTaskNames: { $addToSet: "$task.value1" },
                        totalTaskPayment: { $sum: "$taskPaymentRate" },
                        totalOtTotal: { $sum: "$otTotal" },
                        totalOtRateAmount: {
                            "$sum": {
                                "$multiply": ["$otRate", "$otAmount"]
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        taskCode: "$_id",
                        uniqueTaskNames: 1,
                        total: 1,
                        totalTaskPayment: 1,
                        totalOtTotal: 1,
                        totalOtRateAmount: 1
                    }
                },
                { $sort: { taskCode: 1 } }
            ];
            let response = await operationsModels.aggregate(pipeline);
            console.log("response", response)
            const projection = {
                code: 1,
                type: 1,
                value1: 1,
                value2: 1,
                color: 1,
                _id: 0,
            };
            var filter = {};
            filter["type"] = 'OPERATION';
            filter["subType"] = 'TASK';
            filter["status"] = 'Active';
            const tasks = await masterData.find(filter, projection).sort({ taskCode: 1 });
            const resultaaa = tasks.map((task) => {
                const { value1, code, color, name } = task;
                let data = 0//new Array(response.length).fill(0);
                const taskData = response.find((el) => el.taskCode === code);
                if (taskData) {
                    data = taskData.totalTaskPayment + taskData.totalOtRateAmount
                }

                return { value1, code, color, data };
            });

            result.push(resultaaa)
            let round = []
            if (response.length <= 0) {
            } else {
                response.forEach(item => {
                    let bbb = {
                        [monthGroup.find(ele => ele.value == month[i]).display]: item.totalTaskPayment + item.totalOtRateAmount,
                        // taskCode: item.taskCode,
                        taskName: item.uniqueTaskNames[0]
                    }
                    round.push(bbb)
                })
            }
            resultTable.push(round)
        }
        console.log('resultTable', resultTable)
        const combinedResult = result.reduce((combined, currentArray) => {
            currentArray.forEach((branch) => {
                const existingBranch = combined.find((item) => item.code == branch.code);
                // let color = generateColorPalette(5)
                if (existingBranch) {
                    existingBranch.data.push(branch.data);
                } else {
                    combined.push(
                        {
                            code: branch.code,
                            label: branch.value1,
                            data: [branch.data],
                            backgroundColor: branch.color,
                            borderColor: branch.color,
                            // borderWidth: 1,
                            // barPercentage: 0.5,
                            // barThickness: 6,
                            // maxBarThickness: 8,
                            // minBarLength: 2,
                        });
                }
            });

            return combined;
        }, []);
        const mergedData = {};

        resultTable.forEach(dataArray => {
            dataArray.forEach(item => {
                const taskName = item.taskName;
                if (!mergedData[taskName]) {
                    mergedData[taskName] = {};
                }
                Object.keys(item).forEach(key => {
                    if (key !== 'taskName') {
                        mergedData[taskName][key] = (mergedData[taskName][key] || 0) + item[key];
                    }
                });
            });
        });
        console.log("mergedData", mergedData)
        const outputArray = Object.keys(mergedData).map(taskName => ({
            taskName,
            ...mergedData[taskName]
        }));

        //Data result notf ound return task
        if (outputArray.length <= 0) {
            const tasksTemp = await masterData.find(filter).sort({ taskCode: 1 });
            tasksTemp.map((task) => {
                resultTableTemp.push({
                    taskName: task.value1
                })
            })
        }
        let dataSet = {
            datasets: combinedResult,
            labels: monthLabel
        }
        ret.monthGroup = monthGroup
        ret.resultTable = outputArray.length > 0 ? outputArray : resultTableTemp
        ret.resultData = dataSet;
        res.json(ret);


    } catch (error) {
        ret.resultCode = 500;
        ret.message = 'Fail';
        ret.resultDescription = error.message;
        res.json(ret);
    }
};

exports.costOfWorkAllBranch = async function (req, res) {
    var ret = {
        resultCode: 200,
        resultDescription: 'Success'
    };
    try {
        var filter = {};
        var queryStr = req.query
        var result = []
        var resultTable = []
        let monthGroup = []
        let allBrachTaskResult = []
        let period = queryStr.period ? queryStr.period : '1'
        if (period === '1') {
            month = ["01", "02", "03"]
            monthLabel = ['January', 'February', 'March']
            monthGroup = [
                { display: 'January', value: "01" },
                { display: 'February', value: "02" },
                { display: 'March', value: "03" },

            ]
        } else if (period === '2') {
            month = ["04", "05", "06"]
            monthLabel = ['April', 'May', 'June']
            monthGroup = [
                { display: 'April', value: "04" },
                { display: 'May', value: "05" },
                { display: 'June', value: "06" },
            ]
        } else if (period === '3') {
            month = ["07", "08", "09"]
            monthLabel = ['July', 'August', 'September']
            monthGroup = [
                { display: 'July', value: "07" },
                { display: 'August', value: "08" },
                { display: 'September', value: "09" },
            ]
        } else if (period === '4') {
            month = ["10", "11", "12"]
            monthLabel = ['October', 'November ', 'December']
            monthGroup = [
                { display: 'October', value: "10" },
                { display: 'November', value: "11" },
                { display: 'December', value: "12" }
            ]
        }
        let dataSet = []
        let task = []
        for (let i = 0; i < month.length; i++) {
            let branchTask = []
            var pipeline = [
                {
                    $match: {
                        "startDate": { $gte: queryStr.year + "-" + month[i] + "-01", $lte: queryStr.year + "-" + month[i] + "-31 1:59:59" },
                        "operationStatus.code": { $in: ["MD0028"] },
                        // "task.code": { $in: ["MD0096"] },
                        // "mainBranch.branchCode": { $in: ["BR10046"] }
                        // "task.code": { $in: ["MD0094"] },
                        // "mainBranch.branchCode": { $in: ["BR10046"] }
                    }
                },
                {
                    $group: {
                        _id: "$mainBranch.branchCode",
                        tasks: {
                            $push: {
                                taskCode: "$task.code",
                                taskName: "$task.value1",
                                taskPaymentRate: "$taskPaymentRate",
                                totalOtRateAmount: {
                                    "$sum": {
                                        "$multiply": ["$otRate", "$otAmount"]
                                    }
                                }
                            }
                        }
                        // tasks: {
                        //     $addToSet: {
                        //         taskCode: "$task.code",
                        //         // totalTaskPaymentRate :  "$taskPaymentRate",
                        //         totalTaskPaymentRate: { $sum: "$taskPaymentRate" },
                        //         totalOtRateAmount: {
                        //             "$sum": {
                        //                 "$multiply": ["$otRate", "$otAmount"]
                        //             }
                        //         }
                        //     }
                        // }
                    }
                },
                {
                    $lookup: {
                        from: "branches",
                        localField: "_id",
                        foreignField: "branchCode",
                        as: "branch"
                    }
                },
                {
                    $unwind: "$branch"
                },
                {
                    $project: {
                        _id: 0,
                        branchCode: "$_id",
                        branchName: "$branch.branchName",
                        tasks: 1
                    }
                },
                { $sort: { branchName: 1 } }
            ]
            let response = await operationsModels.aggregate(pipeline);
            dataSet.push(response)
            const projection = {
                code: 1,
                type: 1,
                value1: 1,
                value2: 1,
                color: 1,
                _id: 0,
            };
            var filterTask = {};
            filterTask["type"] = 'OPERATION';
            filterTask["subType"] = 'TASK';
            filterTask["status"] = 'Active';
            const tasks = await masterData.find(filterTask, projection);
            task = tasks
            // console.log('response=====', response)

            if (response.length > 0) {

                for (let j = 0; j < response.length; j++) {

                    const taskMap = tasks.map((task) => {
                        const { value1, code, color, name } = task;


                        if (response.length > 0) {


                            // console.log(data);
                            const taskData = response[j].tasks.find((el) => el.taskCode === code);
                            console.log('taskData', taskData)
                            let data = 0
                            if (taskData) {
                                const sumTask = response[j].tasks.filter((el) => el.taskCode === code)
                                    .reduce((acc, curr) => acc + curr.taskPaymentRate + curr.totalOtRateAmount, 0);
                                // const sum = sumTask.reduce((acc, curr) => acc + curr.taskPaymentRate, 0);
                                data = sumTask
                            }
                            return { [task.value1]: data, name: task.value1, value: data };
                        }


                    })
                    branchTask.push({
                        branchCode: response[j]?.branchCode,
                        branchName: response[j]?.branchName,
                        task: taskMap
                    })
                    // console.log('taskMap', taskMap)
                }

            }
            // task.push(resultaaa)
            // let dataResult = {
            //     branchCode: response[0]?.branchCode,
            //     branchName: response[0]?.branchName,
            //     task: resultaaa
            // }
            // console.log(resultaaa)
            // dataSet.push(dataResult)
            allBrachTaskResult.push(branchTask)
        }
        ret.monthGroup = monthGroup
        ret.taskGroup = task;
        ret.resultData = allBrachTaskResult;
        res.json(ret);
    } catch (error) {
        ret.resultCode = 500;
        ret.message = 'Fail';
        ret.resultDescription = error.message;
        res.json(ret);
    }
}


