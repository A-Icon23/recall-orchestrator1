const { db, admin } = require('../lib/firebase');
const Stripe = require("stripe");

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
        const { refundId } = req.body;
        if (!refundId) {
            return res.status(400).send("Missing refundId");
        }

        const refundDocSnap = await db.collection("refunds").doc(refundId).get();
        if (!refundDocSnap.exists) return res.status(404).send("No refund found");
        const refundData = refundDocSnap.data();

        let stripeRefund = { id: 'ref_mock_' + Date.now(), status: 'succeeded' };

        // Check if this is a mock payment
        const isMock = refundData.paymentIntentId && refundData.paymentIntentId.startsWith('pi_mock');

        // --- MOCK MODE FOR HACKATHON ---
        // We are skipping the real Stripe call to avoid "No such payment_intent" errors
        // with dummy data.

        /* 
        // REAL STRIPE CODE (Disabled)
        if (!isMock) {
            if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is not set");
            const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
            stripeRefund = await stripe.refunds.create({
                payment_intent: refundData.paymentIntentId,
                amount: refundData.amount
            });
        } 
        */

        // SIMULATED SUCCESS
        console.log('Simulating refund for:', refundData.paymentIntentId);
        stripeRefund = { id: 'simulated_refund_id_999', status: 'succeeded' };

        // Update Firestore
        await db.collection("refunds").doc(refundId).update({
            status: "issued",
            stripeRefundId: stripeRefund.id,
            issuedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        return res.json({ ok: true, stripeRefund });
    } catch (err) {
        console.error("Error in issueRefund:", err);
        // Send the actual error message to help debugging
        return res.status(500).send(err.message || "Internal Server Error");
    }
};
