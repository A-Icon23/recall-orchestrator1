// In Vercel, the backend is relative to the frontend
const BACKEND_URL = '';

export const api = {
    issueRefund: async (refundId) => {
        const response = await fetch(`${BACKEND_URL}/api/issueRefund`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refundId }),
        });

        if (!response.ok) {
            throw new Error('Failed to issue refund');
        }

        return response.json();
    },

    // Fallback for when real-time is not available
    getRefunds: async () => {
        const response = await fetch(`${BACKEND_URL}/api/getRefunds`);
        if (!response.ok) throw new Error('Failed to fetch refunds');
        const data = await response.json();
        return data.refunds;
    }
};
