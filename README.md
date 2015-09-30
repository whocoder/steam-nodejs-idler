# steam-easy-idle
Steam easy idling package for node.js or io.js

## Accounts Configuration
* Each key is an account name and each value is an object which has all of the following keys.
* `password` is required.
* `auth_code` is optional. You should at some point need this if you have Steam Guard enabled. Once it makes a successful login, it should save the session to the node `sentry` folder so you won't need to repeat the process.
* `games_played` is optional. It is an array of objects containing a `gameid` key and a value corresponding to the Steam AppID. For full options or more info, click [here](https://github.com/SteamRE/SteamKit/blob/master/Resources/Protobufs/steamclient/steammessages_clientserver.proto#L205).
* `auto_reply_msg` is optional. If set, any messages sent to you will be replied to with this.
* `personastate` is optional. If not set, it will default to Online. For values, click [here](https://github.com/SteamRE/SteamKit/blob/master/Resources/SteamLanguage/enums.steamd#L34).

## Setup
### Linux
* Get to a location where you want to install the idle app.
* `npm install steam-easy-idle`
* Navigate to your newly installed app
* `npm install`
* Modify `steam-easy-idle/config/accounts.json`
* `node app.js` (or however you prefer, you could also use [forever](https://www.npmjs.com/package/forever))
* If you get any Steam Guard errors, update `accounts.json` again with your auth code and repeat the above step.

### Windows
Tutorial currently not available.
