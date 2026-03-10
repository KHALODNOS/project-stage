import React, { useState,useEffect,useContext } from 'react';
import { FaRegUser, FaUser, FaKey } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import useFormSubmit from '../hooks/useFormSubmit';
import { LoginFormData, User } from '../utils/types';
import {apiUrl} from "../utils/constvar"
import { AuthContext } from '../store/context';
import { ToastContext } from '../components/message/ToastManager';


const Login: React.FC = () => {
  const toastContext = useContext(ToastContext);

    const ctx = useContext(AuthContext)
    const [formData, setFormData] = useState<LoginFormData>({ username: '', password: '' });
    const [validationError, setValidationError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { loading, response, submitForm } = useFormSubmit(`${apiUrl}/auth/login`, () => {
        navigate('/')
    });

    const token =ctx?.token
    if (token) {
        navigate('/');
    }
    useEffect(() => {
        if (token) {
            navigate('/');
        }
    }, [navigate,token]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });    
        setValidationError(null);  // Reset validation error on change
    };
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        submitForm(formData, (data: { accessToken:string ,user:User , exp:number }) => {
            ctx?.login(data.accessToken,data.user,data.exp)
            navigate('/');
        }).catch((error: Error) => {
            toastContext?.addToast(error.message, 'error');
        });
    };

    return (
        <div dir="rtl" className="mt-7 flex flex-col gap-5 grow-[2.3] min-w-0 items-center font-NotoKufi">
            <div className="bg-[var(--color-bg)] w-full sm:w-11/12 md:w-3/4 lg:w-2/3 xl:w-2/3 rounded-[5px] p-4 sm:p-6 md:p-8">
                <div className="header relative text-center mb-7">
                    <div className="w-16 h-16 text-center leading-9 text-base rounded-[50%] bg-[#5da397] text-[var(--color-bg2)] absolute top-[-60px] left-2/4 -translate-x-2/4">
                        <FaRegUser className="inline-block text-3xl mt-4" />
                    </div>
                    <div className="text-xl pt-4 font-medium text-[var(--color-text)]">تسجيل الدخول</div>
                </div>
                <form className="flex flex-col justify-center items-center" method="post" onSubmit={handleSubmit}>
                    <div className="user relative w-3/4 mb-4">
                        <label className="text-sm text-[var(--color-text)] block mb-2 w-fit font-elmessiri" htmlFor="username">اسم المستخدم</label>
                        <FaUser className="bottom-[11px] right-3 absolute text-[#c3e0db] text-sm" />
                        <input className="bg-[#454545] h-9 text-sm font-normal rounded-2xl px-8 w-full border-[none] focus:text-[#ffffff] focus:shadow-[0_0_0_0.2rem_rgba(0,123,255,0.25)] focus:outline-none" id="username" name="username" type="text" value={formData.username} onChange={handleChange} required />
                    </div>
                    <div className="password relative w-3/4 mb-4">
                        <label className="text-sm text-[var(--color-text)] block mb-2 w-fit font-elmessiri" htmlFor="password">كلمة المرور</label>
                        <FaKey className="bottom-[11px] right-3 absolute text-[#c3e0db] text-sm" />
                        <input className="bg-[#454545] h-9 text-sm font-normal rounded-2xl px-8 w-full border-[none] focus:text-[#ffffff] focus:shadow-[0_0_0_0.2rem_rgba(0,123,255,0.25)] focus:outline-none" id="password" name="password" type="password" value={formData.password} onChange={handleChange} required />
                    </div>
                    {loading && <p>Loading...</p>}
                    {validationError && <p className="text-red-500">{validationError}</p>}
                    {response && <p className="text-green-500">{response.message}</p>}
                    <input className="text-[--color-bg2] rounded-2xl py-2 px-5 mt-5 cursor-pointer w-3/4 bg-[#5da397]" type="submit" value="دخول" />
                </form>
                <div className="register bg-black py-3 px-5 rounded-3xl mt-7 text-sm w-3/4 text-center mx-auto">
                    <span className='text-[#888]'>
                    ليس لديك حساب؟
                    <Link to="/register" className='text-white'> أنشئ حساب جديد</Link>
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Login;
