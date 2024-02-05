
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
        let month = []
        let monthLabel = []
       let period =  queryStr.period ? queryStr.period : 1
        if(period === '1'){
            month = ["01", "02", "03", "04"]
            monthLabel = ['January', 'February', 'March', 'April']
        }else if(period === '2'){
            month = ["05", "06", "07", "08"]
            monthLabel = ['May', 'June', 'July', 'August']
        }else if(period === '3'){
            month = ["09", "10", "11", "12"]
            monthLabel = ['September', 'October', 'November ', 'December']
        }
        // let month = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]
        // let monthLabel = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November ', 'December']
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
                        branchDetails: { $first: "$$ROOT" }, // Include all branch details
                        totalOperations: { $sum: 1 }, // Count of operations
                        allOperations: { $push: "$operationsData" } // Include all operation details
                    }
                },
                {
                    $match: {
                        totalOperations: { $gt: 0 },
                        "branchDetails.branchType.code": "MD0014"// Filter branches with at least one operation
                    }
                },
                {
                    $project: {
                        _id: 0, // Exclude _id field
                        label: "$_id",
                        branchName: "$branchDetails.branchName",
                        data: "$totalOperations"
                    }
                }
            ];
            let response = await branchsModels.aggregate(pipeline);
            // console.log("=========response", response)
            const projection = {
                branchCode: 1, // Include branchCode
                branchName: 1, // Include branchName
                color: 1, // Include branchName
                _id: 0, // Exclude _id if you don't want it
            };
            var filter = {};
            filter["branchType.code"] = { $in: 'MD0014' };
            const branchs = await branchsModels.find(filter, projection);

            const resultaaa = branchs.map((branch) => {
                console.log("branchs", branch)
                const { branchCode, branchName, color } = branch;
                let data = 0//new Array(response.length).fill(0);
                const branchData = response.find((el) => el.label === branchCode);
                if (branchData) {
                    data = branchData.data
                }
                return { branchCode, branchName, data, color };
            });
            // console.log("resultaaa", resultaaa)
            result.push(resultaaa)
        }
        // console.log("result", result)
        const combinedResult = result.reduce((combined, currentArray) => {
            currentArray.forEach((branch) => {
                // console.log("branchs", branch)
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
        let dataSet = {
            datasets: combinedResult,
            labels: monthLabel
        }
        ret.total = combinedResult.length
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
        let month = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]
        let monthLabel = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November ', 'December']
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
                        total: { $sum: 1 }, // Count of operations
                        uniqueTaskNames: { $addToSet: "$task.value1" }, // Include all operation details
                    }
                },
                {
                    $project: {
                        _id: 0, // Exclude _id field, you can include it if needed
                        taskCode: "$_id", // Rename _id to taskCode
                        uniqueTaskNames: 1, // Include taskNames in the output
                        total: 1 // Include total in the output
                        // Add other fields you want to include in the projection
                    }
                }
            ];
            let response = await operationsModels.aggregate(pipeline);
            // console.log("response", response)
            const projection = {
                code: 1, // Include branchCode
                type: 1, // Include branchCode
                value1: 1, // Include branchName
                value2: 1, // Include branchName
                color: 1, // Include branchName
                _id: 0, // Exclude _id if you don't want it
            };
            var filter = {};
            filter["type"] = 'OPERATION';
            filter["subType"] = 'TASK';
            filter["status"] = 'Active';
            const tasks = await masterData.find(filter, projection);
            // console.log("tasks", tasks)
            const resultaaa = tasks.map((task) => {
                // console.log("task", task)
                const { value1, code, color } = task;
                let data = 0//new Array(response.length).fill(0);
                const taskData = response.find((el) => el.taskCode === code);
                if (taskData) {
                    // console.log('ddddddd',taskData)
                    data = taskData.total
                }
                return { value1, code, color, data };
            });
            // console.log("resultaaa", resultaaa)
            result.push(resultaaa)
            // result.push(response)

        }

        // const combineAndTransformData = (rawData) => {
        //     const combinedData = {};

        //     rawData.forEach((group) => {
        //         group.forEach((item) => {
        //             const { taskCode, uniqueTaskNames, total } = item;
        //             uniqueTaskNames.forEach((taskName, index) => {
        //                 const label = taskName;//taskCode;
        //                 const name = taskName;
        //                 const data = combinedData[label] ? [...combinedData[label].data] : Array(rawData.length).fill(0);

        //                 data[index] = total;

        //                 combinedData[label] = { label, name, data };
        //             });
        //         });
        //     });

        //     return Object.values(combinedData);
        // };

        // const transformedData = combineAndTransformData(result);
        // console.log("result", result)
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
        // console.log("combinedResult", combinedResult)
        let dataSet = {
            datasets: combinedResult,
            labels: monthLabel
        }
        ret.total = combinedResult.length
        ret.resultData = dataSet;
        res.json(ret);


    } catch (error) {
        ret.resultCode = 500;
        ret.message = 'Fail';
        ret.resultDescription = error.message;
        res.json(ret);
    }
};


