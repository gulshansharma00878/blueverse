#!/bin/bash
if [ -e $1 ]; then
  exit 1
fi

OUTPUT=$(pm2 pid blueverse_$1)
CHECK="NO"

if [ -n "$OUTPUT" ]; then
  CHECK="YES"
else
  CHECK="NO"
fi

COMMAND=""

# Run build commands
# npm run clean
NODE_OPTIONS="--max-old-space-size=4096" npm install --legacy-peer-deps
npm run build:$1

# Decide PM2 script
if [ $CHECK == "NO" ]; then
  COMMAND="pm2 start npm --name blueverse_$1 -- run start:$1"
else
  COMMAND="pm2 reload blueverse_$1"
fi

$COMMAND
