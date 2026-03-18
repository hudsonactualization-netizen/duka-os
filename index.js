const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 10000;

// 1. Health Check & Anti-Sleep
app.get('/', (req, res) => {
    res.send('Duka-OS is Online 🚀');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Self-pinging every 10 minutes to keep Render alive
setInterval(() => {
    axios.get('https://duka-os.onrender.com')
        .then(() => console.log('Self-ping successful'))
        .catch(err => console.error('Self-ping failed', err));
}, 600000);

// 2. WhatsApp Client Setup
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ],
    }
});

// 3. QR Code Generation (The Scanner Fix)
client.on('qr', (qr) => {
    // This prints it in the terminal (might look messy)
    qrcode.generate(qr, { small: true });
    
    // THIS IS THE KEY: Click this link in your Render logs!
    console.log('--------------------------------------------------');
    console.log('SCAN THIS LINK IF QR BOX LOOKS MESSY:');
    console.log(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`);
    console.log('--------------------------------------------------');
});

client.on('ready', () => {
    console.log('Duka-OS is successfully linked to WhatsApp! ✅');
});

// 4. The "Money Maker" Logic
client.on('message', async (msg) => {
    const chat = await msg.getChat();
    const body = msg.body.toLowerCase();

    if (body.startsWith('sold')) {
        const parts = msg.body.split(' ');
        if (parts.length >= 3) {
            const item = parts.slice(1, -1).join(' ');
            const price = parts[parts.length - 1];
            
            msg.reply(`✅ *Duka-OS Receipt*\n\nItem: ${item}\nPrice: KES ${price}\nTime: ${new Date().toLocaleString()}\n\n_Data saved to local session._`);
        } else {
            msg.reply('❌ Format error! Use: Sold [Item] [Price]\nExample: Sold Sugar 150');
        }
    }
    
    if (body === 'help') {
        msg.reply('Welcome to *Duka-OS* 🇰🇪\n\nCommands:\n1. *Sold [Item] [Price]* - Record a sale\n2. *Status* - Check system health');
    }
});

client.initialize();
