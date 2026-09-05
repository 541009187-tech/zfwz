#!/usr/bin/env node
/**
 * 提交前钩子：执行代码检查。
 */
import { execSync } from 'node:child_process';
import process from 'node:process';

try {
  execSync('node scripts/lint.js', { stdio: 'inherit', shell: true });
  console.log('[precommit] 检查通过');
} catch (error) {
  console.error('[precommit] 检查未通过，提交已阻止');
  process.exit(1);
}
