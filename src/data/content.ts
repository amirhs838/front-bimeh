/**
 * Single source of truth for ALL user-visible copy (Scroll 1).
 * Edit strings here — no copy is hardcoded in components.
 */
export const content = {
  header: {
    register: "ثبت نام",
    menuAria: "منو",
    supportAria: "پشتیبانی",
    homeAria: "بیمه شو — صفحه اصلی",
  },
  hero: {
    headline: "هوشمند بیمه شو",
    bubble: "سلام؛ بگو چه بیمه ای\nمیخوای؟",
    mascotAlt: "ماسکات بیمه شو",
    mascotAria: "شروع گفتگو با هوش مصنوعی",
    bubbleAria: "شروع گفتگو با هوش مصنوعی",
    typingAria: "در حال نوشتن",
  },
  badge: "خرید اقساطی",
  chatBar: {
    placeholder: "سوال خود را اینجا بنویسید...",
    sendAria: "ارسال",
    sparklesAria: "هوش مصنوعی",
  },
  selectionBar: (n: string) => `ادامه با ${n} بیمه`,
  quote: {
    title: "استعلام و خرید اقساطی",
    subtitle: "بیمه‌های انتخاب‌شده شما",
    empty: "هنوز بیمه‌ای انتخاب نکرده‌اید. از صفحه اصلی کارت‌های مورد نظر را تیک بزنید.",
    submit: "ثبت درخواست استعلام",
    done: "درخواست شما ثبت شد؛ کارشناسان ما به‌زودی با شما تماس می‌گیرند.",
    back: "بازگشت",
  },
  register: {
    title: "ثبت نام",
    phoneLabel: "شماره موبایل",
    phonePlaceholder: "۰۹۱۲۳۴۵۶۷۸۹",
    phoneHint: "شماره موبایل ایرانی (۰۹xxxxxxxxx)",
    sendCode: "ارسال کد",
    otpLabel: "کد تایید پیامک‌شده",
    otpHintMock: "این یک مرحله آزمایشی است — کد: ۱۲۳۴",
    verify: "تایید و ادامه",
    wrongCode: "کد وارد شده صحیح نیست.",
    invalidPhone: "شماره موبایل معتبر نیست.",
    successTitle: "ثبت نام انجام شد",
    successDesc: "به خانواده بیمه شو خوش آمدید.",
    back: "بازگشت",
  },
  insurance: {
    soonTitle: "این بخش به‌زودی فعال می‌شود",
    soonDesc: "برای این بیمه هنوز صفحه اختصاصی آماده نشده است. می‌توانید همین حالا سوال‌تان را از دستیار هوشمند بپرسید.",
    askAI: "پرسش از دستیار هوشمند",
    back: "بازگشت",
  },
  drawer: {
    title: "منو",
    closeAria: "بستن منو",
  },
  support: {
    title: "پشتیبانی",
    desc: "هر ساعتی که لازم داشت کنار شما هستیم.",
    call: "تماس تلفنی",
    chatWithAI: "چت با هوش مصنوعی",
    closeAria: "بستن پشتیبانی",
  },
  chat: {
    title: "چت با هوش مصنوعی",
    closeAria: "بستن چت",
    inputPlaceholder: "پیام خود را بنویسید...",
    sendAria: "ارسال پیام",
    errorText: "ارسال پیام ناموفق بود.",
    retry: "تلاش دوباره",
  },
} as const;
