const { db } = require('../lib/firebase');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        let refundId;

        if (req.method === 'GET') {
            refundId = req.query.refundId;
        } else if (req.method === 'POST') {
            refundId = req.body.refundId;
        } else {
            return res.status(405).json({ error: 'Method Not Allowed' });
        }

        if (!refundId) {
            return res.status(400).json({ error: 'Missing refundId' });
        }

        const doc = await db.collection("refunds").doc(refundId).get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Refund not found' });
        }

        const data = doc.data();
        return res.json({
            refundId: doc.id,
            status: data.status, // 'pending' or 'issued'
            amount: data.amount,
            createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null
        });

    } catch (err) {
        console.error(err);
        return res.status(500).send(err.message);
    }
};
