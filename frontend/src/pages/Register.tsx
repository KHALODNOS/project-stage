import React, { useContext, useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "react-datepicker/dist/react-datepicker.css";
import {
  FaUser,
  FaKey,
  FaEnvelope,
  FaImage,
  FaInfoCircle,
  FaPhone,
  FaCheckCircle,
  FaArrowLeft,
  FaMagic,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../utils/constvar.ts";
import "./datepicker-custom.css";
import { ToastContext } from "../components/message/ToastManager";
import Loader from "../components/Loader";
import { generatePassword } from "../utils/genratePassword.ts";

const Register: React.FC = () => {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const toastContext = useContext(ToastContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    emailOtp: "",
    phone: "",
    phoneOtp: "",
    profileImage: null as File | null,
    username: "",
    nickname: "",
    bio: "",
    birthday: "",
    age: "",
    adress: "",
    city: "",
  });

  const generatePasswordFn = () => {
    const pwd = generatePassword();
    setFormData((prev) => ({
      ...prev,
      password: pwd,
    }));
  };

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showPhoneOtpInput, setShowPhoneOtpInput] = useState(false);
  const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        toastContext?.addToast(
          "حجم الملف كبير جدًا. الحد الأقصى هو 1 ميجابايت",
          "error",
        );
        return;
      }
      setFormData((prev) => ({ ...prev, profileImage: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  // Step 1: Register Account
  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password || !formData.confirmPassword) {
      toastContext?.addToast("يرجى ملء جميع الحقول", "error");
      return;
    }
    if (!validateEmail(formData.email)) {
      toastContext?.addToast("البريد الإلكتروني غير صالح", "error");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toastContext?.addToast("كلمات المرور غير متطابقة", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/auth/register/step1`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const contentType = res.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        throw new Error(
          `Unexpected server response: ${res.status} ${res.statusText}`,
        );
      }

      if (!res.ok) throw new Error(data.message || "حدث خطأ ما");

      toastContext?.addToast(
        "تم إرسال رمز التحقق إلى بريدك الإلكتروني",
        "success",
      );
      nextStep();
    } catch (err: any) {
      toastContext?.addToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify Email OTP
  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.emailOtp) {
      toastContext?.addToast("يرجى إدخال رمز التحقق", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/auth/register/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp: formData.emailOtp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toastContext?.addToast("تم التحقق من البريد الإلكتروني", "success");
      nextStep();
    } catch (err: any) {
      toastContext?.addToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Step 3a: Submit Phone
  const handleStep3a = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.phone) {
      toastContext?.addToast("يرجى إدخال رقم الهاتف", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/auth/register/step3-phone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, phone: formData.phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toastContext?.addToast(
        "تم إنشاء رمز التحقق للهاتف. راجع شاشة البرمجة!",
        "info",
      );
      setShowPhoneOtpInput(true);
    } catch (err: any) {
      toastContext?.addToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Step 3b: Verify Phone OTP
  const handleStep3b = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.phoneOtp) {
      toastContext?.addToast("يرجى إدخال رمز الهاتف", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/auth/register/verify-phone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp: formData.phoneOtp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toastContext?.addToast("تم التحقق من الهاتف", "success");
      nextStep();
    } catch (err: any) {
      toastContext?.addToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Upload Photo
  const handleStep4 = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      const fData = new FormData();
      fData.append("email", formData.email);
      if (formData.profileImage) {
        fData.append("profileImage", formData.profileImage);
      }

      const res = await fetch(`${apiUrl}/auth/register/step4-photo`, {
        method: "POST",
        body: fData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toastContext?.addToast("تم رفع الصورة بنجاح", "success");
      nextStep();
    } catch (err: any) {
      toastContext?.addToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Step 5: Complete Profile
  const handleStep5 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.nickname) {
      toastContext?.addToast(
        "يرجى إدخال اسم المستخدم والاسم المستعار",
        "error",
      );
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/auth/register/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          username: formData.username,
          nickname: formData.nickname,
          bio: formData.bio,
          birthday: formData.birthday,
          adress: formData.adress,
          city: formData.city,
          age: formData.age,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toastContext?.addToast("اكتمل التسجيل بنجاح!", "success");
      nextStep();
    } catch (err: any) {
      toastContext?.addToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Auto-redirect after Step 6
  useEffect(() => {
    if (step === 6) {
      const timer = setTimeout(() => {
        navigate("/login");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [step, navigate]);

  const steps = [
    { id: 1, title: "الحساب" },
    { id: 2, title: "البريد" },
    { id: 3, title: "الهاتف" },
    { id: 4, title: "الصورة" },
    { id: 5, title: "المعلومات" },
    { id: 6, title: "تم" },
  ];

  return (
    <div
      dir="rtl"
      className="flex flex-col grow-[2.3] min-w-0 items-center font-NotoKufi py-10 px-4"
    >
      <div className="bg-[var(--color-bg)] w-full max-w-2xl rounded-3xl p-6 sm:p-10 shadow-2xl relative border border-white/5">
        {/* Progress Bar */}
        <div className="mb-12 flex items-center justify-between px-2">
          {steps.map((s, i) => (
            <React.Fragment key={s.id}>
              <div className="flex flex-col items-center relative z-10">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${step >= s.id
                      ? "bg-[#5da397] text-white"
                      : "bg-[#454545] text-gray-400"
                    } ${step === s.id ? "ring-4 ring-[#5da397]/20 scale-110" : ""}`}
                >
                  {step > s.id ? <FaCheckCircle /> : s.id}
                </div>
                <span
                  className={`mt-2 text-[10px] font-medium hidden sm:block ${step >= s.id ? "text-[var(--color-text)]" : "text-gray-500"}`}
                >
                  {s.title}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 bg-[#454545] relative -mt-6 sm:-mt-5">
                  <div
                    className="absolute inset-0 bg-[#5da397] transition-all duration-500"
                    style={{ width: step > s.id ? "100%" : "0%" }}
                  ></div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center gap-4">
            <Loader smaller={true} />
            <p className="text-[#5da397] animate-pulse">جاري المعالجة...</p>
          </div>
        ) : (
          <div className="transition-all duration-500 transform animate-fadeIn">
            {step === 1 && (
              <form
                onSubmit={handleStep1}
                autoComplete="on"
                className="space-y-6"
              >
                <div className="text-center mb-10">
                  <h2 className="text-2xl font-bold text-[var(--color-text)]">
                    إنشاء حساب جديد
                  </h2>
                  <p className="text-sm text-gray-400 mt-2">
                    ابدأ بإدخال معلوماتك الأساسية
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="relative group">
                    <label className="text-xs text-gray-400 mb-2 block px-1">
                      البريد الإلكتروني
                    </label>
                    <div className="relative">
                      <FaEnvelope className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#5da397] transition-colors" />
                      <input
                        autoComplete="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full bg-[#2a2a2a] border-none rounded-2xl py-3.5 pr-12 pl-4 text-white focus:ring-2 focus:ring-[#5da397] transition-all outline-none"
                        placeholder="example@mail.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="relative group">
                    <div className="flex items-center justify-between mb-2 px-1">
                      <label className="text-xs text-gray-400">
                        كلمة المرور
                      </label>
                      <button
                        type="button"
                        onClick={generatePasswordFn}
                        className="text-[10px] bg-[#5da397]/10 text-[#5da397] px-2.5 py-1 rounded-full border border-[#5da397]/20 hover:bg-[#5da397]/20 transition-all flex items-center gap-1.5"
                      >
                        <FaMagic className="text-[9px]" />
                        توليد كلمة سر
                      </button>
                    </div>
                    <div className="relative">
                      <FaKey className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#5da397]" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        autoComplete="new-password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full bg-[#2a2a2a] border-none rounded-2xl py-3.5 pr-12 pl-12 text-white focus:ring-2 focus:ring-[#5da397] transition-all outline-none"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={togglePassword}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#5da397] transition-colors"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  <div className="relative group">
                    <label className="text-xs text-gray-400 mb-2 block px-1">
                      تأكيد كلمة المرور
                    </label>
                    <div className="relative">
                      <FaKey className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#5da397]" />
                      <input
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full bg-[#2a2a2a] border-none rounded-2xl py-3.5 pr-12 pl-12 text-white focus:ring-2 focus:ring-[#5da397] transition-all outline-none"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={togglePassword}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#5da397] transition-colors"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#5da397] to-[#4d867d] text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-[#5da397]/20 transition-all transform hover:scale-[1.01] flex items-center justify-center gap-2 mt-4"
                >
                  التالي <FaArrowLeft />
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleStep2} className="space-y-6 text-center">
                <div className="mb-8">
                  <div className="w-20 h-20 bg-[#5da397]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaEnvelope className="text-3xl text-[#5da397]" />
                  </div>
                  <h2 className="text-2xl font-bold text-[var(--color-text)]">
                    تحقق من بريدك
                  </h2>
                  <p className="text-sm text-gray-400 mt-2">
                    لقد أرسلنا رمزاً إلى{" "}
                    <span className="text-[#5da397]">{formData.email}</span>
                  </p>
                </div>
                <div className="flex justify-center gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    name="emailOtp"
                    value={formData.emailOtp}
                    onChange={handleChange}
                    className="w-full max-w-[240px] text-center text-4xl font-mono tracking-[0.4em] bg-[#2a2a2a] border-none rounded-2xl py-4 text-white focus:ring-2 focus:ring-[#5da397] outline-none"
                    placeholder="000000"
                    required
                  />
                </div>
                <div className="flex gap-4 mt-8">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 bg-[#454545] hover:bg-[#555] text-white py-4 rounded-2xl transition-all"
                  >
                    رجوع
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] bg-[#5da397] text-white font-bold py-4 rounded-2xl shadow-lg transition-all"
                  >
                    تحقق الآن
                  </button>
                </div>
              </form>
            )}

            {step === 3 && (
              <form
                onSubmit={showPhoneOtpInput ? handleStep3b : handleStep3a}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-[#5da397]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaPhone className="text-3xl text-[#5da397]" />
                  </div>
                  <h2 className="text-2xl font-bold text-[var(--color-text)]">
                    توثيق الهاتف
                  </h2>
                  <p className="text-sm text-gray-400 mt-2">
                    يرجى تأكيد رقم هاتفك لضمان حماية أفضل
                  </p>
                </div>

                {!showPhoneOtpInput ? (
                  <div className="space-y-6">
                    <div className="relative group">
                      <label className="text-xs text-gray-400 mb-2 block px-1">
                        رقم الهاتف
                      </label>
                      <div className="relative">
                        <FaPhone className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#5da397]" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full bg-[#2a2a2a] border-none rounded-2xl py-3.5 pr-12 pl-4 text-white focus:ring-2 focus:ring-[#5da397] transition-all outline-none"
                          placeholder="05xxxxxxxx"
                          required
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-[#5da397] text-white font-bold py-4 rounded-2xl shadow-lg transition-all"
                    >
                      إرسال الرمز
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6 text-center">
                    <div className="space-y-2">
                      <label className="text-xs text-[#5da397] font-bold">
                        أدخل الرمز المطبوع في شاشة السيرفر
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        name="phoneOtp"
                        value={formData.phoneOtp}
                        onChange={handleChange}
                        className="w-full max-w-[240px] text-center text-4xl font-mono tracking-[0.4em] bg-[#2a2a2a] border-none rounded-2xl py-4 text-white focus:ring-2 focus:ring-[#5da397] outline-none mx-auto block"
                        placeholder="000000"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-[#5da397] text-white font-bold py-4 rounded-2xl shadow-lg transition-all"
                    >
                      تأكيد الهاتف
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPhoneOtpInput(false)}
                      className="text-xs text-gray-500 hover:text-[#5da397] underline"
                    >
                      تغيير رقم الهاتف
                    </button>
                  </div>
                )}
              </form>
            )}

            {step === 4 && (
              <form
                onSubmit={handleStep4}
                className="space-y-6 flex flex-col items-center"
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-[var(--color-text)]">
                    صورتك الشخصية
                  </h2>
                  <p className="text-sm text-gray-400 mt-2">
                    اضف صورة تعبر عنك (اختياري)
                  </p>
                </div>
                <div className="relative group">
                  <div
                    className={`w-40 h-40 rounded-full border-4 ${imagePreview ? "border-[#5da397]" : "border-[#454545]"} overflow-hidden bg-[#2a2a2a] flex items-center justify-center transition-all cursor-pointer relative`}
                  >
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        className="w-full h-full object-cover"
                        alt="preview"
                      />
                    ) : (
                      <div className="text-center">
                        <FaImage className="text-4xl text-gray-500 mb-2 mx-auto" />
                        <span className="text-[10px] text-gray-500">
                          انقر للاختيار
                        </span>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    id="imageInput"
                    onChange={handleImageChange}
                    className="hidden"
                    accept="image/*"
                  />
                  <label
                    htmlFor="imageInput"
                    className="absolute bottom-1 right-1 bg-[#5da397] w-10 h-10 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-xl"
                  >
                    <FaUser className="text-white text-sm" />
                  </label>
                </div>
                <div className="w-full space-y-4 pt-4">
                  <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
                    <FaInfoCircle /> يفضل استخدام صور بحجم أقل من 1 ميجابايت
                  </p>
                  <button
                    type="submit"
                    className="w-full bg-[#5da397] text-white font-bold py-4 rounded-2xl shadow-lg transition-all transform hover:scale-[1.01]"
                  >
                    {formData.profileImage ? "حفظ واستمرار" : "تخطي هذه الخطوة"}
                  </button>
                </div>
              </form>
            )}

            {step === 5 && (
              <form onSubmit={handleStep5} className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-[var(--color-text)]">
                    باقي القليل...
                  </h2>
                  <p className="text-sm text-gray-400">
                    أخبرنا بالمزيد عنك لنكمل ملفك
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative group">
                      <label className="text-xs text-gray-400 mb-2 block px-1">
                        اسم المستخدم (@)
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        className="w-full bg-[#2a2a2a] border-none rounded-2xl py-3 px-4 text-white focus:ring-2 focus:ring-[#5da397] outline-none"
                        placeholder="john_doe"
                      />
                    </div>
                    <div className="relative group">
                      <label className="text-xs text-gray-400 mb-2 block px-1">
                        الاسم المستعار
                      </label>
                      <input
                        type="text"
                        name="nickname"
                        value={formData.nickname}
                        onChange={handleChange}
                        required
                        className="w-full bg-[#2a2a2a] border-none rounded-2xl py-3 px-4 text-white focus:ring-2 focus:ring-[#5da397] outline-none"
                        placeholder="John"
                      />
                    </div>
                  </div>
                  <div className="relative group">
                    <label className="text-xs text-gray-400 mb-2 block px-1">
                      نبذة قصيرة
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows={2}
                      className="w-full bg-[#2a2a2a] border-none rounded-2xl py-3 px-4 text-white focus:ring-2 focus:ring-[#5da397] outline-none resize-none"
                      placeholder="مهتم بالروايات..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-400 mb-2 block px-1">
                        تاريخ الميلاد
                      </label>
                      <input
                        type="date"
                        name="birthday"
                        value={formData.birthday}
                        onChange={handleChange}
                        className="w-full bg-[#2a2a2a] border-none rounded-2xl py-3 px-4 text-white focus:ring-2 focus:ring-[#5da397] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-2 block px-1">
                        المدينة
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full bg-[#2a2a2a] border-none rounded-2xl py-3 px-4 text-white focus:ring-2 focus:ring-[#5da397] outline-none"
                        placeholder="الرياض"
                      />
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#5da397] to-[#4d867d] text-white font-bold py-4 rounded-2xl shadow-lg transition-all mt-4"
                >
                  إتمام التسجيل
                </button>
              </form>
            )}

            {step === 6 && (
              <div className="py-10 text-center space-y-8 animate-bounceIn">
                <div className="flex justify-center relative">
                  <div className="w-24 h-24 bg-[#5da397]/20 rounded-full flex items-center justify-center text-[#5da397]">
                    <FaCheckCircle className="text-6xl animate-scale" />
                  </div>
                  <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-[#5da397] animate-ping opacity-20 mx-auto"></div>
                </div>
                <div className="space-y-3">
                  <h2 className="text-3xl font-bold text-white">
                    تم التسجيل بنجاح!
                  </h2>
                  <p className="text-gray-400 px-6">
                    أهلاً بك في عائلتنا. سيتم توجيهك لصفحة تسجيل الدخول الآن
                    للدخول لعالمك الجديد.
                  </p>
                </div>
                <button
                  onClick={() => navigate("/login")}
                  className="bg-[#5da397] text-[#212121] px-12 py-4 rounded-full font-bold hover:scale-105 transition-all shadow-xl"
                >
                  تسجيل الدخول الآن
                </button>
              </div>
            )}
          </div>
        )}

        {/* Footer Link */}
        {step < 6 && (
          <div className="mt-10 pt-6 border-t border-white/5 text-center">
            <p className="text-sm text-gray-500">
              لديك حساب بالفعل؟{" "}
              <span
                onClick={() => navigate("/login")}
                className="text-[#5da397] font-bold cursor-pointer hover:underline"
              >
                سجل دخولك
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
