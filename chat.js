// Load in some dependencies
const Mixer = require('@mixer/client-node');
const ws = require('ws');

// Instantiate a new Mixer Client
const client = new Mixer.Client(new Mixer.DefaultRequestRunner());

/* With OAuth we don't need to log in. The OAuth Provider will attach
 * the required information to all of our requests after this call.
 * They'll also be authenticated with the user information of the user
 * who owns the token provided.
 */
client.use(new Mixer.OAuthProvider(client, {
    tokens: {
        access: 'Pu07votV832vvllVPg2zABuwG6NGZgGpgKfgRPVBdFnKaQI0swtXCDBbQVxqvbeX',
        // Tokens retrieved via this page last for 1 year.
        expires: Date.now() + (365 * 24 * 60 * 60 * 1000)
    },
}));
/**
 * Gets our Currently Authenticated Mixer user's information.
 * This returns an object full of useful information about
 * the user whose OAuth Token we provided above.
 */
async function getUserInfo() {
    // Users Current will return information about the user who owns the OAuth
    // token registered above.
    return client.request('GET', 'users/current')
    .then(response => response.body);
}
getUserInfo().then(userInfo => {
    console.log(`Hi, ${userInfo.username}!`);
});
/**
 * Gets connection information from Mixer's chat servers
 * @param {Number} channelId The channelId of the channel you'd like
 *  to get connection information for.
 * @returns {Promise.<>}
 */
async function getConnectionInformation(channelId) {
    return new Mixer.ChatService(client).join(channelId).then(response => response.body);
}
