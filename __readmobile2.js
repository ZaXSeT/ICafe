const fs = require('fs');
const path = require('path');

const base = 'mobile-app';
const files = [
    'src/app/_layout.tsx',
    'src/app/index.tsx',
    'src/app/login.tsx',
    'src/app/checkout.tsx',
    'src/app/explore.tsx',
    'src/app/(tabs)',
    'package.json',
    'app.json',
    'src/screens/LoginScreen.tsx',
    'src/screens/HomeScreen.tsx',
];

function readOrList(rel) {
    const full = path.join(base, rel);
    try {
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
            const entries = fs.readdirSync(full);
            return `[DIR] ${full}\n  ${entries.join('\n  ')}`;
        } else {
            return `[FILE] ${full}\n${fs.readFileSync(full, 'utf8')}`;
        }
    } catch (e) {
        return `[ERROR] ${full}: ${e.message}`;
    }
}

const out = files.map(readOrList).join('\n\n==========\n\n');
fs.writeFileSync('__mobile_read_out.txt', out, 'utf8');
console.log('Written to __mobile_read_out.txt');
console.log('--- CONTENT PREVIEW ---');
console.log(out.substring(0, 5000));
