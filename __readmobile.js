const fs = require('fs');
const files = [
    'docs/DEVELOPMENT_PROGRESS.md',
    'mobile-app/package.json',
    'mobile-app/src/app/_layout.tsx',
    'mobile-app/src/app/index.tsx',
    'mobile-app/src/lib/firebase.ts',
    'mobile-app/src/screens/LoginScreen.tsx',
    'mobile-app/src/screens/HomeScreen.tsx',
    'mobile-app/src/constants/theme.ts',
    'mobile-app/src/components/app-tabs.tsx',
    'mobile-app/src/app/explore.tsx',
];
files.forEach(f => {
    if (fs.existsSync(f)) {
        const c = fs.readFileSync(f, 'utf8');
        process.stdout.write('===FILE:' + f + '===\n');
        process.stdout.write(c.substring(0, 3000));
        process.stdout.write('\n=END=\n');
    } else {
        process.stdout.write('MISSING:' + f + '\n');
    }
});
