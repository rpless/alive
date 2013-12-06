var fs = require('fs'),
	http = require('http'),
    express = require('express'),
	_ = require('underscore'),
	schedule = require('node-schedule'),
	Handlebars = require('handlebars'),
	app = express(),
	templateFile = 'healthcheck.hbs';
	
var helpers = {
	template: Handlebars.compile(fs.readFileSync(templateFile).toString()),
	updateStatus: function(sites, status) {
		_.each(sites, function(site) {
			var request = http.get(site, function(response) {
				status[site] = response.statusCode;
			});
			request.on('error', function(err) {
				status[site] = err.statusCode;
			});
		});
	}
};

Handlebars.registerHelper('statusStyle', function(status) {
	return (status >= 400) ? 'bad' : 'good';
});
	
exports.launchAliveChecker = function(sites, options) {
	var status = {};
	helpers.updateStatus(sites, status);
	
	schedule.scheduleJob('30 * * * *', function() {
		helpers.updateStatus(sites, status);
	});
	
	app.use('/css', express.static(__dirname +  '/css'));
	
	app.get('/', function(request, response) {
		response.send(helpers.template(status));
	});
	app.listen(options.port);
};