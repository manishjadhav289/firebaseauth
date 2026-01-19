const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, 'jwt_data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'decrypted_token.txt');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR);
}

console.log('Listening for JWT Tokens from device...');
console.log(`Saving to: ${OUTPUT_FILE}`);

const logcat = spawn('adb', ['logcat', '-s', 'ReactNativeJS:V']);

let buffer = '';
let capturing = false;

logcat.stdout.on('data', (data) => {
    const lines = data.toString().split('\n');

    lines.forEach(line => {
        if (line.includes('@@@START_JWT@@@')) {
            capturing = true;
            buffer = '';
            console.log('Detected new token... capturing.');
            return;
        }

        if (line.includes('@@@END_JWT@@@')) {
            capturing = false;
            try {
                const jsonData = JSON.parse(buffer);
                saveTokenToFile(jsonData);
            } catch (e) {
                console.error('Failed to parse captured JSON:', e);
            }
            return;
        }

        if (capturing) {
            // Clean up logcat prefixes if any (e.g., "I/ReactNativeJS: ")
            // Simple regex to remove timestamp/tag content before the actual JSON
            const cleanLine = line.replace(/.*I ReactNativeJS: /, '').trim();
            buffer += cleanLine;
        }
    });
});

function saveTokenToFile(data) {
    const timestamp = new Date().toISOString();
    let content = `DECRYPTED JWT TOKEN REPORT\n`;
    content += `==========================\n`;
    content += `Generated on: ${timestamp}\n`;
    content += `Provider: ${data.firebase?.sign_in_provider || 'unknown'}\n\n`;

    content += `USER DETAILS\n`;
    content += `------------\n`;
    if (data.email) content += `Email: ${data.email}\n`;
    if (data.phone_number) content += `Phone: ${data.phone_number}\n`;
    content += `User ID: ${data.user_id}\n\n`;

    content += `RAW JSON PAYLOAD\n`;
    content += `----------------\n`;
    content += JSON.stringify(data, null, 2);

    fs.writeFileSync(OUTPUT_FILE, content);
    console.log(`Successfully saved token to ${OUTPUT_FILE}`);
}

logcat.stderr.on('data', (data) => {
    // console.error(`stderr: ${data}`);
});

logcat.on('close', (code) => {
    console.log(`Logcat process exited with code ${code}`);
});
