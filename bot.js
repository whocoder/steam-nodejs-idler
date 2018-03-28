module.exports = function(fs, winston, crypto, logindetails){
	if(!logindetails || !logindetails.account_name || !logindetails.password){
		winston.error('No account was passed to the bot.');
		throw new Error('No account was passed to the bot.');
	}
	var Steam = require('steam');
	var badconnects = 0;

	var client = new Steam.SteamClient(),
		user = new Steam.SteamUser(client),
		friends = new Steam.SteamFriends(client),
		account = logindetails.account_name;

	if(fs.existsSync('steam-servers')){
		Steam.servers = JSON.parse(fs.readFileSync('steam-servers'));
	}

	client.on('error', function(err){
		if(badconnects >= 10){ throw new Error('Over 10 bad connects. Err: ' + err); }
		badconnects += 1;

		winston.warn('Steam error: (' + err + '). Attempting reconnect.');
		client.connect();
	});

	user.on('updateMachineAuth', function(response, callback){
		fs.existsSync('sentry') || fs.mkdirSync('sentry');
		fs.writeFileSync('sentry/' + account + '.sentry', response.bytes);

		logindetails.sha_sentryfile = crypto.createHash('sha1').update(response.bytes).digest();

		// Accept the update
		callback({sha_file: logindetails.sha_sentryfile});
		winston.info('Updated sentry file.');
	});

	client.on('connected', function(){
		var callback = function(){
			user.logOn({
				account_name: account,
				password: logindetails.password,
				auth_code: ((logindetails.auth_code && !logindetails.sha_sentryfile) ? logindetails.auth_code : 
null),
				sha_sentryfile: (logindetails.sha_sentryfile ? logindetails.sha_sentryfile : null)
			});
		}
		fs.exists('sentry/' + account + '.sentry', function(exists){
			if(exists){
				fs.readFile('sentry/' + account + '.sentry', function(err, data){
					if(!err){
						logindetails.sha_sentryfile = crypto.createHash('sha1').update(data).digest();
						callback();
					}else
						callback();
				});
			}else
				callback();
		});
	});

	client.on('servers', function(servers){
		fs.writeFileSync('steam-servers', JSON.stringify(servers));
		winston.info('Received Steam servers list.');
	});

	client.on('logOnResponse', function(response){
		var steamguard 		= ((response.eresult == Steam.EResult.AccountLogonDenied)
								|| (response.eresult == Steam.EResult.InvalidLoginAuthCode));
		var authenticator 	= (response.eresult == Steam.EResult.AccountLoginDeniedNeedTwoFactor);

		if(steamguard || authenticator){
			winston.error('Steam guard auth failed for ' + account + ' :: Invalid code? '
						+ (response.eresult == Steam.EResult.InvalidLoginAuthCode ? true : false));
			throw new Error('Steam Guard failed.');
		}

		if(response.eresult != Steam.EResult.OK){
			winston.warn('Login unsuccessful for ' + account +'. Reason: ' + response.eresult + ' (Steam.EResult)');
			return; // return triggers error event for client, so connecting repeats
		}

		// Now that we've ruled out all bad possibilties, it's safe to say
		winston.info('Login successful for ' + account +'.');

		if(logindetails.personastate){
			friends.setPersonaState(logindetails.personastate);
		}else{
			friends.setPersonaState(Steam.EPersonaState.Online);
		}

		if(logindetails.games_played){
			user.gamesPlayed({ "games_played": logindetails.games_played });
		}
	});

	friends.on('friendMsg', function(steamid, message, type){
		if(logindetails.auto_reply_msg){
			if(type === Steam.EChatEntryType.ChatMsg || type === Steam.EChatEntryType.InviteGame){
				friends.sendMessage(steamid, logindetails.auto_reply_msg, Steam.EChatEntryType.ChatMsg);
				winston.info('Automatically sent message to ' + steamid);
			}
		}
	});

	client.connect();
}
