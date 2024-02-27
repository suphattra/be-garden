var router = require('express').Router();
var dashboardCtrl = require('../controller/dashboard.ctrl');

router.get('/costOfWorkPerBranch', dashboardCtrl.costOfWorkPerBranch);
router.get('/costOfWorkPerTask', dashboardCtrl.costOfWorkPerTask);
router.get('/costOfWorkAllBranch', dashboardCtrl.costOfWorkAllBranch);

module.exports = router;