var router = require('express').Router();
var employeeCtrl = require('../controller/employee.ctrl');
var authCtrl = require('../controller/auth.ctrl');

router.post('/sign-in',authCtrl.login);

module.exports = router;