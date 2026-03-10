import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiUrl } from '../utils/constvar';
import { User } from '../utils/types';

export interface AuthContextType {
    token: string | null;
    user: User | null;
    expire: number | null;
    loading: boolean;
    login: (token: string, user: User, expire: number) => void;
    logout: () => void;
    CheckAccessToken: () => Promise<string | null | number>;
    Refresh: () => Promise<string | null>;
    updateUser: (userData: User) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.JSX.Element }> = ({ children }) => {


    const [token, setToken] = useState<string | null>(null);
    const [expire, setexpire] = useState<number | null>(null);
    const [user, setUser] = React.useState<User | null>(null);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const first = async () => {
            await Refresh()
        }
        first()
        console.log("set all values")
        setLoading(false);
    }, []);

    const login = async (token: string, user: User, expire: number,) => {
        setToken(token);
        setUser(user)
        setexpire(expire);
    };

    const logout = async () => {
        setToken(null);
        setUser(null)
        setexpire(null);

        const res = await fetch(`${apiUrl}/auth/logout`, {
            method: 'POST',
            credentials: 'include', // Important for sending cookies
        });

        console.log(res)
        navigate('/login');
    };
    const updateUser = (userData: User) => {
        setUser(userData);
    };
    const Refresh = async (): Promise<string | null> => {
        try {
            const response = await fetch(`${apiUrl}/auth/token`, {
                method: 'POST',
                credentials: 'include',
            });
            if (response.ok) {
                const data: { accessToken: string, user: User, exp: number, image: string } = await response.json();
                console.log("refresh token is not expired he will got another access token")
                await login(data.accessToken, data.user, data.exp);
                return data.accessToken; // Return the new access token
            }
            else if (response.status === 402) {
                console.log("Refresh token required")
                return null;
            }
            else {
                console.log("Invalid refresh token")
                await logout();
                return null;
            }
        } catch (error) {
            console.error('Error refreshing token:', error);
            await logout();
            return null;
        }
    };

    const CheckAccessToken = async () => {
        console.log(expire)
        if (expire !== null) {
            if (expire < Date.now() / 1000) {
                console.log("it's already login but access expired")
                return await Refresh();
            }
            else {
                console.log("he's still login")
                return token
            }
        }
        else {
            console.log("he never login")
            return 0
        }

    };
    return (
        <AuthContext.Provider value={{ token, user, expire, loading, login, logout, CheckAccessToken, Refresh, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};