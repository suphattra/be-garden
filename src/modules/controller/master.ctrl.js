const masterData = require("../../models/masterData.models");

exports.master = async function (req, res) {
    //var lov = req.query.lov;
    var filter = {};
    filter = req.query
    console.log(req.query);
    var ret = {
        responseCode: 200,
        responseMessage: 'Success'
    };

    try {
        const result = await masterData.find(filter);

        if (result.length <= 0) {
            ret.responseCode = 404;
            ret.responseMessage = 'Data Not Found';
        } else {
            ret.data = result;
        }
        
    } catch (error) {
        ret.responseCode = 500;
        ret.responseMessage = 'Fail';
        ret.responseDescription = error.message;
    }

    res.json(ret);
    // try {
    //     var result = await masterData.find(filter ,{},).then(function (err, result) {
    //         console.log(err)
    //         if (err) {

    //             // ret.responseCode = 500;
    //             // ret.responseMessage = 'Fail';
    //             // ret.responseDescription = err.message;
    //             //res.json(ret);
    //             throw err;
    //         } 
            
            
            
    //         else {
    //             if (result.length <= 0) {
    //                 ret.responseCode = 404;
    //                 ret.responseMessage = 'Data Not Found';

    //                 throw err;
    //                 //res.json(ret);
    //             } else {
    //                 ret.data = result;
    //                 return ret;
    //                 //res.json(ret);
    //             }
    //         }
           
    //         //Return results
    //     });

    //     res.json(result);

    // } catch (error) {
    //     ret.responseCode = 500;
    //     ret.responseMessage = 'Fail';
    //     ret.responseDescription = error.message;
    //     res.json(ret);
    // }
};
