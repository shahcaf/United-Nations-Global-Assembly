const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Loads .env for local dev (Render uses dashboard env vars)

const app = express();
const PORT = process.env.PORT || 3000;
const BOT_TOKEN = process.env.BOT_TOKEN; // Set this in Render dashboard

app.use(cors()); // Allow your website to call this server

// GET /avatar/:id  →  returns { pfp: "https://cdn.discordapp.com/..." }
app.get('/avatar/:id', async (req, res) => {
    const userId = req.params.id;

    // Basic validation
    if (!/^\d{17,19}$/.test(userId)) {
        return res.status(400).json({ error: 'Invalid Discord User ID' });
    }

    try {
        const response = await fetch(`https://discord.com/api/v10/users/${userId}`, {
            headers: {
                Authorization: `Bot ${BOT_TOKEN}`
            }
        });

        if (!response.ok) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = await response.json();

        let pfpUrl;
        if (user.avatar) {
            const ext = user.avatar.startsWith('a_') ? 'gif' : 'png'; // animated or static
            pfpUrl = `https://cdn.discordapp.com/avatars/${userId}/${user.avatar}.${ext}?size=512`;
        } else {
            // Default Discord avatar
            const defaultIndex = (BigInt(userId) >> 22n) % 6n;
            pfpUrl = `https://cdn.discordapp.com/embed/avatars/${defaultIndex}.png`;
        }

        res.json({ pfp: pfpUrl, username: user.username });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/', (req, res) => res.send('UNGA Avatar API is running.'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
