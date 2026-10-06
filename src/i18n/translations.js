// ── Sirr al-Huruf — Complete Multilingual Translations ──
// Languages: ml (Malayalam), en (English), ar (Arabic)
// All user-facing strings in one file for easy maintenance

const translations = {
  // ── Welcome / Onboarding ──
  welcome_title: {
    ml: "سرّ الحروف",
    en: "سرّ الحروف",
    ar: "سرّ الحروف"
  },
  welcome_subtitle: {
    ml: "Sirr al-Huruf",
    en: "Sirr al-Huruf",
    ar: "سر الحروف"
  },
  welcome_caption: {
    ml: "ജീവിതത്തിലെ ചോദ്യങ്ങൾക്കും മനസ്സിലെ ആശങ്കകൾക്കും അറിവിന്റെയും വ്യക്തതയുടെയും വെളിച്ചം പകരുന്ന നിങ്ങളുടെ സ്വന്തം വഴികാട്ടി.",
    en: "Your personal guide, bringing knowledge, clarity, and direction to life's questions and the concerns of your heart.",
    ar: "دليلك الشخصي الذي يمنحك المعرفة والوضوح والإرشاد للإجابة عن تساؤلات الحياة وطمأنة القلب."
  },
  welcome_description: {
    ml: "മാന്ത്രിക ചതുരങ്ങൾ, ഗ്രഹ സമയങ്ങൾ, പവിത്ര അക്ഷര ശാസ്ത്രങ്ങൾ എന്നിവയുടെ ഗൂഢ വിജ്ഞാനകോശത്തിലേക്ക് സ്വാഗതം.",
    en: "Welcome to the occult encyclopedia of magick squares, planetary hours, and sacred letter sciences.",
    ar: "مرحباً بك في الموسوعة الغامضة لمربعات السحر وساعات الكواكب وعلوم الحروف المقدسة."
  },

  // ── Onboarding Steps ──
  get_started: { ml: "ആരംഭിക്കുക", en: "Get Started", ar: "ابدأ الآن" },
  already_have_account: { ml: "ഇതിനകം അക്കൗണ്ട് ഉണ്ടോ?", en: "Already have an account?", ar: "هل لديك حساب بالفعل؟" },
  sign_in: { ml: "സൈൻ ഇൻ", en: "Sign in", ar: "تسجيل الدخول" },
  enter_email: { ml: "ഇമെയിൽ നൽകുക", en: "Enter your email", ar: "أدخل بريدك الإلكتروني" },
  email_address: { ml: "ഇമെയിൽ വിലാസം", en: "Email Address", ar: "البريد الإلكتروني" },
  send_code: { ml: "പരിശോധനാ കോഡ് അയയ്ക്കുക", en: "Send Verification Code", ar: "إرسال رمز التحقق" },
  sending: { ml: "അയയ്ക്കുന്നു...", en: "Sending...", ar: "جاري الإرسال..." },
  code_sent: { ml: "പരിശോധനാ കോഡ് അയച്ചു", en: "Verification Code Sent", ar: "تم إرسال رمز التحقق" },
  code_sent_desc: { ml: "6 അക്ക കോഡിനായി ഇമെയിൽ പരിശോധിക്കുക", en: "Check your email for the 6-digit code", ar: "تحقق من بريدك الإلكتروني للرمز المكون من 6 أرقام" },
  enter_code: { ml: "പരിശോധനാ കോഡ് നൽകുക", en: "Enter verification code", ar: "أدخل رمز التحقق" },
  code_sent_to: { ml: "കോഡ് ഇതിലേക്ക് അയച്ചു", en: "Code sent to", ar: "تم إرسال الرمز إلى" },
  verification_code: { ml: "പരിശോധനാ കോഡ്", en: "Verification Code", ar: "رمز التحقق" },
  verify_enter: { ml: "പരിശോധിച്ച് പ്രവേശിക്കുക", en: "Verify & Enter", ar: "تحقق وادخل" },
  verifying: { ml: "പരിശോധിക്കുന്നു...", en: "Verifying...", ar: "جاري التحقق..." },
  resend_code: { ml: "കോഡ് വീണ്ടും അയയ്ക്കുക", en: "Resend Code", ar: "إعادة إرسال الرمز" },
  change_email: { ml: "ഇമെയിൽ മാറ്റുക", en: "Change email", ar: "تغيير البريد الإلكتروني" },
  welcome_account_ready: { ml: "സ്വാഗതം!", en: "Welcome!", ar: "مرحباً!" },
  account_ready: { ml: "നിങ്ങളുടെ അക്കൗണ്ട് തയ്യാറാണ്.", en: "Your account is ready.", ar: "حسابك جاهز." },
  unable_send_otp: { ml: "OTP അയയ്ക്കാൻ കഴിഞ്ഞില്ല. വീണ്ടും ശ്രമിക്കുക.", en: "Unable to send OTP. Please try again.", ar: "تعذر إرسال رمز التحقق. يرجى المحاولة مرة أخرى." },
  verification_failed: { ml: "പരിശോധന പരാജയപ്പെട്ടു. വീണ്ടും ശ്രമിക്കുക.", en: "Verification failed. Please try again.", ar: "فشل التحقق. يرجى المحاولة مرة أخرى." },
  resend_failed: { ml: "OTP വീണ്ടും അയയ്ക്കുന്നതിൽ പരാജയപ്പെട്ടു", en: "Failed to resend OTP", ar: "فشل إعادة إرسال رمز التحقق" },
  error_title: { ml: "പിശക്", en: "Error", ar: "خطأ" },

  // ── Navigation ──
  nav_home: { ml: "ഹോം", en: "Home", ar: "الرئيسية" },
  nav_abjad: { ml: "അബ്ജദ്", en: "Abjad", ar: "أبجد" },
  nav_mizaan: { ml: "മീസാൻ", en: "Mizan", ar: "الميزان" },
  nav_vefk: { ml: "വഫ്ക്", en: "Vefk", ar: "الوفق" },
  nav_anasir: { ml: "അനാസിർ", en: "Anasir", ar: "العناصر" },
  nav_hadim: { ml: "ഖാദിം", en: "Khadim", ar: "الخادم" },
  nav_bast: { ml: "ബസ്ത്", en: "Bast", ar: "البسط" },
  nav_faal: { ml: "ഫാൽ", en: "Faal", ar: "الفأل" },
  nav_plants: { ml: "സസ്യങ്ങൾ", en: "Plants", ar: "النباتات" },
  nav_jinn: { ml: "ജിൻ", en: "Jinn", ar: "الجن" },
  nav_names: { ml: "പേരുകൾ", en: "Names", ar: "الأسماء" },
  nav_astro: { ml: "നക്ഷത്രം", en: "Astro", ar: "الفلك" },
  nav_support: { ml: "സഹായം", en: "Support", ar: "الدعم" },
  nav_admin: { ml: "അഡ്മിൻ", en: "Admin", ar: "المشرف" },
  nav_settings: { ml: "ക്രമീകരണങ്ങൾ", en: "Settings", ar: "الإعدادات" },

  // ── Page Titles ──
  page_home: { ml: "ഹോം", en: "Home", ar: "الرئيسية" },
  page_abjad: { ml: "അബ്ജദ് കബീർ", en: "Abjad Kabir", ar: "أبجد كبير" },
  page_mizaan: { ml: "മീസാൻ 9", en: "Mizan 9", ar: "الميزان 9" },
  page_vefk: { ml: "വെഫ്കിൻ യാപിലിഷി", en: "Vefkin Yapilisi", ar: "صنع الوفق" },
  page_magic_sqayer: { ml: "മാജിക് സ്ക്വയർ", en: "Magic Sqayer", ar: "المربع السحري" },
  page_anasir: { ml: "അനാസിർ", en: "Anasir", ar: "العناصر" },
  page_hadim: { ml: "ഖാദിം", en: "Khadim", ar: "الخادم" },
  page_bast: { ml: "ബസ്തുൽ ഹുറൂഫ്", en: "Bastul Huroof", ar: "بسط الحروف" },
  page_faal_hasrath: { ml: "ഫാൽ ഹസ്രത്ത്", en: "Faal Hasrath", ar: "فأل الحضرة" },
  page_plants: { ml: "സസ്യങ്ങൾ", en: "Plants", ar: "النباتات" },
  page_evil_jinn: { ml: "ദുഷ്ട ജിന്നുകൾ", en: "Evil Jinn", ar: "الجن الشرير" },
  page_holy_names: { ml: "പവിത്ര നാമങ്ങൾ", en: "Magical Holy Names", ar: "الأسماء المقدسة" },
  page_astro_clock: { ml: "നക്ഷത്ര ഘടികാരം", en: "Astro Clock", ar: "ساعة الفلك" },

  // ── Support Hub ──
  support_title: { ml: "സഹായ കേന്ദ്രം", en: "Support Center", ar: "مركز الدعم" },
  support_chat: { ml: "ചാറ്റ്", en: "Chat", ar: "محادثة" },
  support_voice: { ml: "ശബ്ദ സന്ദേശം", en: "Voice Message", ar: "رسالة صوتية" },
  support_ticket: { ml: "ടിക്കറ്റ്", en: "Ticket", ar: "تذكرة" },
  support_brand: { ml: "Sirr al-Huruf സഹായം", en: "Sirr al-Huruf Support", ar: "دعم سر الحروف" },

  // ── Customer Service ──
  cs_title: { ml: "ഉപഭോക്തൃ സേവനം", en: "Customer Service", ar: "خدمة العملاء" },
  cs_name: { ml: "പേര്", en: "Name", ar: "الاسم" },
  cs_mobile: { ml: "മൊബൈൽ", en: "Mobile", ar: "الجوال" },
  cs_email: { ml: "ഇമെയിൽ", en: "Email", ar: "البريد الإلكتروني" },
  cs_category: { ml: "വിഭാഗം", en: "Category", ar: "الفئة" },
  cs_subject: { ml: "വിഷയം", en: "Subject", ar: "الموضوع" },
  cs_message: { ml: "സന്ദേശം", en: "Message", ar: "الرسالة" },
  cs_submit: { ml: "സമർപ്പിക്കുക", en: "Submit", ar: "إرسال" },
  cs_attachments: { ml: "അറ്റാച്ച്മെന്റുകൾ", en: "Attachments", ar: "المرفقات" },
  cs_recording: { ml: "റെക്കോർഡിംഗ്...", en: "Recording...", ar: "جاري التسجيل..." },
  cs_play: { ml: "പ്ലേ ചെയ്യുക", en: "Play", ar: "تشغيل" },

  // ── Dashboard / Admin ──
  dashboard_title: { ml: "ഡാഷ്ബോർഡ്", en: "Dashboard", ar: "لوحة التحكم" },
  dashboard_users: { ml: "ഉപയോക്താക്കൾ", en: "Users", ar: "المستخدمون" },
  dashboard_permissions: { ml: "അനുമതികൾ", en: "Permissions", ar: "الأذونات" },
  dashboard_subscriptions: { ml: "സബ്സ്ക്രിപ്ഷനുകൾ", en: "Subscriptions", ar: "الاشتراكات" },
  dashboard_audit: { ml: "ഓഡിറ്റ് ലോഗ്", en: "Audit Log", ar: "سجل التدقيق" },
  dashboard_settings: { ml: "ക്രമീകരണങ്ങൾ", en: "Settings", ar: "الإعدادات" },
  dashboard_security: { ml: "സുരക്ഷ", en: "Security", ar: "الأمان" },

  // ── Access / Permissions ──
  access_locked: { ml: "ഈ പേജ് ലോക്ക് ചെയ്തിരിക്കുന്നു", en: "This Page is Locked", ar: "هذه الصفحة مقفلة" },
  access_denied: { ml: "പ്രവേശനം നിഷേധിച്ചു", en: "Access Denied", ar: "تم رفض الوصول" },
  access_expired: { ml: "പ്രവേശനം കാലഹരണപ്പെട്ടു", en: "Access Expired", ar: "انتهت صلاحية الوصول" },
  access_need_subscription: { ml: "ഈ പേജ് ആക്സസ് ചെയ്യാൻ സബ്സ്ക്രിപ്ഷൻ ആവശ്യമാണ്", en: "A subscription is required to access this page", ar: "يلزم اشتراك للوصول إلى هذه الصفحة" },
  access_request: { ml: "പ്രവേശനം അഭ്യർത്ഥിക്കുക", en: "Request Access", ar: "طلب الوصول" },
  access_subscribe: { ml: "സബ്സ്ക്രൈബ് ചെയ്യുക", en: "Subscribe Now", ar: "اشترك الآن" },

  // ── Subscription ──
  sub_title: { ml: "എന്റെ സബ്സ്ക്രിപ്ഷൻ", en: "My Subscription", ar: "اشتراكي" },
  sub_active: { ml: "സജീവം", en: "Active", ar: "نشط" },
  sub_expired: { ml: "കാലഹരണപ്പെട്ടു", en: "Expired", ar: "منتهي" },
  sub_pending: { ml: "തീരുമാനത്തിനായി കാത്തിരിക്കുന്നു", en: "Pending", ar: "قيد الانتظار" },
  sub_lifetime: { ml: "ആജീവനാന്തം", en: "Lifetime", ar: "مدى الحياة" },
  sub_1month: { ml: "1 മാസം", en: "1 Month", ar: "شهر واحد" },
  sub_3months: { ml: "3 മാസം", en: "3 Months", ar: "3 أشهر" },
  sub_6months: { ml: "6 മാസം", en: "6 Months", ar: "6 أشهر" },
  sub_12months: { ml: "12 മാസം", en: "12 Months", ar: "12 شهر" },
  sub_none: { ml: "ഒന്നുമില്ല", en: "None", ar: "لا يوجد" },
  sub_expiry: { ml: "കാലഹരണ തീയതി", en: "Expiry Date", ar: "تاريخ الانتهاء" },
  sub_pages: { ml: "ലഭ്യമായ പേജുകൾ", en: "Available Pages", ar: "الصفحات المتاحة" },

  // ── Common Buttons ──
  btn_save: { ml: "സംരക്ഷിക്കുക", en: "Save", ar: "حفظ" },
  btn_cancel: { ml: "റദ്ദാക്കുക", en: "Cancel", ar: "إلغاء" },
  btn_delete: { ml: "ഇല്ലാതാക്കുക", en: "Delete", ar: "حذف" },
  btn_edit: { ml: "തിരുത്തുക", en: "Edit", ar: "تعديل" },
  btn_back: { ml: "തിരികെ", en: "Back", ar: "رجوع" },
  btn_close: { ml: "അടയ്ക്കുക", en: "Close", ar: "إغلاق" },
  btn_confirm: { ml: "സ്ഥിരീകരിക്കുക", en: "Confirm", ar: "تأكيد" },
  btn_search: { ml: "തിരയുക", en: "Search", ar: "بحث" },
  btn_filter: { ml: "ഫിൽട്ടർ", en: "Filter", ar: "تصفية" },
  btn_refresh: { ml: "പുതുക്കുക", en: "Refresh", ar: "تحديث" },
  btn_export: { ml: "കയറ്റുമതി", en: "Export", ar: "تصدير" },
  btn_grant_access: { ml: "പ്രവേശനം നൽകുക", en: "Grant Access", ar: "منح الوصول" },
  btn_revoke_access: { ml: "പ്രവേശനം റദ്ദാക്കുക", en: "Revoke Access", ar: "إلغاء الوصول" },
  btn_approve: { ml: "അംഗീകരിക്കുക", en: "Approve", ar: "موافقة" },
  btn_reject: { ml: "നിരസിക്കുക", en: "Reject", ar: "رفض" },
  btn_send: { ml: "അയയ്ക്കുക", en: "Send", ar: "إرسال" },
  btn_upload: { ml: "അപ്‌ലോഡ്", en: "Upload", ar: "رفع" },
  btn_download: { ml: "ഡൗൺലോഡ്", en: "Download", ar: "تنزيل" },

  // ── Common Labels ──
  lbl_loading: { ml: "ലോഡ് ചെയ്യുന്നു...", en: "Loading...", ar: "جاري التحميل..." },
  lbl_no_data: { ml: "ഡാറ്റ ലഭ്യമല്ല", en: "No data available", ar: "لا توجد بيانات" },
  lbl_search_placeholder: { ml: "തിരയുക...", en: "Search...", ar: "بحث..." },
  lbl_required: { ml: "ആവശ്യമാണ്", en: "Required", ar: "مطلوب" },
  lbl_optional: { ml: "ഐച്ഛികം", en: "Optional", ar: "اختياري" },
  lbl_status: { ml: "നില", en: "Status", ar: "الحالة" },
  lbl_date: { ml: "തീയതി", en: "Date", ar: "التاريخ" },
  lbl_actions: { ml: "പ്രവർത്തനങ്ങൾ", en: "Actions", ar: "الإجراءات" },
  lbl_all: { ml: "എല്ലാം", en: "All", ar: "الكل" },
  lbl_active: { ml: "സജീവം", en: "Active", ar: "نشط" },
  lbl_inactive: { ml: "നിഷ്ക്രിയം", en: "Inactive", ar: "غير نشط" },
  lbl_yes: { ml: "അതെ", en: "Yes", ar: "نعم" },
  lbl_no: { ml: "ഇല്ല", en: "No", ar: "لا" },

  // ── Language Selector ──
  lang_title: { ml: "ഭാഷ തിരഞ്ഞെടുക്കുക", en: "Choose Language", ar: "اختر اللغة" },
  lang_malayalam: { ml: "മലയാളം", en: "Malayalam", ar: "المالايالامية" },
  lang_english: { ml: "English", en: "English", ar: "الإنجليزية" },
  lang_arabic: { ml: "العربية", en: "Arabic", ar: "العربية" },
  lang_saved: { ml: "ഭാഷ സംരക്ഷിച്ചു", en: "Language saved", ar: "تم حفظ اللغة" },

  // ── Settings ──
  settings_title: { ml: "ക്രമീകരണങ്ങൾ", en: "Settings", ar: "الإعدادات" },
  settings_language: { ml: "ഭാഷ", en: "Language", ar: "اللغة" },
  settings_account: { ml: "അക്കൗണ്ട്", en: "Account", ar: "الحساب" },
  settings_logout: { ml: "ലോഗ് ഔട്ട്", en: "Logout", ar: "تسجيل الخروج" },
  settings_my_subscription: { ml: "എന്റെ സബ്സ്ക്രിപ്ഷൻ", en: "My Subscription", ar: "اشتراكي" },
  settings_support: { ml: "സഹായം", en: "Support", ar: "الدعم" },
  settings_about: { ml: "കുറിച്ച്", en: "About", ar: "حول" },

  // ── Status / Messages ──
  msg_no_results: { ml: "ഫലങ്ങളൊന്നും കണ്ടെത്തിയില്ല", en: "No results found", ar: "لم يتم العثور على نتائج" },
  msg_success: { ml: "വിജയകരം", en: "Success", ar: "تم بنجاح" },
  msg_saved: { ml: "സംരക്ഷിച്ചു", en: "Saved successfully", ar: "تم الحفظ بنجاح" },
  msg_deleted: { ml: "ഇല്ലാതാക്കി", en: "Deleted successfully", ar: "تم الحذف بنجاح" },
  msg_error_occurred: { ml: "ഒരു പിശക് സംഭവിച്ചു", en: "An error occurred", ar: "حدث خطأ" },
  msg_try_again: { ml: "വീണ്ടും ശ്രമിക്കുക", en: "Please try again", ar: "يرجى المحاولة مرة أخرى" },
  msg_coming_soon: { ml: "ഉടൻ വരുന്നു", en: "Coming Soon", ar: "قريباً" },

  // ── User Detail / Admin ──
  user_profile: { ml: "ഉപയോക്തൃ പ്രൊഫൈൽ", en: "User Profile", ar: "الملف الشخصي" },
  user_full_name: { ml: "പൂർണ്ണ നാമം", en: "Full Name", ar: "الاسم الكامل" },
  user_role: { ml: "റോൾ", en: "Role", ar: "الدور" },
  user_status: { ml: "നില", en: "Status", ar: "الحالة" },
  user_last_login: { ml: "അവസാന ലോഗിൻ", en: "Last Login", ar: "آخر تسجيل دخول" },
  user_permissions: { ml: "അനുമതികൾ", en: "Permissions", ar: "الأذونات" },
  user_no_permissions: { ml: "അനുമതികളൊന്നുമില്ല", en: "No permissions", ar: "لا توجد أذونات" },

  // ── Page Not Found ──
  not_found_title: { ml: "പേജ് കണ്ടെത്തിയില്ല", en: "Page Not Found", ar: "الصفحة غير موجودة" },
  not_found_desc: { ml: "നിങ്ങൾ തിരയുന്ന പേജ് നിലവിലില്ല.", en: "The page you're looking for doesn't exist.", ar: "الصفحة التي تبحث عنها غير موجودة." },
  not_found_home: { ml: "ഹോമിലേക്ക് പോകുക", en: "Go Home", ar: "الذهاب إلى الرئيسية" },

  // ── OTP Login ──
  otp_login_title: { ml: "ലോഗിൻ", en: "Login", ar: "تسجيل الدخول" },
  otp_login_desc: { ml: "നിങ്ങളുടെ ഇമെയിൽ നൽകുക", en: "Enter your email to login", ar: "أدخل بريدك الإلكتروني لتسجيل الدخول" },
  otp_send_login: { ml: "ലോഗിൻ കോഡ് അയയ്ക്കുക", en: "Send Login Code", ar: "إرسال رمز الدخول" },
  otp_enter_code: { ml: "ലോഗിൻ കോഡ് നൽകുക", en: "Enter login code", ar: "أدخل رمز الدخول" },
  otp_create_account: { ml: "പുതിയ അക്കൗണ്ട്", en: "Create account", ar: "إنشاء حساب" },
  otp_new_user: { ml: "പുതിയ ഉപയോക്താവോ?", en: "New user?", ar: "مستخدم جديد؟" },
  otp_sent_title: { ml: "OTP അയച്ചു", en: "OTP Sent", ar: "تم إرسال الرمز" },
  otp_sent_desc: { ml: "6 അക്ക കോഡിനായി ഇമെയിൽ പരിശോധിക്കുക", en: "Check your email for the 6-digit code", ar: "تحقق من بريدك الإلكتروني للرمز" },
  otp_verify_login: { ml: "പരിശോധിച്ച് ലോഗിൻ", en: "Verify & Login", ar: "تحقق وتسجيل الدخول" },
  otp_welcome_back: { ml: "തിരികെ സ്വാഗതം!", en: "Welcome back!", ar: "مرحباً بعودتك!" },
  otp_login_success: { ml: "ലോഗിൻ വിജയകരം.", en: "Login successful.", ar: "تم تسجيل الدخول بنجاح." },
  otp_resend: { ml: "OTP വീണ്ടും അയയ്ക്കുക", en: "Resend OTP", ar: "إعادة إرسال الرمز" },
  otp_code_sent_to: { ml: "കോഡ് ഇതിലേക്ക് അയച്ചു", en: "We sent a 6-digit code to", ar: "تم إرسال رمز مكون من 6 أرقام إلى" },
  otp_enter_login_code: { ml: "ലോഗിൻ കോഡ് നൽകുക", en: "Enter OTP Code", ar: "أدخل رمز التحقق" },

  // ── Onboarding Additional ──
  onboarding_email_title: { ml: "ഇമെയിൽ നൽകുക", en: "Enter your email", ar: "أدخل بريدك الإلكتروني" },
  onboarding_otp_title: { ml: "കോഡ് നൽകുക", en: "Enter verification code", ar: "أدخل رمز التحقق" },

  // ── Protected Page / Access ──
  protected_loading: { ml: "പ്രവേശനം പരിശോധിക്കുന്നു...", en: "Checking access...", ar: "جاري التحقق من الوصول..." },
  protected_locked_title: { ml: "പ്രീമിയം ഉള്ളടക്കം", en: "Premium Content", ar: "محتوى مميز" },
  protected_locked_desc: { ml: "ഈ പേജിന് സജീവ സബ്സ്ക്രിപ്ഷൻ അല്ലെങ്കിൽ പ്രവേശന അനുമതി ആവശ്യമാണ്.", en: "This page requires an active subscription or access permission.", ar: "تتطلب هذه الصفحة اشتراكاً نشطاً أو إذن وصول." },
  protected_expired_title: { ml: "പ്രവേശനം കാലഹരണപ്പെട്ടു", en: "Access Expired", ar: "انتهى الوصول" },
  protected_expired_desc: { ml: "ഈ പേജിലേക്കുള്ള നിങ്ങളുടെ പ്രവേശനം കാലഹരണപ്പെട്ടു.", en: "Your access to this page has expired.", ar: "انتهت صلاحية وصولك إلى هذه الصفحة." },
  protected_revoked_title: { ml: "പ്രവേശനം റദ്ദാക്കി", en: "Access Revoked", ar: "تم إلغاء الوصول" },
  protected_revoked_desc: { ml: "ഈ പേജിലേക്കുള്ള നിങ്ങളുടെ പ്രവേശനം റദ്ദാക്കിയിരിക്കുന്നു.", en: "Your access to this page has been revoked.", ar: "تم إلغاء وصولك إلى هذه الصفحة." },

  // ── Home Page ──
  btn_rules: { ml: "നിയമങ്ങൾ", en: "Rules", ar: "القواعد" },
  hero_subtitle: { ml: "അക്ഷര ശാസ്ത്ര വിശകലനം", en: "Advanced Ilm al-Huruf Analysis", ar: "تحليل علم الحروف المتقدم" },

  // ── Card Subtitles ──
  card_sub_abjad: { ml: "സംഖ്യാ കാൽക്കുലേറ്റർ", en: "Numerical Calculator", ar: "حاسبة الأرقام" },
  card_sub_anasir: { ml: "മൂലക വിശകലനം", en: "Elemental Analysis", ar: "تحليل العناصر" },
  card_sub_hadim: { ml: "നാമ സൃഷ്ടാവ്", en: "Name Generator", ar: "مولّد الأسماء" },
  card_sub_mizaan: { ml: "പവിത്ര സംഖ്യാശാസ്ത്രം", en: "Sacred Numerology", ar: "علم الأرقام المقدس" },
  card_sub_sqayer: { ml: "പവിത്ര വഫ്ക് നിർമ്മാണം", en: "Sacred Vefk Construction", ar: "بناء الوفق المقدس" },
  card_sub_vefkin: { ml: "ഒട്ടോമൻ ഗ്രന്ഥ രീതി", en: "Ottoman Manuscript Method", ar: "طريقة المخطوطة العثمانية" },
  card_sub_bast: { ml: "ബസ്തി അദദി ജദ്വേലി", en: "Basti Adedi Cedveli", ar: "باستي عديدي جدولي" },
  card_sub_faal: { ml: "പവിത്ര ഫാൽ വ്യവസ്ഥ", en: "Sacred Omen System", ar: "نظام الفأل المقدس" },
  card_sub_plants: { ml: "ഔഷധ നിഘണ്ടു", en: "Medicinal Dictionary", ar: "قاموس الأعشاب" },
  card_sub_holy_names: { ml: "പവിത്ര നാമ പരാമർശം", en: "Sacred Names Reference", ar: "مرجع الأسماء المقدسة" },
  card_sub_evil_jinn: { ml: "ജിൻ വർഗ്ഗീകരണം", en: "Jinn Classification", ar: "تصنيف الجن" },
  card_sub_astro: { ml: "ഖഗോള സമയ എഞ്ചിൻ", en: "Celestial Time Engine", ar: "محرك الوقت السماوي" },
  card_sub_sirr: { ml: "ഗ്രന്ഥ വിജ്ഞാനം", en: "Manuscript Knowledge", ar: "معرفة المخطوطة" },
  card_sub_shop: { ml: "പ്രീമിയം ഉൽപ്പന്നങ്ങളും പുസ്തകങ്ങളും", en: "Premium Products & Books", ar: "منتجات وكتب مميزة" },

  // ── Account Modal ──
  account_owner_dashboard: { ml: "ഉടമസ്ഥ ഡാഷ്ബോർഡ്", en: "Owner Dashboard", ar: "لوحة المالك" },
  account_admin_dashboard: { ml: "അഡ്മിൻ ഡാഷ്ബോർഡ്", en: "Admin Dashboard", ar: "لوحة المشرف" },
  account_logging_out: { ml: "ലോഗ് ഔട്ട് ചെയ്യുന്നു…", en: "Logging out…", ar: "جاري الخروج…" },
  account_user_fallback: { ml: "ഉപയോക്താവ്", en: "User", ar: "مستخدم" },
  account_subscription: { ml: "സബ്സ്ക്രിപ്ഷൻ", en: "Subscription", ar: "الاشتراك" },
  role_owner: { ml: "ഉടമസ്ഥൻ", en: "Owner", ar: "المالك" },
  role_admin: { ml: "അഡ്മിൻ", en: "Admin", ar: "مشرف" },
  role_user: { ml: "ഉപയോക്താവ്", en: "User", ar: "مستخدم" },

  // ── Google Sign-In Prompt ──
  google_signin_title: { ml: "Google വഴി സൈൻ ഇൻ ചെയ്യുക", en: "Sign in with Google", ar: "تسجيل الدخول عبر Google" },
  google_signin_desc: { ml: "നിങ്ങളുടെ ഐഡന്റിറ്റി സിങ്ക് ചെയ്യാൻ സൈൻ ഇൻ ചെയ്യുക. സംരക്ഷിത പേജുകൾക്ക് ഇപ്പോഴും ആക്സസ് കോഡ് ആവശ്യമാണ് — Google സൈൻ-ഇൻ ഐഡന്റിറ്റിക്ക് മാത്രമാണ്, ഉള്ളടക്കം തുറക്കില്ല.", en: "Sign in to sync your identity. Protected pages still require an access code — Google Sign-In is for identity only and never unlocks content.", ar: "سجّل الدخول لمزامنة هويتك. الصفحات المحمية تتطلب رمز وصول — تسجيل الدخول عبر Google للهوية فقط ولا يفتح المحتوى." },
  google_redirecting: { ml: "റീഡയറക്റ്റ് ചെയ്യുന്നു…", en: "Redirecting…", ar: "جاري إعادة التوجيه…" },
  google_continue: { ml: "Google വഴി തുടരുക", en: "Continue with Google", ar: "المتابعة عبر Google" },
  google_skip: { ml: "ഒഴിവാക്കുക — ഗസ്റ്റായി തുടരുക", en: "Skip — Continue as Guest", ar: "تخطي — المتابعة كضيف" },

  // ── Error Boundary ──
  error_title: { ml: "എന്തോ തെറ്റി", en: "Something went wrong", ar: "حدث خطأ ما" },
  error_desc: { ml: "അപ്ലിക്കേഷന് അപ്രതീക്ഷിതമായ ഒരു പിശക് സംഭവിച്ചു. പേജ് പുതുക്കി ശ്രമിക്കുക.", en: "The application encountered an unexpected error. Please try refreshing the page.", ar: "واجه التطبيق خطأً غير متوقع. يرجى تحديث الصفحة." },
  error_refresh: { ml: "പേജ് പുതുക്കുക", en: "Refresh Page", ar: "تحديث الصفحة" },

  // ── Protected Page ──
  admin_access_required: { ml: "അഡ്മിൻ പ്രവേശനം ആവശ്യം", en: "Admin Access Required", ar: "مطلوب وصول المشرف" },
  admin_restricted: { ml: "ഈ പേജ് അഡ്മിനിസ്ട്രേറ്റർമാർക്ക് മാത്രം പരിമിതപ്പെടുത്തിയിരിക്കുന്നു.", en: "This page is restricted to administrators only.", ar: "هذه الصفحة مقتصرة على المسؤولين فقط." },
  admin_login: { ml: "അഡ്മിൻ ലോഗിൻ", en: "Admin Login", ar: "دخول المشرف" },
  back_to_home: { ml: "← ഹോമിലേക്ക് തിരികെ", en: "← Back to Home", ar: "← العودة للرئيسية" },
  access_restricted_title: { ml: "പ്രവേശനം നിയന്ത്രിതം", en: "Access Restricted", ar: "وصول مقيد" },
  access_restricted_desc: { ml: "നിങ്ങളുടെ റോളിന് ഈ വിഭാഗത്തിലേക്ക് പ്രവേശനമില്ല.", en: "Your role does not have access to this section.", ar: "دورك لا يملك صلاحية الوصول إلى هذا القسم." },
  premium_account_required: { ml: "ഈ പേജിന് അക്കൗണ്ട് ആവശ്യമാണ്. ഇമെയിൽ വഴിയോ Google വഴിയോ സൈൻ ഇൻ ചെയ്ത് തുടരുക.", en: "This page requires an account. Continue with email or Google to proceed.", ar: "تتطلب هذه الصفحة حساباً. تابع باستخدام البريد الإلكتروني أو Google." },
  premium_no_access: { ml: "ഈ പ്രീമിയം ഉള്ളടക്കത്തിലേക്ക് നിങ്ങൾക്ക് പ്രവേശനമില്ല.", en: "You don't have access to this premium content.", ar: "ليس لديك وصول إلى هذا المحتوى المميز." },
  enter_reading_code: { ml: "റീഡിംഗ് ആക്സസ് കോഡ് നൽകുക", en: "Enter Reading Access Code", ar: "أدخل رمز الوصول" },
  request_access_form: { ml: "പ്രവേശനം അഭ്യർത്ഥിക്കുക (ഇൻ-ആപ്പ് ഫോം)", en: "Request Access (In-App Form)", ar: "طلب وصول (نموذج داخل التطبيق)" },
  enter_access_code: { ml: "ആക്സസ് കോഡ് നൽകുക", en: "Enter Access Code", ar: "أدخل رمز الوصول" },
  code_placeholder: { ml: "ഉദാ. ACCESS-1234", en: "e.g. ACCESS-1234", ar: "مثال: ACCESS-1234" },
  verifying: { ml: "പരിശോധിക്കുന്നു…", en: "Verifying…", ar: "جاري التحقق…" },
  activate_code: { ml: "കോഡ് സജീവമാക്കുക", en: "Activate Code", ar: "تفعيل الرمز" },
  invalid_code: { ml: "അസാധുവായ കോഡ്.", en: "Invalid code.", ar: "رمز غير صالح." },
  redemption_failed: { ml: "റിഡീം പരാജയപ്പെട്ടു.", en: "Redemption failed.", ar: "فشل التفعيل." },
};

export default translations;