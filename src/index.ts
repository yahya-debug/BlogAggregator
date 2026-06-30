import { CommandHandler } from "./commands.js";
import { Config, readConfig, setUser } from "./config.js"; 


async function main() {
	const input = process.argv;
	if (input.length < 3)
		process.exit(1);
	const handler = new CommandHandler(input[2], ...input.slice(3));
	await handler.execute();

	process.exit(0);
}

main();