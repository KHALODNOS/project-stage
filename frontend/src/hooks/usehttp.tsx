import { useCallback, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {apiUrl}  from "../utils/constvar.ts"
import { AuthContext } from '../store/context.tsx';

type optionsType = {
  method?: string;
  body?: string | FormData;
  headers?: { 'Content-Type'?: string; Authorization?: string };
};

const useHttp = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const navigate = useNavigate();
  const ctx = useContext(AuthContext);

  

  const sendData = useCallback(
    async function <novelorchapter>(
      endpoint: string,
      options: optionsType,
      successHandler?: (data?: novelorchapter) => void,
      navigated?:string,
      withtoken?:boolean
    ) {
      setIsLoading(true);

      if (withtoken) {
        let newtoken;
        if(ctx?.expire){
          newtoken=await ctx?.CheckAccessToken();
        }
        else{
          newtoken=await ctx?.Refresh();
        }
        console.log(newtoken); // This should now log the new token
        // Ensure token is available
        if (!newtoken) {
          setErrorMessage('Failed to get a valid token.');
          setIsLoading(false);
          return;
        }
        options.headers = {
          ...options.headers,
          'Authorization': `Bearer ${newtoken}`
        };
      }


      try {
        const url = apiUrl + endpoint;
    
        const response = await fetch(url, options);

        const data = await response.json();
        if (response.ok && successHandler) {
          successHandler(data);
          navigated? navigate(`${navigated}`):""
        } else {
          throw new Error(data.message);
        }
      } catch (err) {
        if (err instanceof Error) setErrorMessage(err.message);
      }

      setIsLoading(false);
    },
    []
  );

  return { sendData, isLoading, errorMessage, setErrorMessage };
};

export default useHttp;
