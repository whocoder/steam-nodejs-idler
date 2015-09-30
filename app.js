var winston = require('winston'),
	crypto = require('crypto'),
	fs = require('fs');

winston.add(winston.transports.File, { filename: 'steam_log.log' });
var parseaccount = function(info){
	var keys = Object.keys(info);
	var i = keys.length;
	var newdetails = {};
	while(i--){ newdetails[keys[i]] = info[keys[i]]; }
	return newdetails;
}

/*
	logindetails
		account_name				: null
		password					: null
		auth_code					: null
		sha_sentryfile				: null
*/

fs.readFile('config/accounts.json', function(err, data){
	if(err) throw err;
	var data = JSON.parse(data);
	Object.keys(data).forEach(function(key){
		if(key != '_comment'){
			var info = parseaccount(data[key]);
			info.account_name = key;
			require('./bot')(fs, winston, crypto, info);
		}
	});
});
