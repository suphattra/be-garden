var router = require('express').Router();
var login = require('../controller/login.ctrl');
var employeeCtrl = require('../controller/employee.ctrl');
var masterCtrl = require('../controller/master.ctrl');

router.get('/api/login',login.login);
router.get('/api/employee',employeeCtrl.employee);
router.get('/api/employee/:id',employeeCtrl.employeeById);
router.get('/api/v1/masters',masterCtrl.master);

const operationRoute = require('./operations.route');
router.use('/api/v1/operations', operationRoute);

module.exports = router;