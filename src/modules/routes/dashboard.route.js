var router = require('express').Router();
var dashboardCtrl = require('../controller/dashboard.ctrl');

router.get('/costOfWorkPerBranch', dashboardCtrl.costOfWorkPerBranch);
router.get('/costOfWorkPerTask', dashboardCtrl.costOfWorkPerTask);

module.exports = router;