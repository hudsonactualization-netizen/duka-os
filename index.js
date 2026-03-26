const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 10000;

// --- DATABASE ---
let dailySales = [];
let lastSummaryDate = new Date().toLocaleDateString('en-KE');

// --- SERVER ---
app.get('/', (req, res) => res.send('Duka-OS Lean Edition: Active 🚀'));
app.listen(port, () => console.log(`Listening on ${port}`));

// --- LEAN WHATSAPP CLIENT (Memory Optimized) ---
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
            '--single-process', // Crucial for low RAM
            '--disable-gpu',
            '--disable-datasaver-lite',
            '--disable-infobars',
            '--disable-extensions'
        ],
    }
});

// --- QR LOGIC ---
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log(`\n--- SCAN LINK ---\nhttps://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}\n----------------\n`);
});

client.on('ready', () => {
    console.log('✅ Duka-OS Connected & Optimized.');
});

// --- REVENUE LOGIC ---
client.on('message', async (msg) => {
    const body = msg.body.trim().toLowerCase();
    const today = new Date().toLocaleDateString('en-KE');

    if (today !== lastSummaryDate) {
        dailySales = [];
        lastSummaryDate = today;
    }

    if (body.startsWith('sold')) {
        const parts = msg.body.split(/\s+/);
        if (parts.length >= 3) {
            const priceStr = parts[parts.length - 1].replace(/[^0-9.]/g, '');
            const price = parseFloat(priceStr);
            const item = parts.slice(1, -1).join(' ');

            if (!isNaN(price)) {
                dailySales.push({ item, price });
                msg.reply(`✅ *RECORDED*\n${item.toUpperCase()}: KES ${price.toLocaleString()}`);
            }
        }
    }

    if (body === 'summary') {
        if (dailySales.length === 0) return msg.reply('📭 No sales today.');
        let total = 0;
        let report = `📊 *TOTALS: ${today}*\n\n`;
        dailySales.forEach((s, i) => {
            report += `${i + 1}. ${s.item}: ${s.price}\n`;
            total += s.price;
        });
        report += `\n*TOTAL: KES ${total.toLocaleString()}*`;
        msg.reply(report);
    }
});

// Error handling to prevent total crash
client.on('auth_failure', () => console.error('Auth failed, restart needed.'));
client.initialize();
