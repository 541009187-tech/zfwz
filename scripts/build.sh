#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(pwd)"
DIST_DIR="$ROOT_DIR/dist"

echo "📝 [1/4] 清理 dist 目录"
rm -rf "$ROOT_DIR/dist"

echo "🔨 [2/4] 并行构建 server 和 client"
BUILD_NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=8192}"

echo "   ├─ 启动 server 构建..."
NODE_OPTIONS="$BUILD_NODE_OPTIONS" npm run build:server > /tmp/build-server.log 2>&1 &
SERVER_PID=$!

echo "   ├─ 启动 client 构建..."
NODE_OPTIONS="$BUILD_NODE_OPTIONS" npm run build:client > /tmp/build-client.log 2>&1 &
CLIENT_PID=$!

SERVER_EXIT=0
CLIENT_EXIT=0

wait $SERVER_PID || SERVER_EXIT=$?
wait $CLIENT_PID || CLIENT_EXIT=$?

if [ $SERVER_EXIT -ne 0 ]; then
  echo "   ❌ Server 构建失败"
  cat /tmp/build-server.log
  exit 1
fi

if [ $CLIENT_EXIT -ne 0 ]; then
  echo "   ❌ Client 构建失败"
  cat /tmp/build-client.log
  exit 1
fi

echo "   ✅ Server 构建完成"
echo "   ✅ Client 构建完成"

echo "📦 [3/4] 准备产物"
if [ -d "$DIST_DIR/client" ]; then
  mkdir -p "$DIST_DIR/dist/client"
  if [ -d "$ROOT_DIR/client/public" ]; then
    cp -R "$ROOT_DIR/client/public/." "$DIST_DIR/dist/client/"
  fi
  find "$DIST_DIR/client" -maxdepth 1 -name "*.html" -exec mv {} "$DIST_DIR/dist/client/" \;
fi

cp "$ROOT_DIR/scripts/run.sh" "$DIST_DIR/"
if [ -f "$ROOT_DIR/.env" ]; then
  cp "$ROOT_DIR/.env" "$DIST_DIR/"
fi

rm -rf "$DIST_DIR/scripts"

echo "✅ [4/4] 构建完成"
DIST_SIZE=$(du -sh "$DIST_DIR" | cut -f1)
echo "📊 产物大小: $DIST_SIZE"
