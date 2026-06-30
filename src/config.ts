import fs from "fs";
import os from 'os';
import path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

export type Config = {
    dbUrl: string;
    currentUserName: string;
}


export async function setUser(name: string) {
    const content: Config = { dbUrl: `${process.env.CONNECTION}?sslmode=disable` || "", currentUserName: name };
    const data = JSON.stringify(content, null, 2);
    await fs.promises.writeFile(getConfigPath(), data, 'utf-8');
}

export async function readConfig(): Promise<Config> {
    const file = await fs.promises.readFile(getConfigPath(), 'utf-8');
    const conf: Config = JSON.parse(file);
    return conf;
}


function getConfigPath(): string {
    return path.join(os.homedir(), '.gatorconfig.json');
}
function validateConf(conf: Config): boolean {
    if (!conf.currentUserName || !conf.dbUrl)
        return false;
    return true;
}