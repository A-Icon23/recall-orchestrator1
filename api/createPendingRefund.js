const { db, admin } = require('../lib/firebase');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { purchaseId, paymentIntentId, amount, customerId } = req.body;

        const refundDoc = {
            purchaseId,
            paymentIntentId: paymentIntentId || null,
            amount,
            customerId,
            status: "pending",
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };
        const ref = await db.collection("refunds").add(refundDoc);

        return res.json({ refundId: ref.id });
    } catch (err) {
        console.error(err);
        return res.status(500).send(err.message);
    }
};
