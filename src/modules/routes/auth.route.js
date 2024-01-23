var router = require('express').Router();
var employeeCtrl = require('../controller/employee.ctrl');

router.post('/sign-in',employeeCtrl.login);

module.exports = router;