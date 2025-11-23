const { db } = require('../lib/firebase');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const snapshot = await db.collection("refunds").get();
        let totalRefunded = 0;
        let pendingCount = 0;
        let issuedCount = 0;
        const dailyVolume = {};

        snapshot.forEach(doc => {
            const data = doc.data();
            const amount = data.amount || 0;
            const status = data.status || 'pending';
            const createdAt = data.createdAt ? data.createdAt.toDate() : new Date();

            // Group by day for chart
            const day = createdAt.toLocaleDateString('en-US', { weekday: 'short' });
            if (!dailyVolume[day]) dailyVolume[day] = 0;
            dailyVolume[day] += amount;

            if (status === 'issued') {
                totalRefunded += amount;
                issuedCount++;
            } else {
                pendingCount++;
            }
        });

        // Format chart data
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const chartData = days.map(day => ({
            name: day,
            refunds: (dailyVolume[day] || 0) / 100 // Convert to dollars
        }));

        return res.json({
            totalRefunded,
            pendingCount,
            issuedCount,
            chartData
        });
    } catch (err) {
        console.error(err);
        return res.status(500).send(err.message);
    }
};
