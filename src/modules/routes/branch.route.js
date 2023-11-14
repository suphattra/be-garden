var router = require('express').Router();
var branchCtrl = require('../controller/branch.ctrl');

router.get('', branchCtrl.list);
router.post('', branchCtrl.insert);
router.get('/:id', branchCtrl.findById);
router.put('/:id',branchCtrl.edit);

module.exports = router;