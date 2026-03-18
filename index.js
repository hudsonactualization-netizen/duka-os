const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const https = require('https');

const app = express();
const port = process.env.PORT || 3000;

// 1. HEALTH CHECK & MONITORING
app.get('/', (req, res) => {
    res.send('<h1>Duka-OS is Online 🚀</h1><p>Status: Printing Billions...</p>');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    
    // SELF-HEALING: Pings itself every 10 mins to stay awake on Render Free Tier
    setInterval(() => {
        if (process.env.RENDER_EXTERNAL_HOSTNAME) {
            const url = `https://${process.env.RENDER_EXTERNAL_HOSTNAME}.onrender.com`;
            https.get(url, (res) => {
                console.log(`Self-ping sent to ${url}: Status ${res.statusCode}`);
            }).on('error', (e) => {
                console.error(`Self-ping failed: ${e.message}`);
            });
        }
    }, 600000); // 10 minutes
});

// 2. WHATSAPP CLIENT CONFIGURATION
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-extensions',
            '--single-process'
        ],
    }
});

// 3. EVENT HANDLERS
client.on('qr', (qr) => {
    // This will render the QR code in your Render.com logs
    console.log('--- SCAN THE QR CODE BELOW ---');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Duka-OS is successfully linked to WhatsApp!');
});

client.on('authenticated', () => {
    console.log('Authentication successful!');
});

client.on('auth_failure', msg => {
    console.error('Authentication failure:', msg);
});

// 4. THE BILLION-SHILLING LOGIC (The Bot)
client.on('message', async msg => {
    const chat = await msg.getChat();
    const input = msg.body.toLowerCase();

    // Command: "Sold [Item] [Amount]"
    if (input.startsWith('sold')) {
        const parts = msg.body.split(' ');
        
        if (parts.length < 3) {
            msg.reply('❌ Format error! Use: Sold [Item] [Price]\nExample: Sold Sugar 200');
            return;
        }

        const item = parts[1];
        const price = parts[2];

        // LOGIC: In the next step, we will save this to Supabase
        console.log(`Recording Sale: ${item} - KES ${price}`);
        
        msg.reply(`✅ *Duka-OS Receipt*\n------------------\nItem: ${item}\nPrice: KES ${price}\nStatus: Recorded locally.\n\n_Next: Syncing to Cloud Database..._`);
    }

    // Command: "Help"
    if (input === 'help') {
        msg.reply('Welcome to *Duka-OS* 🇰🇪\n\nCommands:\n1. *Sold [Item] [Price]* - Record a sale\n2. *Stock* - View inventory\n3. *Report* - Daily total');
    }
});

client.initialize();
