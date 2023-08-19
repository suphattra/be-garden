var router = require('express').Router();
var login = require('../controller/login.ctrl');
var masterCtrl = require('../controller/master.ctrl');

router.get('/api/login', login.login);
router.get('/api/v1/masters', masterCtrl.master);

const operationRoute = require('./operations.route');
const employeeRoute = require('./employee.route');
router.use('/api/v1/operations', operationRoute);
router.use('/api/v1/employee', employeeRoute);

module.exports = router;