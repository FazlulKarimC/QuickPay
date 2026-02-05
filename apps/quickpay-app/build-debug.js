const { execSync } = require('child_process');
const fs = require('fs');

try {
    const output = execSync('npx next build', {
        encoding: 'utf8',
        stdio: 'pipe',
        maxBuffer: 10 * 1024 * 1024
    });
    console.log(output);
    fs.writeFileSync('build-success.log', output);
} catch (error) {
    const fullOutput = error.stdout + '\n' + error.stderr;
    console.error('Build failed:');
    console.error(fullOutput);
    fs.writeFileSync('build-error.log', fullOutput);
    process.exit(1);
}
