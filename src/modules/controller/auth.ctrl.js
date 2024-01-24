const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const authModels = require("../../models/authUsers.models");
// Secret key for JWT
const secretKey = 'Garden_S3cr3t_K3y';

function sha256(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
}

exports.login = async function (req, res) {
    const { username, password } = req.body;

    const ret = {
        responseCode: 200,
        responseMessage: 'Success'
    };
    try {
        const hashPwd = sha256(password);
        console.log(hashPwd);
        var filter = { username, password : hashPwd , status: "Active"};
        //console.log(filter);
        const user = await authModels.findOne(filter);
        if(!user){
            return res.status(404).json({
                resultCode: "404",
                resultDescription: "Data not found",
                message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
                resultData: {}
            });
        }

        const token = jwt.sign({ email: user.username, role: user.role }, secretKey, { algorithm: 'HS256' });

        res.json({
            resultCode: "200",
            resultDescription: "Success",
            message: "",
            resultData: {
                accessToken: token
            }
        });

    } catch (error) {
        res.status(500).json({
            resultCode: "500",
            resultDescription: "System error",
            message: "ระบบเกิดข้อผิดพลาด",
            resultData: {}
        });
    }
};
