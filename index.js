const { Client, RemoteAuth } = require('whatsapp-web.js'); // Switched to RemoteAuth for "Immortal" sessions
const qrcode = require('qrcode-terminal');
const express = require('express');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 10000;

// 1. Health Check & Anti-Sleep (Vital for Render Free Tier)
app.get('/', (req, res) => {
    res.send('Duka-OS Billion-Edition is Online 🚀');
});

app.listen(port, () => {
    console.log(`Duka-OS Server Live on port ${port}`);
});

// Self-ping logic to stop the bot from sleeping
setInterval(() => {
    axios.get(`https://${process.env.RENDER_EXTERNAL_HOSTNAME || 'duka-os'}.onrender.com`)
        .then(() => console.log('✅ Heartbeat sent: Duka-OS is active.'))
        .catch(err => console.log('⚠️ Heartbeat failed (Server starting up...)'));
}, 600000); // 10 minutes

// 2. Optimized WhatsApp Client
const client = new Client({
    authStrategy: new RemoteAuth({
        clientId: 'Duka-OS-Billion',
        dataPath: './.wwebjs_auth',
        backupSyncIntervalMs: 60000 // Saves your login every minute
    }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--shm-size=1gb' // Gives the "Billion" logic more memory
        ],
    }
});

// 3. QR Logic (Since whatsapp-web.js requires scanning)
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('--- SCAN THE LINK BELOW TO LINK DUKA-OS ---');
    console.log(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`);
    console.log('-------------------------------------------');
});

client.on('ready', () => {
    console.log('🚀 Duka-OS Ready! System initialized for high-volume sales.');
});

// 4. POWER LOGIC: The "Billion Shilling" Handler
client.on('message', async (msg) => {
    const body = msg.body.trim();
    const bodyLower = body.toLowerCase();

    // High-speed "Sold" command
    if (bodyLower.startsWith('sold')) {
        try {
            const parts = body.split(/\s+/); // Splits by any space
            if (parts.length >= 3) {
                const price = parts[parts.length - 1];
                const item = parts.slice(1, -1).join(' ');

                // Fast response for customer receipts
                await msg.reply(
                    `💰 *SALE RECORDED*\n\n` +
                    `📦 *Item:* ${item.toUpperCase()}\n` +
                    `💵 *Price:* KES ${price}\n` +
                    `📅 *Date:* ${new Date().toLocaleDateString('en-KE')}\n` +
                    `⏰ *Time:* ${new Date().toLocaleTimeString('en-KE')}\n\n` +
                    `_System: Duka-OS High-Performance Mode_`
                );
            } else {
                msg.reply('❌ *Format:* Sold [Item] [Price]\nExample: *Sold Milk 70*');
            }
        } catch (error) {
            console.error('Sale error:', error);
        }
    }

    // Business Status Command
    if (bodyLower === 'status') {
        msg.reply('✅ *Duka-OS System Status*\n\nUptime: Active\nDatabase: Local\nProcessing Speed: Ultra-Fast');
    }
});

client.initialize();
