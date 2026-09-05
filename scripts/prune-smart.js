#!/usr/bin/env node
/**
 * 依赖清理脚本（可选）：删除 node_modules 中的无用缓存。
 */
import { execSync } from 'node:child_process';
import process from 'node:process';

try {
  execSync('npm cache clean --force', { stdio: 'inherit', shell: true });
  console.log('[prune] npm 缓存已清理');
} catch (error) {
  console.warn('[prune] 清理失败（可忽略）', error.message);
  process.exit(0);
}
