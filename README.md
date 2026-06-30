# Gator — RSS Feed Aggregator CLI

A command-line RSS feed aggregator. Add feeds, follow them, and let the aggregator continuously fetch new posts in the background while you browse the latest from another terminal.

---

## Prerequisites

- [Node.js](https://nodejs.org) v18 or later
- A running [PostgreSQL](https://www.postgresql.org) instance

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure the database connection

Create a `.env` file in the project root:

```env
CONNECTION=postgres://username:password@localhost:5432/gator
```

### 3. Run database migrations

```bash
npx drizzle-kit migrate
```

### 4. Create a config file

The program stores the active user in `~/.gatorconfig.json`. It is created automatically the first time you run `register` or `login`. You do not need to create it by hand.

---

## Running the CLI

```bash
npm start -- <command> [args]
```

---

## Commands

### User management

| Command | Description |
|---|---|
| `register <username>` | Create a new user and log in as them |
| `login <username>` | Switch to an existing user |
| `users` | List all users (current user marked) |
| `reset` | Delete all data from the database |

### Feed management

| Command | Description |
|---|---|
| `addfeed <name> <url>` | Add a new feed and automatically follow it |
| `feeds` | List all feeds in the database |
| `follow <url>` | Follow an existing feed |
| `following` | List feeds you are currently following |
| `unfollow <url>` | Unfollow a feed |

### Aggregation

| Command | Description |
|---|---|
| `agg <interval>` | Start the feed aggregator loop (e.g. `1m`, `30s`, `1h`) |
| `browse [limit]` | Print the latest posts from your followed feeds (default: 2) |

---

## Typical workflow

```bash
# Create an account
npm start -- register alice

# Add some feeds (automatically followed)
npm start -- addfeed "Hacker News" https://news.ycombinator.com/rss
npm start -- addfeed "TechCrunch"  https://techcrunch.com/feed/
npm start -- addfeed "Boot.dev"    https://www.boot.dev/blog

# Start the aggregator in one terminal (fetches every 30 seconds)
npm start -- agg 30s

# In a second terminal, browse the latest posts
npm start -- browse 10
```

Press `Ctrl+C` to stop the aggregator gracefully.

---

## RSS feeds to get started

- **Hacker News** — `https://news.ycombinator.com/rss`
- **TechCrunch** — `https://techcrunch.com/feed/`
- **Boot.dev Blog** — `https://www.boot.dev/blog`
