const Footer = () => {
    return (
        <div dir="rtl" className='footer mt-10'>
            <div className='foo1 bg-[var(--color-main)] py-2 flex justify-center gap-5 text-[15px] text-white'>
                {/* <Link to="">سياسة الخصوصية</Link>
                <Link to="">من نحن</Link>
                <Link to="">معلومات الإتصال</Link> */}
            </div>
            <div className='foo2 text-[#ccc] bg-[#222222] flex flex-col items-center py-7'>
                <p className=' text-[13px] sm:text-[15px]'>حقوق النشر © 2024 فانتاسي للترجمات. كل الحقوق محفوظة</p>
                <p className=' leading-5 text-center text-[11px] sm:text-[13px] pt-3 px-3'>إخلاء المسؤولية: لا يقوم هذا الموقع fantasy Translations بتخزين أي ملفات على خادمه. يتم توفير جميع المحتويات من قبل أطراف ثالثة غير تابعة.</p>
            </div>
        </div>
    );
}

export default Footer;
