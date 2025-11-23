const { db, admin } = require('../lib/firebase');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const batch = db.batch();

        // 1. Create Product
        const productRef = db.collection('products').doc('LET-123');
        batch.set(productRef, {
            sku: 'LET-123',
            name: 'Bagged Lettuce',
            supplier: 'Fresh Farms',
            price: 499 // cents
        });

        // 2. Create Customers
        const customers = [
            { id: 'cust_1', name: 'Alice Johnson', email: 'alice@example.com' },
            { id: 'cust_2', name: 'Bob Smith', email: 'bob@example.com' },
            { id: 'cust_3', name: 'Charlie Brown', email: 'charlie@example.com' }
        ];

        customers.forEach(c => {
            const ref = db.collection('customers').doc(c.id);
            batch.set(ref, c);
        });

        // 3. Create Purchases (CRITICAL for Agent B)
        const purchases = [
            { id: 'purch_1', customerId: 'cust_1', sku: 'LET-123', batch: 'BATCH-441', date: '2023-10-01' },
            { id: 'purch_2', customerId: 'cust_2', sku: 'LET-123', batch: 'BATCH-441', date: '2023-10-05' },
            { id: 'purch_3', customerId: 'cust_3', sku: 'LET-123', batch: 'BATCH-999', date: '2023-11-01' } // Different batch (won't match)
        ];

        purchases.forEach(p => {
            const ref = db.collection('purchases').doc(p.id);
            batch.set(ref, p);
        });

        // 4. Create Past Refunds (For Dashboard Charts)
        const refundsData = [
            { id: 'ref_1', customerId: 'cust_1', amount: 499, status: 'issued', date: '2023-10-01T10:00:00Z' },
            { id: 'ref_2', customerId: 'cust_2', amount: 499, status: 'issued', date: '2023-10-05T14:30:00Z' },
            { id: 'ref_3', customerId: 'cust_3', amount: 499, status: 'pending', date: new Date().toISOString() },
            { id: 'ref_4', customerId: 'cust_1', amount: 499, status: 'pending', date: new Date().toISOString() }
        ];

        refundsData.forEach(r => {
            const ref = db.collection('refunds').doc(r.id);
            batch.set(ref, {
                purchaseId: `purch_${r.id}`, // specific ID mapping not strictly needed for this demo logic but good for consistency
                paymentIntentId: 'pi_mock_12345',
                amount: r.amount,
                customerId: r.customerId,
                status: r.status,
                createdAt: admin.firestore.Timestamp.fromDate(new Date(r.date)),
                ...(r.status === 'issued' ? { issuedAt: admin.firestore.Timestamp.fromDate(new Date()) } : {})
            });
        });

        await batch.commit();

        return res.json({ message: 'Sample data seeded successfully!' });
    } catch (err) {
        console.error(err);
        return res.status(500).send(err.message);
    }
};
