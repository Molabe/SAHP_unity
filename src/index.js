require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Client, IntentsBitField, Events, EmbedBuilder } = require("discord.js");

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

const dataFilePath = path.join(__dirname, "data.json");

// Funkcia na čítanie ID správy zo súboru JSON
const getMessageID = () => {
  if (fs.existsSync(dataFilePath)) {
    const data = fs.readFileSync(dataFilePath, "utf-8");
    return JSON.parse(data).messageID;
  }
  return null;
};

// Funkcia na uloženie ID správy do súboru JSON
const saveMessageID = (messageID) => {
  const data = { messageID: messageID };
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), "utf-8");
};

// zmeniť ID -> rank: "role ID"
// ID rolí pre každú úroveň
const roles = {
  commissioner: "980130510854578216",
  deputyCommissioner: "980130513459228763",
  assistantCommissioner: "980130515325698128",
  chief: "980130517187977256",
  assistantChief: "980130519977189377",
  captain: "980130522334367804",
  lieutenant: "992757347732688937",
  sergeant: "994958733740355595",
};

client.once(Events.ClientReady, async (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const guild = interaction.guild;
  await guild.members.fetch(); // Vyzve všetkých členov

  const struktura_embed = new EmbedBuilder()
    .setColor(0xb38600)
    .setTitle("San Andreas Highway Patrol Structure")
    .setURL("https://sahp.cz/pages/contact")
    .setThumbnail(
      "https://media.discordapp.net/attachments/980130647857311864/1260617260100223068/large.AltSAHPLogo.png.986027752dc921de2d0c2ed685e74dce.png.7d5b04513011266066a8b5b71136c468.png.4de5ecc373eedf20fcd57583525c7e3d.png?ex=668ff8cf&is=668ea74f&hm=4feb64308b4059ca064ff033a0590712f1e15fe2d8dba6a0d7862e89e461edff&=&format=webp&quality=lossless&width=604&height=575"
    );

  const rankFields = {
    commissioner:
      "Commissioner of Highway Patrol <:comm2:919978586562240546>\n",
    deputyCommissioner:
      "Deputy Commissioner of Highway Patrol <:deptcom:919978630292070470>\n",
    assistantCommissioner:
      "Assistant Commissioner of Highway Patrol <:assiscomm:919978614886379541>\n",
    chief: "Chief of Highway Patrol <:chief:919978642015133716>\n",
    assistantChief:
      "Assistant Chief of Highway Patrol <:assischief:919978655126544395>\n",
    captain: "Captain <:capt:919978765692592149>\n",
    lieutenant: "Lieutenant <:ltn:919978694221635634>\n",
    sergeant: "Sergeant <:sgt:919978706297028640>\n",
  };

  // Získa členov a aktualizuje rankFields prezývkami alebo menami
  guild.members.cache.forEach((member) => {
    Object.keys(roles).forEach((rank) => {
      if (member.roles.cache.has(roles[rank])) {
        rankFields[rank] += `${member.nickname || member.user.username}\n`;
      }
    });
  });

  // Pridá aktualizované polia do vloženia
  struktura_embed.addFields(
    {
      name: "=== COMMISSIONER OF HIGHWAY PATROL ===",
      value: rankFields.commissioner,
      inline: false,
    },
    {
      name: "=== EXECUTIVE STAFF ===",
      value:
        rankFields.deputyCommissioner + "\n" + rankFields.assistantCommissioner,
      inline: false,
    },
    {
      name: "=== COMMAND STAFF ===",
      value:
        rankFields.chief +
        "\n" +
        rankFields.assistantChief +
        "\n" +
        rankFields.captain +
        "\n" +
        rankFields.lieutenant,
      inline: false,
    },
    {
      name: "=== WATCH COMMAND ===",
      value: rankFields.sergeant,
      inline: false,
    },
    {
      name: "=== Príslušníci z radov TROOPER ===",
      value: "Senior Lead Trooper\nSenior Trooper\nTrooper\nJunior Trooper",
      inline: false,
    },
    {
      name: "=== Príslušníci z radov TRAINEE ===",
      value: "Trainee",
      inline: false,
    }
  );

  if (interaction.commandName === "struktura") {
    const member = interaction.member;
    const allowedChannelId = "919977967503962154";

    // Skontroluje, či sa príkaz používa v povolenom kanáli
    if (interaction.channelId !== allowedChannelId) {
      interaction.reply({
        content: "Tento príkaz môžeš použiť iba v určitom kanáli.",
        ephemeral: true,
      });
      return;
    }

    // zmeniť ID na Administratora -> .has("ID")
    if (member.roles.cache.has("980130505414570074")) {
      await interaction.deferReply();

      const storedMessageID = getMessageID();
      let message;

      if (storedMessageID) {
        try {
          message = await interaction.channel.messages.fetch(storedMessageID);
        } catch (error) {
          console.log(error);
        }
      }

      if (message && message.embeds && message.embeds.length > 0) {
        console.log("Embed already exists, updating it");
        message
          .edit({ embeds: [struktura_embed] })
          .then(() => {
            console.log("Embed updated");
            interaction.editReply({
              content: "Embed updated",
            });
            // Odstráni správu po 2,5 sekundách
            setTimeout(() => {
              interaction.deleteReply().catch(console.error);
            }, 2500);
          })
          .catch(console.error);
      } else {
        interaction
          .editReply({ embeds: [struktura_embed] })
          .then((newMessage) => {
            console.log("New embed created");
            saveMessageID(newMessage.id);
          })
          .catch(console.error);
      }
    } else {
      interaction.reply({
        content: "Nemáš právo na použitie príkazu",
        ephemeral: true,
      });
    }
  }
});

client.login(process.env.TOKEN);
