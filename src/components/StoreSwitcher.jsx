import React, { useState } from 'react';
import { ChevronDown, Plus, MapPin } from 'lucide-react';

export const StoreSwitcher = ({ stores, currentStore, onSwitch }) => {
    const [isOpen, setIsOpen] = useState(false);

    if (!stores || stores.length === 0) {
        return null;
    }

    return (
        <div className="relative mb-4">
            < button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between gap-2 p-3 bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <MapPin size={18} className="text-green-400 flex-shrink-0" />
                    <div className="text-left">
                        <p className="text-sm font-medium text-white">{currentStore?.storeName || 'All Stores'}</p>
                        <p className="text-xs text-gray-500 truncate">{currentStore?.location || 'All locations'}</p>
                    </div>
                </div>
                <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />
            </button >

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl z-50 max-h-80 overflow-y-auto">
                    {/* All Stores Option */}
                    <button
                        onClick={() => {
                            onSwitch(null); // null = all stores
                            setIsOpen(false);
                        }}
                        className={`w-full p-3 text-left hover:bg-gray-700 transition-colors border-b border-gray-700 ${!currentStore ? 'bg-green-500/10' : ''
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                                ALL
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-white">All Stores</p>
                                <p className="text-xs text-gray-500">View data from all locations</p>
                            </div>
                            {!currentStore && (
                                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                            )}
                        </div>
                    </button>

                    {stores.map(store => (
                        <button
                            key={store.id}
                            onClick={() => {
                                onSwitch(store);
                                setIsOpen(false);
                            }}
                            className={`w-full p-3 text-left hover:bg-gray-700 transition-colors border-b border-gray-700 ${currentStore?.id === store.id ? 'bg-green-500/10' : ''
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                                    {store.storeName.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-white">{store.storeName}</p>
                                    <p className="text-xs text-gray-500 truncate">{store.location}</p>
                                    {store.region && (
                                        <p className="text-xs text-gray-600">{store.region}</p>
                                    )}
                                </div>
                                {currentStore?.id === store.id && (
                                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                                )}
                            </div>
                        </button>
                    ))}

                    <button className="w-full p-3 text-left hover:bg-gray-700 transition-colors flex items-center gap-2 text-green-400">
                        <Plus size={16} />
                        <span className="text-sm font-medium">Add New Store</span>
                    </button>
                </div>
            )}

            {/* Backdrop */}
            {
                isOpen && (
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    ></div>
                )
            }
        </div >
    );
};
