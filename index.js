const discord = require('discord.js');
const client = new discord.Client();

// specify tokens here
const token = '';
let alive_channel_id = '';
let dead_channel_id = '';
let bot_channel_id = '';

let connection_alive = undefined;
let connection_dead = undefined;
let alive_streams = {};

client.user.setUsername('SuperBot')

// when bot finished signing in, it joins the two channels
client.once('ready', () => {
    // connect to bot channel
    const channel_bot = client.channels.cache.get(bot_channel_id);
    await channel_bot.join();
});

async function join_amongus_channels(){
    // get channel objects from ids
    const channel_alive = client.channels.cache.get(alive_channel_id);
    const channel_dead = client.channels.cache.get(dead_channel_id);

    // don't connect if these are not voice channels
    if (channel_alive.type !== 'voice' || channel_dead.type !== "voice") return; 

    // joins channels
    connection_alive = await channel_alive.join();
    connection_dead = await channel_dead.join();
}

async function leave_amongus_channels(){
    if (connection_alive !== undefined){
        connection_alive.disconnect();
    }
    if (connection_dead !== undefined){
        connection_dead.disconnect();
    }
}

client.on('message', async message => {
    if (message.content === "superbot start"){
        join_amongus_channels();
    } else if (message.content === "superbot stop"){
        leave_amongus_channels();
    }
});

client.once('voiceStateUpdate', (oldState, newState) => {
    if (oldState.member.user.bot) return; // do nothing if it's the bot
    if (oldState.channelID === newState.channelID) return; // do nothing if the event isn't about joining or leaving a channel

    const user = newState.member.user;
    if (newState.channelID = alive_channel_id){
        // if someone joins the ALIVE voice channel, we listen to them
        if (connection_alive !== undefined && connection_dead !== undefined){
            const audio = connection_alive.receiver.createStream(user, {mode: 'opius', end: 'manual'});
            
            // remove audio stream when finished
            audio.on('end', message => {alive_streams[user.id] = undefined;});

            // repeat voice content on other channel when voice available
            audio.on('readable', () => {
                connection_dead.play(this.read(), {type: 'opus'});
            });

            // store stream to be able to access it later when the user leaves the channel
            alive_streams[user.id] = audio;
        }
    }
    else if (newState.channelID === dead_channel_id && oldState.channelID == alive_channel_id){
        // if someone joins the DEAD voice channel from the ALIVE voice channel, then we end the audio stream, discord will just take over
        const audio = alive_streams[user.id];
        audio.end('User ${user.username} left the channel of the dead.')
    }
});

client.login(token);