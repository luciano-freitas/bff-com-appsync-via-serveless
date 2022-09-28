const axios = require('axios').default
const instance = axios.create({ timeout: 1000 })
module.exports = instance
