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

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const status = req.query.status;
        let query = db.collection("refunds").orderBy("createdAt", "desc");

        if (status) {
            query = query.where("status", "==", status);
        }

        const snapshot = await query.get();
        const refunds = [];

        for (const doc of snapshot.docs) {
            const data = doc.data();
            // Convert timestamps to ISO strings for JSON
            if (data.createdAt && data.createdAt.toDate) {
                data.createdAt = data.createdAt.toDate().toISOString();
            }
            if (data.issuedAt && data.issuedAt.toDate) {
                data.issuedAt = data.issuedAt.toDate().toISOString();
            }

            refunds.push({
                id: doc.id,
                ...data
            });
        }

        return res.json({ refunds });
    } catch (err) {
        console.error(err);
        return res.status(500).send(err.message);
    }
};
