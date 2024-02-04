
const branchsModels = require("../../models/branch.models");
const operationsModels = require("../../models/operations.models");
exports.costOfWorkPerBranch = async function (req, res) {
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
            result.push(response)

        }
        const combinedData = result.reduce((result, array) => {
            array.forEach((item, index) => {
                const existingItem = result.find((i) => i.label === item.label);

                if (existingItem) {
                    existingItem.data.push(item.data);
                } else {
                    let color = generateColorPalette(5)
                    result.push({
                        label: item.branchName,
                        data: [item.data],
                        // branchCode: item.label,
                        // backgroundColor: color,
                        // borderColor: color,
                        borderWidth: 1,
                        // stack: 1,
                        // hoverBackgroundColor: 'rgba(255,99,132,0.4)',
                        // hoverBorderColor: 'rgba(255,99,132,1)',
                    });
                }
            });

            return result;
        }, []);

        // Fill missing data values with 0
        combinedData.forEach((item) => {
            const maxDataLength = Math.max(...result.map((arr) => arr.length));
            item.data.length = maxDataLength; // Set the length to the maximum length

            for (let i = 0; i < maxDataLength; i++) {
                if (item.data[i] === undefined) {
                    item.data[i] = 0;
                }
            }
        });

        let dataSet = {
            datasets: combinedData,
            labels: monthLabel
        }
        ret.total = combinedData.length
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
                        "startDate": { $gte: queryStr.year + "-"+ month[i] + "-01", $lte: queryStr.year + "-" + month[i] + "-31 1:59:59" },
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
            result.push(response)

        }

        const combineAndTransformData = (rawData) => {
            const combinedData = {};

            rawData.forEach((group) => {
                group.forEach((item) => {
                    const { taskCode, uniqueTaskNames, total } = item;
                    uniqueTaskNames.forEach((taskName, index) => {
                        const label = taskName;//taskCode;
                        const name = taskName;
                        const data = combinedData[label] ? [...combinedData[label].data] : Array(rawData.length).fill(0);

                        data[index] = total;

                        combinedData[label] = { label, name, data };
                    });
                });
            });

            return Object.values(combinedData);
        };

        const transformedData = combineAndTransformData(result);
        let dataSet = {
            datasets: transformedData,
            labels: monthLabel
        }
        ret.total = transformedData.length
        ret.resultData = dataSet;
        res.json(ret);


    } catch (error) {
        ret.resultCode = 500;
        ret.message = 'Fail';
        ret.resultDescription = error.message;
        res.json(ret);
    }
};


