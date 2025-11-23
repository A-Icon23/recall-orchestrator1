import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../lib/firebaseClient';
import { api } from '../lib/api';

export function useRecalls() {
    const [recalls, setRecalls] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (db) {
            // Real-time listener
            const q = query(collection(db, 'recalls'), orderBy('timestamp', 'desc'), limit(10));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    timestamp: doc.data().timestamp?.toDate().toISOString()
                }));
                setRecalls(data);
                setLoading(false);
            }, (error) => {
                console.error("Real-time recalls error:", error);
                setLoading(false);
            });
            return () => unsubscribe();
        } else {
            // Fallback to Polling
            const fetchRecalls = async () => {
                try {
                    const response = await fetch('/api/getRecalls');
                    if (response.ok) {
                        const data = await response.json();
                        setRecalls(data.recalls || []);
                    }
                } catch (e) {
                    console.error("Polling recalls error:", e);
                } finally {
                    setLoading(false);
                }
            };

            fetchRecalls();
            const interval = setInterval(fetchRecalls, 5000);
            return () => clearInterval(interval);
        }
    }, []);

    return { recalls, loading };
}

export function useRefunds() {
    const [refunds, setRefunds] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (db) {
            // Real-time listener
            const q = query(collection(db, 'refunds'), orderBy('createdAt', 'desc'));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt?.toDate().toISOString()
                }));
                setRefunds(data);
                setLoading(false);
            }, (error) => {
                console.error("Real-time refunds error:", error);
                setLoading(false);
            });
            return () => unsubscribe();
        } else {
            // Fallback to Polling
            const fetchRefunds = async () => {
                try {
                    const data = await api.getRefunds();
                    setRefunds(data || []);
                } catch (e) {
                    console.error("Polling refunds error:", e);
                } finally {
                    setLoading(false);
                }
            };

            fetchRefunds();
            const interval = setInterval(fetchRefunds, 5000);
            return () => clearInterval(interval);
        }
    }, []);

    return { refunds, loading };
}
