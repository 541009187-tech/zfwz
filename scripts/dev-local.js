#!/usr/bin/env node
/**
 * 本地开发启动脚本：同时启动 NestJS 服务端(3000) 与 Vite 前端(8080)。
 */
import { spawn } from 'node:child_process';
import process from 'node:process';

const isWin = process.platform === 'win32';

function run(name, cmd, args, opts = {}) {
  const child = spawn(cmd, args, {
    stdio: 'inherit',
    shell: isWin,
    env: { ...process.env, ...opts.env },
  });
  child.on('exit', (code) => {
    console.log(`[${name}] 进程退出 code=${code}`);
  });
  return child;
}

const server = run('server', 'npx', ['nest', 'start', '--watch'], { env: { SERVER_PORT: '3000' } });
const client = run('client', 'npx', ['vite', '--host', '0.0.0.0', '--port', '8080']);

function shutdown() {
  server.kill('SIGTERM');
  client.kill('SIGTERM');
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
