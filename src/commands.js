require("dotenv").config();
const { REST, Routes } = require("discord.js");

const commands = [
  {
    cooldown: 30,
    name: "struktura",
    description: "Aktualizuje strukturu",
  },
];

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log("Registrujem commads");

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );
  } catch (error) {
    console.log(error);
  }
})();
