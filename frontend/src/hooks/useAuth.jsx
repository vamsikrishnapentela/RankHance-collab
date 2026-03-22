import { useState, useEffect, createContext, useContext } from 'react';
import { getCurrentUser, login as apiLogin, register as apiRegister, loginWithGoogle as apiGoogleLogin } from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('rankhance_token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const data = await getCurrentUser();
      setUser(data);
    } catch (err) {
      console.error("Failed to fetch user", err);
      localStorage.removeItem('rankhance_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const { token, user: userData } = await apiLogin(credentials);
    localStorage.setItem('rankhance_token', token);
    setUser(userData);
    return userData;
  };

  const register = async (userData) => {
    const referral = localStorage.getItem("referral");
    console.log("Sending referral:", referral); // 🔥 debug
    const { token, user: savedUser } = await apiRegister({
      ...userData,
      referredBy: referral || null
    });

    localStorage.setItem('rankhance_token', token);
    setUser(savedUser);
    return savedUser;
  };

  const googleLogin = async (tokenId) => {
    const referral = localStorage.getItem("referral");

    console.log("Sending referral (Google):", referral);

    const { token, user: userData } = await apiGoogleLogin(tokenId,);

    localStorage.setItem('rankhance_token', token);
    setUser(userData);

    return userData;
  };
  const logout = () => {
    localStorage.removeItem('rankhance_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isPaid: user?.isPaid || false, 
      loading, 
      login, 
      register, 
      googleLogin, 
      logout,
      refreshUser: fetchUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
