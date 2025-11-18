import React, { createContext, useContext, useState, useEffect } from 'react';
import type {LoginUser, UserResponse} from "../constants/types.ts";
import {checkAuthRequest} from "../net/HttpRequests.ts";
import {Constants} from "../constants/constants.ts";

interface AuthContextType {
    currentUser: UserResponse | null;
    isLoggedIn: boolean;
    login: (user: LoginUser) => Promise<void>;
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


    let isLoggedIn = currentUser !== null;


    const login = async (user: LoginUser) => {

        const response: Response = await fetch(`${Constants.SERVER_URL}/login`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(user)
        })

        const data = await response.json();

        if (response.ok && data.success){
            setCurrentUser(data.success);
            isLoggedIn = true;
            console.log("Logged in successfully");

        }else {
            alert("Login failed. Please check your credentials and try again.");
        }

    }

    return (
        <AuthContext.Provider value={{ currentUser, isLoggedIn, login }}>
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
