import { createContext, useContext, useState, useEffect } from 'react';

// Business Auth Context for multi-tenant SaaS
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [business, setBusiness] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load business profile from localStorage
        const savedBusiness = localStorage.getItem('recallos_business');
        if (savedBusiness) {
            setBusiness(JSON.parse(savedBusiness));
        }
        setLoading(false);
    }, []);

    const loginBusiness = (businessData) => {
        setBusiness(businessData);
        localStorage.setItem('recallos_business', JSON.stringify(businessData));
    };

    const registerBusiness = (businessName, industry, email) => {
        // Generate a unique business ID (in production, this would be Firebase Auth UID)
        const businessId = `biz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const businessData = {
            id: businessId,
            businessName,
            industry,
            email,
            createdAt: new Date().toISOString()
        };

        setBusiness(businessData);
        localStorage.setItem('recallos_business', JSON.stringify(businessData));

        return businessData;
    };

    const logout = () => {
        setBusiness(null);
        localStorage.removeItem('recallos_business');
        localStorage.removeItem('recallos_auth');
    };

    const value = {
        business,
        isAuthenticated: !!business,
        loading,
        loginBusiness,
        registerBusiness,
        logout
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
