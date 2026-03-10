import { useState } from 'react';
import { LoginFormData, RegisterFormData, User } from '../utils/types';

const useFormSubmit = (url: string, onSuccess?: (data: string | void) => void) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [response, setResponse] = useState<{ message: string } | null>();

    const submitForm = async (formData: RegisterFormData | LoginFormData | FormData, callback?: (data: { accessToken: string, user:User, exp: number}) => void) => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch(url, {
                method: 'POST',
                credentials: 'include',
                body: formData instanceof FormData ? formData : JSON.stringify(formData),
                headers: formData instanceof FormData ? {} : { 'Content-Type': 'application/json' },
            });
    
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Something went wrong');
            }
            setResponse(data);
            if (onSuccess) onSuccess(data);
            if (callback) callback(data);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
                throw err; // Re-throw the error to be caught in the component
            }
        } finally {
            setLoading(false);
        }
    };
    return { loading, error, response, submitForm };
};

export default useFormSubmit;