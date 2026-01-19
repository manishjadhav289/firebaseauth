const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, 'jwt_data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'decrypted_token.txt');
const API_KEY = 'AIzaSyCyOqlVyf_hrFaVqryRsuzDgHN7As9wFjg'; // Extracted from google-services.json

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
            const cleanLine = line.replace(/.*I ReactNativeJS: /, '').trim();
            buffer += cleanLine;
        }
    });
});

function saveTokenToFile(data) {
    // Handle both old (claims only) and new ({token, claims}) structures
    const claims = data.claims || data;
    const rawToken = data.token || 'Not captured (Update Client Code)';

    const timestamp = new Date().toISOString();
    const provider = claims.firebase?.sign_in_provider || 'unknown';

    let content = `DECRYPTED JWT TOKEN REPORT\n`;
    content += `==========================\n`;
    content += `Generated on: ${timestamp}\n`;
    content += `Provider: ${provider}\n\n`;

    content += `USER DETAILS\n`;
    content += `------------\n`;
    if (claims.email) content += `Email: ${claims.email}\n`;
    if (claims.phone_number) content += `Phone: ${claims.phone_number}\n`;
    content += `User ID: ${claims.user_id}\n\n`;

    content += `RAW JSON PAYLOAD (CLAIMS)\n`;
    content += `-------------------------\n`;
    content += JSON.stringify(claims, null, 2);
    content += `\n\n`;

    content += `COMPLETE ENCODED TOKEN\n`;
    content += `----------------------\n`;
    content += `${rawToken}\n\n`;

    content += `API REQUEST CONTEXT\n`;
    content += `-------------------\n`;
    content += `The app communicates with the Firebase Identity Toolkit API.\n\n`;

    content += `1. AUTHENTICATION REQUEST (How the user signed in)\n`;
    if (provider === 'password') {
        content += `   Endpoint: https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}\n`;
        content += `   Method:   POST\n`;
        content += `   Payload:  { "email": "${claims.email}", "password": "[HIDDEN]", "returnSecureToken": true }\n`;
    } else if (provider === 'phone') {
        content += `   Endpoint: https://identitytoolkit.googleapis.com/v1/accounts:signInWithPhoneNumber?key=${API_KEY}\n`;
        content += `   Method:   POST\n`;
        content += `   Payload:  { "phoneNumber": "${claims.phone_number || '...'}", "sessionInfo": "..." }\n`;
    } else if (provider === 'google.com') {
        content += `   Endpoint: https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=${API_KEY}\n`;
        content += `   Method:   POST\n`;
        content += `   Payload:  { "postBody": "id_token=[GOOGLE_OAUTH_TOKEN]&providerId=google.com", "returnSecureToken": true }\n`;
    } else {
        content += `   Endpoint: https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${API_KEY}\n`;
    }
    content += `\n`;

    content += `2. TOKEN VERIFICATION (How to check this token)\n`;
    content += `   Endpoint: https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${API_KEY}\n`;
    content += `   Method:   POST\n`;
    content += `   Header:   Content-Type: application/json\n`;
    content += `   Header:   Authorization: Bearer ${rawToken}\n`;
    content += `   Payload:  { "idToken": "${rawToken}" }\n`;

    fs.writeFileSync(OUTPUT_FILE, content);
    console.log(`Successfully saved token to ${OUTPUT_FILE}`);
}

logcat.stderr.on('data', (data) => {
    // console.error(`stderr: ${data}`);
});

logcat.on('close', (code) => {
    console.log(`Logcat process exited with code ${code}`);
});
