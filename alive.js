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
	var timeStamp = new Date();
	console.log('Fired at: ' + timeStamp.getHours() + ':' + timeStamp.getMinutes());
        _.each(sites, function(site) {
            var request = http.get(site, function(response) {
		if (response.headers.location && response.headers.location.match(/opendns/g)) {
		    status[site] = 400;
		} else {
                    status[site] = response.statusCode;
		}
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
    var status = {},
        rule = new schedule.RecurrenceRule();
    rule.minute = 2;
    helpers.updateStatus(sites, status);
	
    schedule.scheduleJob(rule, function() {
        helpers.updateStatus(sites, status);
    });
	
    app.use('/css', express.static(__dirname +  '/css'));
	
    app.get('/', function(request, response) {
        response.send(helpers.template(status));
    });
    app.listen(options.port);
};
