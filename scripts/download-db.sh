#!/bin/sh
# Downloads a snapshot of the production database to backups/. SQLite's
# .backup makes a complete copy even while the app is writing, which copying
# the file wouldn't.
set -e

name="bowling-game-$(date +%Y-%m-%d-%H%M%S).db"
mkdir -p backups

ssh server "sqlite3 bowling-game/database/bowling-game.db \".backup /tmp/$name\""
scp "server:/tmp/$name" "backups/$name"
ssh server "rm /tmp/$name"

echo "Saved backups/$name"
