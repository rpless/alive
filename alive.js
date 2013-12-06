var fs = require('fs'),
	http = require('http'),
    express = require('express'),
	_ = require('underscore'),
	schedule = require('schedule'),
	Handlebars = require('handlebars'),
	app = express(),
	templateFile = 'healthcheck.hbs';
	
var helpers = {
	template: Handlebars.compile(fs.readFileSync(templateFile)),
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
	
exports.launchAliveChecker = function(sites, options) {
	var status = helpers.updateStatus(sites, {}),
		rule = new schedule.RecurrenceRule();
	rule.minute = 30;
	
	schedule.scheduleJob(rule, function() {
		helpers.updateStatus(sites, status);
	});
	
	app.get('*', function(request, response) {
		response.send(helpers.template(status));
	};
	app.listen(options.port);
};