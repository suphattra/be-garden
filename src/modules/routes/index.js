var router = require('express').Router();
var login = require('../controller/login.ctrl');
var masterCtrl = require('../controller/master.ctrl');

router.get('/api/login', login.login);
router.get('/api/v1/masters', masterCtrl.master);

const operationRoute = require('./operations.route');
const employeeRoute = require('./employee.route');
const branchRoute = require('./branch.route');
const inventoryRoute = require('./inventory.route');
const financialsRoute = require('./employee-financials.route');
router.use('/api/v1/operations', operationRoute);
router.use('/api/v1/employee', employeeRoute);
router.use('/api/v1/branches', branchRoute);
router.use('/api/v1/inventories', inventoryRoute);
router.use('/api/v1/employees-financials', financialsRoute);
module.exports = router;