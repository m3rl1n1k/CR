'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface DebugContextType {
  isDebug: boolean;
  toggleDebug: () => void;
}

const DebugContext = createContext<DebugContextType | undefined>(undefined);

const getInitialDebugState = (): boolean => {
    if (typeof window === 'undefined') {
        return false;
    }
    return localStorage.getItem('debugMode') === 'true';
}

export const DebugProvider = ({ children }: { children: ReactNode }) => {
    const [isDebug, setIsDebug] = useState<boolean>(getInitialDebugState);

    useEffect(() => {
        setIsDebug(getInitialDebugState());
    }, []);

    const toggleDebug = useCallback(() => {
        setIsDebug(prev => {
            const newState = !prev;
            if (typeof window !== 'undefined') {
                localStorage.setItem('debugMode', String(newState));
            }
            console.log(`Debug mode ${newState ? 'enabled' : 'disabled'}`);
            return newState;
        });
    }, []);

    const value = { isDebug, toggleDebug };

    return (
        <DebugContext.Provider value={value}>
            {children}
        </DebugContext.Provider>
    )
};

export const useDebug = (): DebugContextType => {
    const context = useContext(DebugContext);
    if (context === undefined) {
        throw new Error('useDebug must be used within a DebugProvider');
    }
    return context;
}
