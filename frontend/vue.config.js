// vue.config.js
module.exports = {
	devServer: {
        proxy: process.env.BASE_URL,
        //'http://localhost:3001/',
    }
  }
