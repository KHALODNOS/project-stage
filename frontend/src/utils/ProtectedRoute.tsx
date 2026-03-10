import React, { useContext, useEffect } from 'react';
import {  useNavigate } from 'react-router-dom';
import { AuthContext } from '../store/context';




const ProtectedRoute: React.FC<{ children: React.JSX.Element }> = ({children})  => {
  const ctx = useContext(AuthContext)
  const navigate = useNavigate();

  const value =  children

  useEffect(() => {
    const checkToken = async () => {
      await ctx?.CheckAccessToken();
    };
    checkToken();
  }, [ctx?.CheckAccessToken, navigate]);

  return value;
};

export default ProtectedRoute;
