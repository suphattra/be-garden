var router = require('express').Router();
var employeeCtrl = require('../controller/employee.ctrl');

router.get('',employeeCtrl.list);
router.post('',employeeCtrl.insert);
router.get('/:id',employeeCtrl.findById);
router.put('/:id',employeeCtrl.edit);
router.get('/unassign/timesheet',employeeCtrl.unassign);

module.exports = router;