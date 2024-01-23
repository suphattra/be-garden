const mongoose = require('mongoose');
const bcrypt = require('bcrypt')

const bcryptCompare = (myPlaintextPassword, hash) => {
    return new Promise((resolve, reject) => {
        bcrypt.compare(myPlaintextPassword, hash, function(err, result) {
            return resolve(result)
        })
    })
}

module.exports = {
    bcryptCompare,
}
