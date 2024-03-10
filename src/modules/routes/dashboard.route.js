var router = require('express').Router();
var dashboardCtrl = require('../controller/dashboard.ctrl');

router.get('/costOfWorkPerBranch', dashboardCtrl.costOfWorkPerBranch);
router.get('/costOfWorkPerTask', dashboardCtrl.costOfWorkPerTask);
router.get('/costOfWorkAllBranch', dashboardCtrl.costOfWorkAllBranch);
router.get('/inventoryReport', dashboardCtrl.inventoryReport);

module.exports = router;