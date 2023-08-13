var router = require('express').Router();
var operationsCtrl = require('../controller/operations.ctrl');

router.get('',operationsCtrl.list);
router.post('',operationsCtrl.insert);
router.get('/:id',operationsCtrl.findById);
router.put('/:id',operationsCtrl.edit);

module.exports = router;