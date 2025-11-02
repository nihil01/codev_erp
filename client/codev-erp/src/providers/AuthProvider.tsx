import React, { createContext, useContext, useState, useEffect } from 'react';
import type {UserResponse} from "../constants/types.ts";
import {checkAuthRequest} from "../net/HttpRequests.ts";

interface AuthContextType {
    currentUser: UserResponse | null;
    isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [currentUser, setCurrentUser] = useState<UserResponse | null>(null);

    useEffect(() => {
        checkAuthRequest().then(res => {
            if (res) {
                setCurrentUser(res);
            } else {
                setCurrentUser(null);
            }
        })
    }, []);


    const isLoggedIn = currentUser !== null;

    return (
        <AuthContext.Provider value={{ currentUser, isLoggedIn }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}