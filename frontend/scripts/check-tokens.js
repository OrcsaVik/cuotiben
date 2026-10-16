const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const TOKEN_SHEET = path.join('styles', 'tokens.wxss');
const COMPONENT_DIRS = ['components', 'custom-tab-bar'];

function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'scripts') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const files = walk(ROOT, []);
const read = (f) => fs.readFileSync(f, 'utf8');
const rel = (f) => path.relative(ROOT, f);
const problems = [];

const wxss = files.filter((f) => f.endsWith('.wxss'));

const declared = new Set();
const used = new Map();
for (const f of wxss) {
  const src = read(f);
  for (const m of src.matchAll(/(--[a-zA-Z0-9-]+)\s*:/g)) declared.add(m[1]);
  for (const m of src.matchAll(/var\((--[a-zA-Z0-9-]+)/g)) {
    if (!used.has(m[1])) used.set(m[1], new Set());
    used.get(m[1]).add(rel(f));
  }
}

for (const token of used.keys()) {
  if (!declared.has(token)) {
    problems.push(`未定义令牌 var(${token}) 用于 ${[...used.get(token)].join(', ')}`);
  }
}

for (const f of wxss) {
  if (rel(f) === TOKEN_SHEET) continue;
  const noComment = read(f).replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
  const lines = noComment.split(/\r?\n/);
  lines.forEach((line, i) => {
    const hit = line.match(/#[0-9a-fA-F]{3,8}\b|\d+(?:rpx|px)\b/);
    if (hit) problems.push(`${rel(f)}:${i + 1} 硬编码字面量 ${hit[0]} —— 只允许出现在 ${TOKEN_SHEET}`);
  });
}

for (const f of files.filter((x) => /\.(wxss|json)$/.test(x))) {
  const src = read(f);
  if (src.includes('@media (prefers-color-scheme') || src.includes('prefers-color-scheme')) {
    problems.push(`${rel(f)} 含 prefers-color-scheme —— ADR-0005 禁止，主题只走显式 class`);
  }
  if (src.includes('wxa-auto-dark')) {
    problems.push(`${rel(f)} 引用了工具生成的 auto-dark 样式 —— 必须删除，见 ADR-0005`);
  }
  if (f.endsWith('.json') && /"darkmode"\s*:/.test(src)) {
    problems.push(`${rel(f)} 含 "darkmode" 键 —— 官方深色模式与手动切换开关互斥`);
  }
}

const importsOf = (src) =>
  [...src.matchAll(/@import\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);

function componentSheets() {
  const out = new Set();
  const visit = (file) => {
    if (out.has(file)) return;
    out.add(file);
    const dir = path.dirname(file);
    for (const spec of importsOf(read(file))) {
      const target = path.resolve(dir, spec);
      if (fs.existsSync(target)) visit(target);
      else problems.push(`${rel(file)} @import '${spec}' 指向不存在的文件`);
    }
  };
  for (const dir of COMPONENT_DIRS) {
    const abs = path.join(ROOT, dir);
    if (!fs.existsSync(abs)) continue;
    walk(abs, []).filter((f) => f.endsWith('.wxss')).forEach(visit);
  }
  return out;
}

// 组件 wxss（含它 @import 进来的共享表）里出现标签/ID/属性选择器，
// 工具会报 Some selectors are not allowed in component wxss 并整条丢弃。
const CLASS_ONLY = /^\.[\w-]+(?:::?[a-zA-Z-]+(?:\([^)]*\))?)*$/;
for (const f of componentSheets()) {
  const body = read(f).replace(/\/\*[\s\S]*?\*\//g, '');
  for (const block of body.split('}')) {
    const brace = block.indexOf('{');
    if (brace < 0) continue;
    const head = block.slice(0, brace);
    if (head.trim().startsWith('@')) continue;
    for (const raw of head.split(',')) {
      const selector = raw.trim();
      if (!selector) continue;
      const bad = selector
        .replace(/\([^)]*\)/g, '()')
        .split(/[\s>+~]+/)
        .filter(Boolean)
        .filter((part) => !CLASS_ONLY.test(part));
      if (bad.length) {
        problems.push(`${rel(f)} 选择器「${selector}」含组件 wxss 不允许的部分：${bad.join(' ')} —— 只准用类选择器`);
      }
    }
  }
}

if (problems.length) {
  console.error(`令牌门禁未通过（${problems.length} 项）：`);
  for (const p of problems) console.error('  - ' + p);
  process.exit(1);
}

console.log(`令牌门禁通过：${wxss.length} 个 wxss，${declared.size} 个令牌定义，${used.size} 个被引用`);
