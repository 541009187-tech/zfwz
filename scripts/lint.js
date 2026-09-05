#!/usr/bin/env node
/**
 * 代码检查脚本：依次执行 ESLint、TypeScript 类型检查、Stylelint。
 */
import { execSync } from 'node:child_process';
import process from 'node:process';

const steps = [
  { name: 'ESLint', cmd: 'eslint . --cache' },
  { name: 'TypeScript 类型检查', cmd: 'tsc --noEmit -p tsconfig.app.json' },
  { name: 'Stylelint', cmd: 'stylelint "**/*.css" --cache' },
];

for (const step of steps) {
  console.log(`[lint] 开始：${step.name}`);
  try {
    execSync(step.cmd, { stdio: 'inherit', shell: true });
    console.log(`[lint] 通过：${step.name}`);
  } catch (error) {
    console.error(`[lint] 失败：${step.name}`);
    process.exit(1);
  }
}

console.log('[lint] 全部检查通过');
