const { db, initError } = require('../lib/firebase');

// --- THE LOGIC (Shared by both GET and POST) ---
async function findCustomersLogic(sku, batch) {
    if (!sku || !batch) throw new Error("Missing SKU or Batch");

    console.log(`Searching for purchases with SKU: ${sku}, Batch: ${batch}`);

    const purchasesSnap = await db.collection("purchases")
        .where("sku", "==", sku)
        .where("batch", "==", batch)
        .get();

    const customers = [];
    for (const docSnap of purchasesSnap.docs) {
        const purchase = docSnap.data();
        // Fetch customer details
        const custSnap = await db.collection("customers").doc(purchase.customerId).get();

        if (custSnap.exists) {
            customers.push({
                purchaseId: docSnap.id,
                ...purchase,
                customerName: custSnap.data().name,
                customerEmail: custSnap.data().email
            });
        }
    }
    return customers;
}

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

    if (initError) {
        return res.status(500).json({
            error: 'Server Configuration Error',
            details: initError.message,
            tip: 'Check Vercel Environment Variables for FIREBASE_SERVICE_ACCOUNT'
        });
    }

    if (!db) {
        return res.status(500).json({ error: 'Database not initialized' });
    }

    try {
        let sku, batch;

        if (req.method === 'GET') {
            // Handle GET (Browser)
            sku = req.query.sku;
            batch = req.query.batch;
        } else if (req.method === 'POST') {
            // Handle POST (API/Postman)
            sku = req.body.sku;
            batch = req.body.batch;
        } else {
            return res.status(405).json({ error: 'Method Not Allowed' });
        }

        // Validate required parameters
        if (!sku || !batch) {
            return res.status(400).json({
                error: 'Missing required parameters',
                details: 'Both sku and batch must be provided in query (GET) or body (POST)'
            });
        }

        const customers = await findCustomersLogic(sku, batch);
        return res.json({ customers });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
};
