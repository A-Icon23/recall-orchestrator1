const { db, admin, initError } = require('../lib/firebase');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Check if Firebase is initialized
    if (initError || !db) {
        return res.status(200).json({
            success: false,
            message: 'Firebase not configured. For hackathon, the app uses localStorage instead.',
            note: 'The app will work without Firestore - all data is stored in browser localStorage',
            instructions: 'Just sign up normally and the app will create sample data automatically!'
        });
    }

    try {
        // Sample businesses with stores
        const businesses = [
            {
                id: 'biz_foodcorp_001',
                businessName: 'FoodCorp Distribution',
                industry: 'Food & Beverage',
                email: 'admin@foodcorp.com',
                stores: [
                    { id: 'store_ny_downtown', name: 'Downtown NYC', location: '123 Broadway, New York, NY', region: 'Northeast' },
                    { id: 'store_ny_uptown', name: 'Uptown NYC', location: '456 Park Ave, New York, NY', region: 'Northeast' },
                    { id: 'store_boston', name: 'Boston Hub', location: '789 Commonwealth Ave, Boston, MA', region: 'Northeast' }
                ]
            },
            {
                id: 'biz_freshmart_002',
                businessName: 'FreshMart Groceries',
                industry: 'Retail',
                email: 'admin@freshmart.com',
                stores: [
                    { id: 'store_la_main', name: 'LA Main Street', location: '321 Main St, Los Angeles, CA', region: 'West Coast' },
                    { id: 'store_la_beach', name: 'LA Beach Branch', location: '654 Ocean Blvd, Santa Monica, CA', region: 'West Coast' }
                ]
            }
        ];

        // Create businesses
        for (const business of businesses) {
            await db.collection('businesses').doc(business.id).set({
                businessName: business.businessName,
                industry: business.industry,
                email: business.email,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });

            // Create stores for this business
            for (const store of business.stores) {
                await db.collection('businesses')
                    .doc(business.id)
                    .collection('stores')
                    .doc(store.id)
                    .set({
                        storeName: store.name,
                        location: store.location,
                        region: store.region,
                        createdAt: admin.firestore.FieldValue.serverTimestamp()
                    });
            }
        }

        // Sample recalls with businessId and storeId
        const recalls = [
            // FoodCorp recalls
            { businessId: 'biz_foodcorp_001', storeId: 'store_ny_downtown', product: 'Romaine Lettuce', severity: 'High', affectedCustomers: 245 },
            { businessId: 'biz_foodcorp_001', storeId: 'store_ny_uptown', product: 'Cherry Tomatoes', severity: 'Medium', affectedCustomers: 112 },
            { businessId: 'biz_foodcorp_001', storeId: 'store_boston', product: 'Organic Spinach', severity: 'High', affectedCustomers: 189 },

            // FreshMart recalls
            { businessId: 'biz_freshmart_002', storeId: 'store_la_main', product: 'Ground Beef', severity: 'Critical', affectedCustomers: 456 },
            { businessId: 'biz_freshmart_002', storeId: 'store_la_beach', product: 'Chicken Breast', severity: 'High', affectedCustomers: 234 }
        ];

        for (const recall of recalls) {
            await db.collection('recalls').add({
                ...recall,
                recallDate: admin.firestore.FieldValue.serverTimestamp(),
                status: 'active',
                description: `Possible contamination detected in ${recall.product}`
            });
        }

        // Sample refunds
        const refunds = [
            // FoodCorp refunds
            { businessId: 'biz_foodcorp_001', storeId: 'store_ny_downtown', customerId: 'CUST001', amount: 1299, status: 'pending' },
            { businessId: 'biz_foodcorp_001', storeId: 'store_ny_downtown', customerId: 'CUST002', amount: 899, status: 'issued' },
            { businessId: 'biz_foodcorp_001', storeId: 'store_ny_uptown', customerId: 'CUST003', amount: 1599, status: 'pending' },
            { businessId: 'biz_foodcorp_001', storeId: 'store_boston', customerId: 'CUST004', amount: 2199, status: 'issued' },

            // FreshMart refunds
            { businessId: 'biz_freshmart_002', storeId: 'store_la_main', customerId: 'CUST101', amount: 3499, status: 'pending' },
            { businessId: 'biz_freshmart_002', storeId: 'store_la_main', customerId: 'CUST102', amount: 1899, status: 'issued' },
            { businessId: 'biz_freshmart_002', storeId: 'store_la_beach', customerId: 'CUST103', amount: 2599, status: 'pending' }
        ];

        for (const refund of refunds) {
            await db.collection('refunds').add({
                ...refund,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                product: 'Various recalled items'
            });
        }

        // Sample customers
        const customers = [
            { businessId: 'biz_foodcorp_001', storeId: 'store_ny_downtown', id: 'CUST001', name: 'John Doe', email: 'john@email.com' },
            { businessId: 'biz_foodcorp_001', storeId: 'store_ny_downtown', id: 'CUST002', name: 'Jane Smith', email: 'jane@email.com' },
            { businessId: 'biz_foodcorp_001', storeId: 'store_ny_uptown', id: 'CUST003', name: 'Bob Johnson', email: 'bob@email.com' },
            { businessId: 'biz_freshmart_002', storeId: 'store_la_main', id: 'CUST101', name: 'Alice Wong', email: 'alice@email.com' },
            { businessId: 'biz_freshmart_002', storeId: 'store_la_beach', id: 'CUST103', name: 'Carlos Martinez', email: 'carlos@email.com' }
        ];

        for (const customer of customers) {
            await db.collection('customers').add({
                ...customer,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
        }

        res.status(200).json({
            success: true,
            message: 'Multi-store data seeded successfully',
            data: {
                businesses: businesses.length,
                stores: businesses.reduce((sum, b) => sum + b.stores.length, 0),
                recalls: recalls.length,
                refunds: refunds.length,
                customers: customers.length
            }
        });
    } catch (error) {
        console.error('Seed error:', error);
        res.status(500).json({ error: error.message });
    }
};
