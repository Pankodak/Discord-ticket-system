const { Client, RichEmbed } = require("discord.js");
const client = new Client();
const config = require("./config.json");
let c;

client.on("ready", () => {
    client.user.setActivity("Potrzebujesz pomocy? Napisz do mnie!", {
        type: "WATCHING",
    });
    setInterval(() => {
        client.user.setActivity("Potrzebujesz pomocy? Napisz do mnie!", {
            type: "WATCHING",
        });
    }, 3600 * 1000);
});

client.on("guildCreate", () => {
    client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

const SendMessageTicket = (message) => {
    const server = client.guilds.get(config.serverID);
    c = server.channels.find("name", "ticket-" + message.author.id);
    const Attachment = message.attachments.array();
    const pp = Attachment[0] !== undefined ? Attachment[0].url : "";

    const embed = new RichEmbed()
        .setColor(0xcf40fa)
        .addField(
            `Nowa wiadomość od ${message.author.username}#${message.author.discriminator}`,
            message.content + " " + pp
        )
        .setTimestamp();
    c.send({
        embed: embed,
    });
};
client.on("message", async (message) => {
    const server = client.guilds.get(config.serverID);
    if (message.author.bot) return;
    const args = message.content
        .slice(config.prefix.length)
        .trim()
        .split(/ +/g);
    const command = args.shift().toLowerCase();
    if (message.channel.type !== "dm") {
        if (message.channel.name.indexOf("ticket") > -1 && command != "close") {
            const ret = message.channel.name.replace("ticket-", "");

            let pq = client.users.get(ret);
            let embed = new RichEmbed()
                .setColor(0xcf40fa)
                .addField(
                    `Nowa wiadomość od ${message.author.username}#${message.author.discriminator}`,
                    message.content
                )
                .setTimestamp();
            pq.send({
                embed: embed,
            });
        } else {
            if (
                command == "close" &&
                message.channel.name.indexOf("ticket") > -1
            ) {
                let ret = message.channel.name.replace("ticket-", "");
                let pq = client.users.get(ret);
                const embed = new RichEmbed()
                    .setColor(0xcf40fa)
                    .addField(
                        `Nowa wiadomość`,
                        "Twój ticket został zamknięty przez " +
                            "**" +
                            message.author.username +
                            "#" +
                            message.author.discriminator +
                            "**"
                    )
                    .setTimestamp();
                pq.send({
                    embed: embed,
                });

                message.channel.delete();
            }
        }
    }
    if (message.channel.type === "dm") {
        if (server.channels.exists("name", "ticket-" + message.author.id))
            return SendMessageTicket(message);
        server
            .createChannel(`ticket-${message.author.id}`, "text")
            .then((c) => {
                for (i = 0; i < config.ModeratorRoles.length; i++) {
                    let role1 = client.guilds
                        .get(config.serverID)
                        .roles.find("name", config.ModeratorRoles[i]);
                    c.overwritePermissions(role1, {
                        SEND_MESSAGES: true,
                        READ_MESSAGES: true,
                    });
                }
                let role2 = client.guilds
                    .get(config.serverID)
                    .roles.find("name", "@everyone");
                c.overwritePermissions(role2, {
                    SEND_MESSAGES: false,
                    READ_MESSAGES: false,
                });
                message.channel.send(
                    `:white_check_mark: Twoja wiadomość została wysłana do administracji`
                );
                const embed = new RichEmbed()
                    .setColor(0xcf40fa)
                    .addField(
                        `Nowy wiadomość od ${message.author.username}#${message.author.discriminator}`,
                        message.content
                    )
                    .setTimestamp();
                c.send({
                    embed: embed,
                });
            })
            .catch(console.error);
    }
});

client.on("message", async (message) => {
    if (message.author.bot) return;

    if (message.content.indexOf(config.prefix) !== 0) return;

    const args = message.content
        .slice(config.prefix.length)
        .trim()
        .split(/ +/g);
    const command = args.shift().toLowerCase();

    if (command === "ping") {
        const m = await message.channel.send("Ping?");
        m.edit(
            `Pong! Latency is ${
                m.createdTimestamp - message.createdTimestamp
            }ms. API Latency is ${Math.round(client.ping)}ms`
        );
    }
    if (command === "say") {
        if (!message.member.hasPermission("MANAGE_MESSAGES"))
            return message.reply(
                "Niestety, nie masz uprawnień do korzystania z tego!"
            );
        const sayMessage = args.join(" ");
        message.delete().catch((O_o) => {});
        message.channel.send(sayMessage);
    }

    if (command === "kick") {
        if (!message.member.hasPermission("KICK_MEMBERS"))
            return message.reply(
                "Niestety, nie masz uprawnień do korzystania z tego!"
            );

        let member =
            message.mentions.members.first() ||
            message.guild.members.get(args[0]);
        if (!member)
            return message.reply("Proszę, wybierz użytkownika do wyrzucenia");
        if (!member.kickable)
            return message.reply(
                "Nie mogę wyrzucić tego użytkownika! Czy man on większą rolę ode mnie? Czy mam uprawnienia do wyrzucania użytkowników?"
            );

        let reason = args.slice(1).join(" ");
        if (!reason) reason = "Nie podano przyczyny";

        await member
            .kick(reason)
            .catch((error) =>
                message.reply(
                    `Sorry ${message.author} I couldn't kick because of : ${error}`
                )
            );
        message.reply(
            `${member.user.tag} został wyrzucony przez ${message.author.tag} ponieważ: ${reason}`
        );
    }
    if (command === "ban") {
        if (!message.member.hasPermission("BAN_MEMBERS"))
            return message.reply(
                "Niestety, nie masz uprawnień do korzystania z tego!"
            );

        let member = message.mentions.members.first();
        if (!member)
            return message.reply("Proszę, wybierz użytkownika do zablokowania");
        if (!member.bannable)
            return message.reply(
                "Nie mogę zablokować tego użytkownika! Czy on ma większą rolę ode mnie? Czy mam uprawnienia do blokowania?"
            );

        let reason = args.slice(1).join(" ");
        if (!reason) reason = "Nie podano przyczyny";

        await member
            .ban(reason)
            .catch((error) =>
                message.reply(
                    `Sorry ${message.author} I couldn't ban because of : ${error}`
                )
            );
        message.reply(
            `${member.user.tag} został zablokowany przez ${message.author.tag} ponieważ: ${reason}`
        );
    }

    if (command === "purge") {
        if (!message.member.hasPermission("MANAGE_MESSAGES"))
            return errors.noPerms(message, "MANAGE_MESSAGES");

        if (!args[0])
            return message.channel.send("Nie masz dostępu do tej komendy");

        message.channel.bulkDelete(args[0]).then(() => {
            message.channel
                .send(`🔎Wyczyszczono ${args[0]} wiadomości🔎.`)
                .then((msg) => msg.delete(5000));
        });
    }
});

client.login(config.token);
