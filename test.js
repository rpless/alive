var alive = require('./alive.js'),
	sites = ['http://www.google.com', 'http://www.foodsafrty.com'];
alive.launchAliveChecker(sites, {port: 3000});
