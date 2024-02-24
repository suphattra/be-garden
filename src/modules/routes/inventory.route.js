var router = require('express').Router();
var inventoryCtrl = require('../controller/inventory.ctrl');

router.get('',inventoryCtrl.list);
router.post('',inventoryCtrl.insert);
router.get('/:id',inventoryCtrl.findById);
router.put('/:id',inventoryCtrl.edit);
router.get('/report/inventory',inventoryCtrl.report);
module.exports = router;