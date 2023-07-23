var router = require('express').Router();
var login = require('../controller/login.ctrl');
var employeeCtrl = require('../controller/employee.ctrl');

router.get('/api/login',login.login);
router.get('/api/employee',employeeCtrl.employee);
router.get('/api/employee/:id',employeeCtrl.employeeById);

module.exports = router;