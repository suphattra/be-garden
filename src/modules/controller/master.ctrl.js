const masterData = require("../../models/masterData.models");

exports.master = async function (req, res) {
    //var lov = req.query.lov;
    var filter = {};
    filter = req.query
    console.log(req.query);
    var ret = {
        resultCode: 200,
        resultDescription: 'Success'
    };

    try {
        const result = await masterData.find(filter);

        if (result.length <= 0) {
            ret.resultCode = 404;
            ret.resultDescription = 'Data Not Found';
        } else {
            ret.resultData = result;
        }
        
    } catch (error) {
        ret.resultCode = 500;
        ret.message = 'Fail';
        ret.resultDescription = error.message;
    }

    res.json(ret);
};
