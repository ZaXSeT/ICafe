const fs = require('fs');
const files = [
    'mobile-app/src/screens/LoginScreen.tsx',
    'mobile-app/src/screens/HomeScreen.tsx',
    'mobile-app/src/lib/firebase.ts',
    'src/app/app/(protected)/menu/page.tsx',
    'src/app/app/(protected)/cart/page.tsx',
    'src/app/app/(protected)/reservations/page.tsx',
    'src/components/providers/AuthContext.tsx',
    'src/components/providers/CartContext.tsx',
];
files.forEach(f => {
    try {
        const content = fs.readFileSync(f, 'utf8');
        fs.writeFileSync('__r_' + f.replace(/[\/\\:]/g, '_') + '.txt', content);
    } catch (e) {
        fs.writeFileSync('__r_' + f.replace(/[\/\\:]/g, '_') + '.txt', 'ERROR:' + e.message);
    }
});
console.log('done');
