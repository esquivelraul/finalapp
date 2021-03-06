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

/* Gets our Currently Authenticated Mixer user's information. This returns an object
 * full of useful information about the user whose OAuth Token we provided above.
 */
async function getUserInfo() {
    // Users Current will return information about the user who owns the OAuth
    // token registered above.
    return client.request('GET', 'users/current').then(response => response.body);
}

/**
 * Gets connection information from Mixer's chat servers
 * @param {Number} channelId The channelId of the channel you'd like to
 *  get connection information for.
 * @returns {Promise.<>}
 */
async function getConnectionInformation(channelId) {
    return new Mixer.ChatService(client).join(channelId).then(response => response.body);
}

/**
 * Creates a Mixer chat socket and authenticates
 * @param {number} userId The user to authenticate as
 * @param {number} channelId The channel id of the channel you want to join
 * @returns {Promise.<>}
 */
async function joinChat(userId, channelId) {
    const joinInformation = await getConnectionInformation(channelId);
    // Chat connection
    const socket = new Mixer.Socket(ws, joinInformation.endpoints).boot();

    return socket.auth(channelId, userId, joinInformation.authkey).then(() => socket);
}

// Get our Bot's User Information, Who are they?
getUserInfo().then(async userInfo => {

    /* Join our target Chat Channel, in this case we'll join
     * our Bot's channel.
     * But you can replace the second argument of this function with ANY Channel ID.
     */
    const socket = await joinChat(userInfo.id, userInfo.channel.id);

    // Send a message once connected to chat.
    socket.call('msg', [`Hi! I'm connected!`]);

    // Greet a joined user
    socket.on('UserJoin', data => {
        socket.call('msg',[
            `Hola ${data.username}! Estamos trasmitiendo una repetición en un momento nos comunicamos contigo!`,
        ]);
    });

    // React to our !ping command
    // When there's a new chat message.
    socket.on('ChatMessage', data => {
        if (data.message.message[0].data.toLowerCase().startsWith('!ping')) {
            // Respond with pong
            socket.call('msg', [`@${data.user_name} PONG!`]);
            console.log(`Ponged ${data.user_name}`);
        }
    });

    // Handle errors
    socket.on('error', error => {
        console.error('Socket error');
        console.error(error);
    });
});
