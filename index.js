const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 10000;

let dailySales = [];
let lastSummaryDate = new Date().toLocaleDateString('en-KE');

app.get('/', (req, res) => res.send('Duka-OS V3: Stable 🚀'));
app.listen(port, () => console.log(`Live on ${port}`));

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--single-process']
    }
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log(`\n--- SCAN LINK ---\nhttps://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}\n----------------\n`);
});

client.on('ready', () => console.log('✅ Duka-OS Online'));

client.on('message', async (msg) => {
    const body = msg.body.trim().toLowerCase();
    const today = new Date().toLocaleDateString('en-KE');

    if (today !== lastSummaryDate) {
        dailySales = [];
        lastSummaryDate = today;
    }

    // 1. RECORD SALE
    if (body.startsWith('sold')) {
        const parts = msg.body.split(/\s+/);
        if (parts.length >= 3) {
            const price = parseFloat(parts[parts.length - 1].replace(/[^0-9.]/g, ''));
            const item = parts.slice(1, -1).join(' ');
            if (!isNaN(price)) {
                dailySales.push({ item, price });
                msg.reply(`✅ *RECORDED*\n${item.toUpperCase()}: KES ${price.toLocaleString()}`);
            }
        }
    }

    // 2. DELETE LAST SALE
    if (body === 'delete') {
        if (dailySales.length > 0) {
            const removed = dailySales.pop();
            msg.reply(`🗑️ *DELETED LAST ENTRY*\nRemoved: ${removed.item} (KES ${removed.price})`);
        } else {
            msg.reply('📭 Nothing to delete.');
        }
    }

    // 3. SUMMARY
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

client.initialize();
