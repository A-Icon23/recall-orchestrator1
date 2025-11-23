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
        const snapshot = await db.collection("recalls").orderBy("timestamp", "desc").limit(10).get();
        const recalls = [];

        snapshot.forEach(doc => {
            recalls.push({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp ? doc.data().timestamp.toDate().toISOString() : null
            });
        });

        return res.json({ recalls });
    } catch (err) {
        console.error(err);
        return res.status(500).send(err.message);
    }
};
