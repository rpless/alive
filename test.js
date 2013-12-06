var alive = require('./alive.js'),
	sites = ['http://www.google.com'];
alive.launchAliveChecker(sites, {port: 3000});