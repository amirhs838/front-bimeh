#!/bin/bash
# Start the dev server, wait for it, run the given command, then stop it.
# (The sandbox reaps background processes between tool invocations, so the
# server and its workload must live inside ONE invocation.)
cd /home/z/my-project
# Kill any previous server reliably — a surviving next-server keeps port 3000
# and serves a STALE in-memory module graph (root cause of the frozen
# calibration rounds; the new `next dev` dies with EADDRINUSE unseen).
pkill -f "next-server" 2>/dev/null
pkill -f "next dev" 2>/dev/null
pkill -f "bun run dev" 2>/dev/null
for i in $(seq 1 20); do
  curl -s -o /dev/null --max-time 1 http://localhost:3000/ 2>/dev/null || break
  sleep 0.5
done
# Turbopack dev sometimes serves stale module/CSS chunks after edits —
# start from a clean dev cache every time (documented in the S2 worklog).
rm -rf .next/dev
bun run dev > /tmp/dev-run.log 2>&1 &
SPID=$!
code=000
for i in $(seq 1 90); do
  code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ 2>/dev/null)
  [ "$code" = "200" ] && break
  sleep 1
done
echo "server ready (code=$code) after ~${i}s (pid $SPID)"
"$@"
RC=$?
kill $SPID 2>/dev/null
pkill -f "next-server" 2>/dev/null
pkill -f "next dev" 2>/dev/null
pkill -f "bun run dev" 2>/dev/null
sleep 1
exit $RC
