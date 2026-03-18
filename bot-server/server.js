const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_PASS = process.env.ADMIN_PASS || '190472';
const DATA_FILE = path.join(__dirname, 'members.json');

app.use(cors());
app.use(express.json());

// Helper: load members from file
function loadMembers() {
    if (!fs.existsSync(DATA_FILE)) return [];
    try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
    catch { return []; }
}

// Helper: save members to file
function saveMembers(members) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(members, null, 2));
}

// --- GET /avatar/:id — Fetch real Discord PFP ---
app.get('/avatar/:id', async (req, res) => {
    const userId = req.params.id;
    if (!/^\d{17,19}$/.test(userId)) return res.status(400).json({ error: 'Invalid ID' });
    try {
        const response = await fetch(`https://discord.com/api/v10/users/${userId}`, {
            headers: { Authorization: `Bot ${BOT_TOKEN}` }
        });
        if (!response.ok) return res.status(404).json({ error: 'User not found' });
        const user = await response.json();
        let pfpUrl;
        if (user.avatar) {
            const ext = user.avatar.startsWith('a_') ? 'gif' : 'png';
            pfpUrl = `https://cdn.discordapp.com/avatars/${userId}/${user.avatar}.${ext}?size=512`;
        } else {
            const defaultIndex = (BigInt(userId) >> 22n) % 6n;
            pfpUrl = `https://cdn.discordapp.com/embed/avatars/${defaultIndex}.png`;
        }
        res.json({ pfp: pfpUrl, username: user.username });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// --- GET /members — Return all team members ---
app.get('/members', (req, res) => {
    res.json(loadMembers());
});

// --- POST /members — Add a new member (requires password) ---
app.post('/members', (req, res) => {
    const { pass, member } = req.body;
    if (pass !== ADMIN_PASS) return res.status(403).json({ error: 'Unauthorized' });
    if (!member || !member.id || !member.name || !member.role) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    const members = loadMembers();
    members.push(member);
    saveMembers(members);
    res.json({ success: true, members });
});

// --- PUT /members/:index — Edit a member (requires password) ---
app.put('/members/:index', (req, res) => {
    const { pass, member } = req.body;
    if (pass !== ADMIN_PASS) return res.status(403).json({ error: 'Unauthorized' });
    const members = loadMembers();
    const idx = parseInt(req.params.index);
    if (idx < 0 || idx >= members.length) return res.status(404).json({ error: 'Not found' });
    members[idx] = member;
    saveMembers(members);
    res.json({ success: true, members });
});

// --- DELETE /members/:index — Remove a member (requires password) ---
app.delete('/members/:index', (req, res) => {
    const { pass } = req.body;
    if (pass !== ADMIN_PASS) return res.status(403).json({ error: 'Unauthorized' });
    const members = loadMembers();
    const idx = parseInt(req.params.index);
    if (idx < 0 || idx >= members.length) return res.status(404).json({ error: 'Not found' });
    members.splice(idx, 1);
    saveMembers(members);
    res.json({ success: true, members });
});

app.get('/', (req, res) => res.send('UNGA Avatar & Members API is running.'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
