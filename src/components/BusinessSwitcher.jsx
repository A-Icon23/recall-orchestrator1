import React, { useState } from 'react';
import { ChevronDown, Plus, Building2 } from 'lucide-react';

export const BusinessSwitcher = ({ businesses, currentBusiness, onSwitch }) => {
    const [isOpen, setIsOpen] = useState(false);

    if (!businesses || businesses.length === 0) {
        return null;
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
            >
                <Building2 size={18} className="text-blue-400" />
                <div className="text-left">
                    <p className="text-sm font-medium text-white">{currentBusiness?.businessName || 'Select Business'}</p>
                    <p className="text-xs text-gray-500">{currentBusiness?.industry || ''}</p>
                </div>
                <ChevronDown size={16} className="text-gray-400" />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl z-50 max-h-96 overflow-y-auto">
                    {businesses.map(business => (
                        <button
                            key={business.id}
                            onClick={() => {
                                onSwitch(business);
                                setIsOpen(false);
                            }}
                            className={`w-full p-3 text-left hover:bg-gray-700 transition-colors border-b border-gray-700 ${currentBusiness?.id === business.id ? 'bg-blue-500/10' : ''
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                    {business.businessName.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-white truncate">{business.businessName}</p>
                                    <p className="text-xs text-gray-500">{business.industry}</p>
                                </div>
                                {currentBusiness?.id === business.id && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                                )}
                            </div>
                        </button>
                    ))}

                    <button className="w-full p-3 text-left hover:bg-gray-700 transition-colors flex items-center gap-2 text-blue-400">
                        <Plus size={16} />
                        <span className="text-sm font-medium">Add New Business</span>
                    </button>
                </div>
            )}

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOpen(false)}
                ></div>
            )}
        </div>
    );
};
