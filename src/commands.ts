import { readConfig, setUser } from "./config.js";
import { scrapeFeeds } from "./feed.js";

function formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    const totalSecs = Math.floor(ms / 1000);
    const secs = totalSecs % 60;
    const totalMins = Math.floor(totalSecs / 60);
    const mins = totalMins % 60;
    const hours = Math.floor(totalMins / 60);
    if (hours > 0) return `${hours}h${mins}m${secs}s`;
    if (mins > 0) return `${mins}m${secs}s`;
    return `${secs}s`;
}
import { createFeedFollow, getFeedFollowForUser, removeFeedFollow } from "./Schema/feed_follow.js";
import { createFeed, Feed, getFeed, getFeeds, printFeed } from "./Schema/feeds.js";
import { createUser, deleteAll, getUser, getUsers, User } from "./Schema/user.js";

export class CommandHandler {
    cmdName: string;
    args: string[];
    user: User | null = null; // resolved once per command in execute()

    [key: string]: any;
    constructor(cmdName: string, ...args: string[]) {
        this.cmdName = cmdName;
        this.args = args;
    }

    async loadUser(): Promise<void> {
        try {
            const config = await readConfig();
            if (config.currentUserName)
                this.user = await getUser(config.currentUserName) ?? null;
        } catch {
            // no config yet — fresh install
            this.user = null;
        }
    }

    // commands that require a logged-in user
    private static readonly PROTECTED = new Set(['addfeed', 'follow', 'following', 'unfollow']);

    requireUser(): User {
        if (!this.user)
            throw new Error("No user logged in. Use `login` or `register` first.");
        return this.user;
    }

    async login() {
        if (this.args.length < 1)
            throw new Error("login command takes one argument: login <username>");

        const user = await getUser(this.args[0]);
        if (user == undefined)
            throw new Error(`User "${this.args[0]}" not found`);

        await setUser(this.args[0]);
        this.user = user;
        console.log(`User has been set to ${this.args[0]}`);
    }

    async register() {
        if (this.args.length < 1)
            throw new Error("register command takes one argument: register <username>");

        const existing = await getUser(this.args[0]);
        if (existing != undefined)
            throw new Error(`User with name "${this.args[0]}" already exists`);

        const created = await createUser(this.args[0]);
        await setUser(this.args[0]);
        this.user = created;

        console.log(`${this.args[0]} created successfully`);
        console.log(created);
    }

    async reset() {
        const check = await deleteAll();
        if (check.length > 0)
            console.log("Reset successfully");
        else
            throw new Error("Problem in resetting");
    }

    async users() {
        const data = await getUsers();
        for (const u of data)
            console.log(`* ${u.name}${this.user?.name === u.name ? " (current)" : ""}`);
    }

    async agg() {
        if (this.args.length < 1)
            throw new Error("agg command takes one argument: agg <time_between_reqs>");

        const durationStr = this.args[0];
        const regex = /^(\d+)(ms|s|m|h)$/;
        const match = durationStr.match(regex);

        if (!match)
            throw new Error(`Invalid duration "${durationStr}". Use formats like 1s, 30s, 1m, 1h, 500ms`);

        const value = parseInt(match[1], 10);
        const unitToMs: Record<string, number> = { ms: 1, s: 1000, m: 60_000, h: 3_600_000 };
        const timeBetweenRequests = value * unitToMs[match[2]];

        console.log(`Collecting feeds every ${formatDuration(timeBetweenRequests)}`);

        const handleError = (e: Error) => console.log(e.message);

        scrapeFeeds().catch(handleError);

        const interval = setInterval(() => {
            scrapeFeeds().catch(handleError);
        }, timeBetweenRequests);

        // block until Ctrl+C
        await new Promise<void>((resolve) => {
            process.on("SIGINT", () => {
                console.log("Shutting down feed aggregator...");
                clearInterval(interval);
                resolve();
            });
        });
    }

    async addfeed() {
        if (this.args.length < 2)
            throw new Error("addfeed command takes two arguments: addfeed <feed name> <feed url>");

        const [feedName, feedUrl] = this.args;
        const added = await createFeed(feedName, feedUrl, this.user!.id);
        // drop feedName so follow() sees only the url
        this.args = this.args.slice(1);
        await this.follow();
        console.log(`User: ${this.user?.name}\nadded the feed: ${feedName}`);
    }

    async feeds() {
        const data = await getFeeds();
        for (const obj of data)
            printFeed(obj);
    }

    async follow() {
        if (this.args.length < 1)
            throw new Error("follow command takes one argument: follow <feed url>");

        const feed: Feed = await getFeed(this.args[0]);
        console.log(feed);
        if (!feed)
            throw new Error("Not a feed");
        const added = await createFeedFollow(this.user?.id as string, feed.id);
        console.log(added);
    }

    async following() {
        const response = await getFeedFollowForUser(this.user!.id);

        for (const feed_follow of response)
            console.log(feed_follow);
    }

    async unfollow() {
        const response = await removeFeedFollow(this.user?.id as string, this.args[0]);
    }

    async execute() {
        try {
            await this.loadUser();

            // guard protected commands
            if (CommandHandler.PROTECTED.has(this.cmdName))
                this.requireUser();

            if (typeof this[this.cmdName] === 'function')
                await this[this.cmdName]();
            else
                console.error(`Command "${this.cmdName}" not found.`);
        } catch (e) {
            console.log((e as Error).message);
            process.exit(1);
        }
    }
}
