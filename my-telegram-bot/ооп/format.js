const express = require('express');
const cors = require('cors');
const cron = require('node-cron');

const { getNotSignedUsers } = require('./app');
const { getDates } = require('../date');

const app = express();
const PORT = 3000;

app.use(cors());

const data = {
    message: null,
    timestamp: null
};
const updateData = async () => {
    try {
        const { previousDate, currentDate } = getDates();

        data.message = await getNotSignedUsers();
        data.timestamp = `${previousDate} - ${currentDate}`;

        console.log('Data updated:', data.timestamp);
    } catch (err) {
        console.error('Update failed:', err);
    }
};

cron.schedule('04 22 * * *', updateData);

app.get('/nosemd', (req, res) => {
    if (!data.message) {
        return res.status(503).json({ error: 'Data not ready yet' });
    }

    res.json(data);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
