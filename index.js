const WebRcon = require('webrconjs');
const { Client,WebhookClient,EmbedBuilder , GatewayIntentBits, SlashCommandBuilder, Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { joinVoiceChannel } = require('@discordjs/voice');
const config = require('./config.json');
const webhookClient = new WebhookClient({ url: config.webhookUrl });

config.Servers.forEach((server, index) => {
    server.name = `${server.IP}:${server.Port}/${index}`;
    server.rcon = new WebRcon(server.IP, server.Port);
    server.connected = false;
    server.bot = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildMessageReactions
        ]
    });

    let waitingForMessage = false;
    let lastMessage = '';

    server.bot.login(server.DiscordToken);

    // Login to Discord
    server.bot.on('ready', () => {
        console.log('Logged in as', server.bot.user.tag);
        server.bot.user.setActivity('Server Connecting...');
        reconnect();
    });

    server.bot.on('error', error => {
        console.error('The websocket connection encountered an error:', error);
    });

    process.on('unhandledRejection', error => {
        console.error('Unhandled promise rejection:', error);
    });

    server.rcon.on('connect', function () {
        try {
            server.connected = true;
            console.log(server.name, 'CONNECTED');
            lastMessage = '';
            server.bot.user.setActivity('Server Connecting...');
        } catch (err) {
            console.error('Error on connect:', err);
        }

        function getData() {
            if (server.connected === true) {
                try {
                    server.rcon.run('serverinfo', 0);



                    setTimeout(getData, config.SetTimeout);
                } catch (err) {
                    console.error('Error on getData:', err);
                }
            }
        }
        
        getData();
    });

    server.rcon.on('message', function (msg) {
        const data = JSON.parse(msg.message);
        if (data.Players === undefined) {
            // console.log(data);
            const embed = new EmbedBuilder()
            .setDescription(`Userid: ${data.UserId}\n\n${data.Message}`)
            .setColor("#00ffaa")
            .setFooter({
                text: "coded by ArmanLeader",
                iconURL: "https://slate.dan.onl/slate.png",
            })
            .setTimestamp();

            webhookClient.send({
            embeds: [embed],
            }).catch(console.error);
            console.log(data);
        } else if (data.Queued > 0) {
            setMessage(`(${data.Players}/${data.MaxPlayers} (${data.Queued}) Queued!)`);
            waitingForMessage = true;
        } else if (data.Joining === 0) {
            setMessage(`(${data.Players}/${data.MaxPlayers} Online!)`);
            waitingForMessage = true;
        } else {
            setMessage(`(${data.Players}/${data.MaxPlayers} (${data.Joining}) Joining!)`);
            waitingForMessage = true;
        }
    });

    // Spam prevention to Discord API
    function setMessage(newMessage) {
        if (waitingForMessage === true && newMessage === lastMessage) {
            console.log('Discord Spam Prevention (Message is the same)');
        } else {
            server.bot.user.setActivity(newMessage);
            console.log(server.name, newMessage);
            lastMessage = newMessage;
            waitingForMessage = false;
        }
    }

    server.rcon.on('disconnect', function () {
        server.connected = false;
        server.bot.user.setActivity('Server Offline...');
        console.log(server.name, "Server Offline");
        if (server.connected === false) {
            try {
                console.log(server.name, "TRYING TO RECONNECT");
                setTimeout(reconnect, config.SetTimeout);
            } catch (err) {
                console.error('Error on reconnect:', err);
            }
        }
    });

    // Connect / Reconnect function
    function reconnect() {
        try {
            server.rcon.connect(server.RconPassword);
        } catch (err) {
            console.error('Error on reconnect:', err);
        }
    }
});

const { token, clientId, guildId } = config;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions
    ]
});

const commands = [
    new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kicks a member')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The member to kick')
                .setRequired(true)
        ),
    new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bans a member')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The member to ban')
                .setRequired(true)
        ),
        new SlashCommandBuilder()
        .setName('settime')
        .setDescription('Sets the game environment time')
        .addIntegerOption(option =>
            option.setName('time')
                .setDescription('The time to set for the game environment')
                .setRequired(true))
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands }
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});



client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'kick') {
        const target = interaction.options.getUser('target');
        const member = interaction.guild.members.cache.get(target.id);

        if (member) {
            await member.kick();
            await interaction.reply({ content: `Kicked ${target.tag}`, ephemeral: true });
            const logChannel = interaction.guild.channels.cache.find(channel => channel.name === 'log');
            if (logChannel) {
                logChannel.send(`Member kicked: ${target.tag}`);
            }
        } else {
            await interaction.reply({ content: 'Member not found', ephemeral: true });
        }
    } else if (commandName === 'ban') {
        const target = interaction.options.getUser('target');
        const member = interaction.guild.members.cache.get(target.id);

        if (member) {
            await member.ban();
            await interaction.reply({ content: `Banned ${target.tag}`, ephemeral: true });
            const logChannel = interaction.guild.channels.cache.find(channel => channel.name === 'log');
            if (logChannel) {
                logChannel.send(`Member banned: ${target.tag}`);
            }
        } else {
            await interaction.reply({ content: 'Member not found', ephemeral: true });
        }
    }
    else if (commandName === 'settime') {
        try {
            const server = config.Servers[0]; 
            const time = interaction.options.getInteger('time'); 


            await server.rcon.run(`env.time ${time}`);

            await interaction.reply(`Environment time set to ${time}.`);
        } catch (error) {
            console.error(error);
            await interaction.reply('There was an error executing the command.');
        }
    }
});

client.on('guildMemberAdd', member => {
    const logChannel = member.guild.channels.cache.find(channel => channel.name === 'log');
    if (logChannel) {
        logChannel.send(`Member joined: ${member.user.tag}`);
    }
});

client.on('guildMemberRemove', member => {
    const logChannel = member.guild.channels.cache.find(channel => channel.name === 'log');
    if (logChannel) {
        logChannel.send(`Member left: ${member.user.tag}`);
    }
});

client.login(token);