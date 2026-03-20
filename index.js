const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 10000;

// --- DATABASE & TRACKING ---
let dailySales = [];
let lastSummaryDate = new Date().toLocaleDateString();

// --- SERVER SETUP ---
app.get('/', (req, res) => {
    res.send('Duka-OS Billion-Edition: ONLINE 🚀');
});

app.listen(port, () => {
    console.log(`Server live on port ${port}`);
});

// Anti-Sleep Heartbeat
setInterval(() => {
    axios.get(`https://${process.env.RENDER_EXTERNAL_HOSTNAME || 'duka-os'}.onrender.com`).catch(() => {});
}, 600000);

// --- WHATSAPP CLIENT ---
const client = new Client({
    authStrategy: new LocalAuth(), // Best for Render if you scan quickly
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    }
});

// --- QR GENERATION ---
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('--- SCAN THE LINK BELOW ---');
    console.log(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`);
});

client.on('ready', () => {
    console.log('✅ Duka-OS Connected! Ready to print billions.');
});

// --- THE "MONEY MAKER" LOGIC ---
client.on('message', async (msg) => {
    const body = msg.body.trim();
    const bodyLower = body.toLowerCase();

    // Check if we need to reset the daily counter (Midnight Reset)
    const today = new Date().toLocaleDateString();
    if (today !== lastSummaryDate) {
        dailySales = [];
        lastSummaryDate = today;
    }

    // 1. RECORD SALE: "Sold Sugar 150"
    if (bodyLower.startsWith('sold')) {
        const parts = body.split(/\s+/);
        if (parts.length >= 3) {
            const price = parseFloat(parts[parts.length - 1].replace(/[^0-9.]/g, ''));
            const item = parts.slice(1, -1).join(' ');

            if (!isNaN(price)) {
                dailySales.push({ item, price, time: new Date().toLocaleTimeString() });
                
                await msg.reply(
                    `✅ *RECEIPT RECORDED*\n\n` +
                    `🛒 *Item:* ${item.toUpperCase()}\n` +
                    `💰 *Price:* KES ${price.toLocaleString()}\n` +
                    `📅 *Date:* ${today}\n\n` +
                    `_Type *Summary* to see today's total._`
                );
            }
        } else {
            msg.reply('❌ Use: *Sold [Item] [Price]*\nExample: Sold Bread 65');
        }
    }

    // 2. DAILY SUMMARY: "Summary"
    if (bodyLower === 'summary') {
        if (dailySales.length === 0) {
            return msg.reply('📭 No sales recorded for today yet.');
        }

        let total = 0;
        let report = `📊 *DAILY SALES SUMMARY*\n_Date: ${today}_\n\n`;

        dailySales.forEach((sale, index) => {
            report += `${index + 1}. ${sale.item}: KES ${sale.price}\n`;
            total += sale.price;
        });

        report += `\n━━━━━━━━━━━━━━━\n*TOTAL REVENUE: KES ${total.toLocaleString()}* 💸\n━━━━━━━━━━━━━━━`;
        msg.reply(report);
    }

    // 3. STATUS
    if (bodyLower === 'status') {
        msg.reply('🚀 *Duka-OS Status: Ultra-Active*\nAll systems operational.');
    }
});

client.initialize();
