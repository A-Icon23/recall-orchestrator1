// Direct Firestore Seed Script - Run with: node seed-firebase.js
const admin = require('firebase-admin');

// Your Firebase credentials (paste your JSON here)
// GOOD – load the service account from an environment variable
const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);

// Initialize Firebase
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function seedData() {
    console.log('🌱 Starting Firestore seed...');

    try {
        // Sample businesses
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

        // Create businesses and stores
        for (const business of businesses) {
            console.log(`  📦 Creating business: ${business.businessName}`);

            await db.collection('businesses').doc(business.id).set({
                businessName: business.businessName,
                industry: business.industry,
                email: business.email,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });

            // Create stores
            for (const store of business.stores) {
                console.log(`    🏪 Adding store: ${store.name}`);
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

        // Sample recalls
        const recalls = [
            { businessId: 'biz_foodcorp_001', storeId: 'store_ny_downtown', product: 'Romaine Lettuce', severity: 'High', affectedCustomers: 245 },
            { businessId: 'biz_foodcorp_001', storeId: 'store_ny_uptown', product: 'Cherry Tomatoes', severity: 'Medium', affectedCustomers: 112 },
            { businessId: 'biz_foodcorp_001', storeId: 'store_boston', product: 'Organic Spinach', severity: 'High', affectedCustomers: 189 },
            { businessId: 'biz_freshmart_002', storeId: 'store_la_main', product: 'Ground Beef', severity: 'Critical', affectedCustomers: 456 },
            { businessId: 'biz_freshmart_002', storeId: 'store_la_beach', product: 'Chicken Breast', severity: 'High', affectedCustomers: 234 }
        ];
    }

        seedData();
