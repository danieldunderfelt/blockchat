const messageSchema = require('./schema/message')

module.exports = function(messageData) {

    if(messageSchema.validate(messageData)) {
        return messageData
    } else {
        return false
    }
}