# RustServerPlayerCountBot

A Discord bot for monitoring player counts on Rust game servers using RCON. This bot connects to your Rust server and provides real-time updates on player statistics directly in your Discord server.

## Installation Instructions

1. **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/RustServerPlayerCountBot.git
    cd RustServerPlayerCountBot
    ```

2. **Install dependencies:**
    Make sure you have [Node.js](https://nodejs.org/) installed, then run:
    ```bash
    npm install
    ```

3. **Configure the bot:**
    Create a `config.json` file in the root directory of the project with the following content:
    ```json
    {
      "token": "YOUR_DISCORD_BOT_TOKEN",
      "clientId": "YOUR_CLIENT_ID",
      "guildId": "YOUR_GUILD_ID",
      "SetTimeout": "5000",
      "Servers": [
        {
          "IP": "YOUR_SERVER_IP",
          "Port": YOUR_SERVER_PORT,
          "RconPassword": "YOUR_RCON_PASSWORD",
          "DiscordToken": "YOUR_DISCORD_TOKEN"
        }
      ],
      "webhookUrl": "YOUR_DISCORD_WEBHOOK_URL"
    }
    ```
    Replace the placeholder values with your actual Discord bot token, client ID, guild ID, Rust server IP, port, RCON password, Discord token, and webhook URL.

4. **Run the bot:**
    ```bash
    node bot.js
    ```

## Configuration File Description

The `config.json` file contains the necessary configuration for your Discord bot to connect to Rust servers and Discord. Here are the fields you need to fill out:

- `token`: Your Discord bot token.
- `clientId`: Your Discord application's client ID.
- `guildId`: The ID of the Discord guild (server) where the bot will operate.
- `SetTimeout`: The timeout setting for server checks (in milliseconds).
- `Servers`: An array of server objects that the bot will monitor.
  - `IP`: The IP address of the Rust server.
  - `Port`: The port number for the Rust server's RCON.
  - `RconPassword`: The RCON password for the Rust server.
  - `DiscordToken`: The Discord token for bot operations.
- `webhookUrl`: The URL for the Discord webhook.

By following these steps and configuring the `config.json` file properly, you can set up and run your RustServerPlayerCountBot to monitor Rust server player counts in your Discord server.
