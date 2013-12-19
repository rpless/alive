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
    updateStatus: function(sites, status, filters) {
        var timeStamp = new Date();
        _.each(sites, function(site) {
            var request = http.get(site, function(response) {
                if (filters) {
                    var shouldFilter = _.reduce(filters, function(memo, filter) { return memo && filter(response.headers); }, true);
                    status[site] = shouldFilter ? response.statusCode : 400;
                }
            });
            request.on('error', function(err) {
                status[site] = 'Unreachable';
            });
        });
    }
};

Handlebars.registerHelper('statusStyle', function(status) {
    return (typeof status === 'string' || status >= 400) ? 'bad' : 'good';
});
	
/**
 * [Listof String] [Optional Object] -> Void
 */
exports.launchAliveChecker = function(sites, options) {
    var status = {},
        rule = new schedule.RecurrenceRule(),
        updater = _.partial(helpers.updateStatus, sites, status, options.filters);
    rule.minute = options.minute;
    _.each(sites, function(site) { status[site] = 'Unknown'; });
    updater();
	
    schedule.scheduleJob(rule, function() { updater(); });
	
    app.use('/css', express.static(__dirname +  '/css'));
	
    app.get('/', function(request, response) {
        response.send(helpers.template(status));
    });
    app.listen(options.port);
};
