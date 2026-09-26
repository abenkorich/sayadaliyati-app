export type Language = 'en' | 'fr' | 'ar';
export const languages: Language[] = ['en', 'fr', 'ar'];
export const languageNames: Record<Language, string> = {
  en: 'English',
  fr: 'Français',
  ar: 'العربية',
};
export const messages: Record<string, Record<Language, string>> = {
  Current: { en: 'Current', fr: 'En cours', ar: 'الحالية' },

  Back: {
    en: 'Back',
    fr: 'Retour',
    ar: 'رجوع',
  },
  'Hide keyboard': {
    en: 'Hide keyboard',
    fr: 'Masquer le clavier',
    ar: 'إخفاء لوحة المفاتيح',
  },
  Language: {
    en: 'Language',
    fr: 'Langue',
    ar: 'اللغة',
  },
  Treatments: {
    en: 'Treatments',
    fr: 'Traitements',
    ar: 'العلاجات',
  },
  Medicines: {
    en: 'Medicines',
    fr: 'Médicaments',
    ar: 'الأدوية',
  },
  Inbox: {
    en: 'Inbox',
    fr: 'Messages',
    ar: 'الرسائل',
  },
  Settings: {
    en: 'Settings',
    fr: 'Paramètres',
    ar: 'الإعدادات',
  },
  'All my medicines, in one place.': {
    en: 'All my medicines, in one place.',
    fr: 'Tous mes médicaments, au même endroit.',
    ar: 'كل أدويتي في مكان واحد.',
  },
  'Dose reminders': {
    en: 'Dose reminders',
    fr: 'Rappels de prise',
    ar: 'تذكيرات الجرعات',
  },
  'Expiry reminders': {
    en: 'Expiry reminders',
    fr: 'Rappels de péremption',
    ar: 'تذكيرات انتهاء الصلاحية',
  },
  'Low stock alerts': {
    en: 'Low stock alerts',
    fr: 'Alertes de stock faible',
    ar: 'تنبيهات انخفاض المخزون',
  },
  'Sharing updates': {
    en: 'Sharing updates',
    fr: 'Actualités de partage',
    ar: 'تحديثات المشاركة',
  },
  'System updates': {
    en: 'System updates',
    fr: 'Actualités du système',
    ar: 'تحديثات النظام',
  },
  'Check your email or phone and password.': {
    en: 'Check your email or phone and password.',
    fr: 'Vérifiez votre e-mail ou téléphone et votre mot de passe.',
    ar: 'تحقق من بريدك الإلكتروني أو هاتفك وكلمة المرور.',
  },
  'Check your entries and try again.': {
    en: 'Check your entries and try again.',
    fr: 'Vérifiez les informations et réessayez.',
    ar: 'تحقق من البيانات وحاول مجدداً.',
  },
  'Too many attempts. Please wait before trying again.': {
    en: 'Too many attempts. Please wait before trying again.',
    fr: 'Trop de tentatives. Patientez avant de réessayer.',
    ar: 'محاولات كثيرة. انتظر قبل المحاولة مجدداً.',
  },
  'This item is no longer available.': {
    en: 'This item is no longer available.',
    fr: 'Cet élément n’est plus disponible.',
    ar: 'هذا العنصر لم يعد متاحاً.',
  },
  'Request could not be completed ({code}).': {
    en: 'Request could not be completed ({code}).',
    fr: 'La demande n’a pas pu aboutir ({code}).',
    ar: 'تعذر إتمام الطلب ({code}).',
  },
  'Connection interrupted. Try again. If sign-in expired, sign in again.': {
    en: 'Connection interrupted. Try again. If sign-in expired, sign in again.',
    fr: 'Connexion interrompue. Réessayez. Si la session a expiré, reconnectez-vous.',
    ar: 'انقطع الاتصال. حاول مجدداً. إذا انتهت الجلسة، سجّل الدخول مجدداً.',
  },
  'Record this dose as taken?': {
    en: 'Record this dose as taken?',
    fr: 'Enregistrer cette dose comme prise ?',
    ar: 'تسجيل هذه الجرعة كمأخوذة؟',
  },
  'Record this dose as skipped?': {
    en: 'Record this dose as skipped?',
    fr: 'Enregistrer cette dose comme non prise ?',
    ar: 'تسجيل هذه الجرعة كمتروكة؟',
  },
  'This record cannot be edited in the app. It does not change your prescribed schedule.':
    {
      en: 'This record cannot be edited in the app. It does not change your prescribed schedule.',
      fr: 'Cet enregistrement ne peut pas être modifié dans l’application. Il ne change pas votre programme prescrit.',
      ar: 'لا يمكن تعديل هذا السجل في التطبيق. وهو لا يغيّر جدولك الموصوف.',
    },
  Cancel: {
    en: 'Cancel',
    fr: 'Annuler',
    ar: 'إلغاء',
  },
  Confirm: {
    en: 'Confirm',
    fr: 'Confirmer',
    ar: 'تأكيد',
  },
  'Restoring session': {
    en: 'Restoring session',
    fr: 'Restauration de la session',
    ar: 'استعادة الجلسة',
  },
  Retry: {
    en: 'Retry',
    fr: 'Réessayer',
    ar: 'إعادة المحاولة',
  },
  'Create your account': {
    en: 'Create your account',
    fr: 'Créez votre compte',
    ar: 'إنشاء حسابك',
  },
  'Welcome back': {
    en: 'Welcome back',
    fr: 'Heureux de vous revoir',
    ar: 'مرحباً بعودتك',
  },
  'Keep your medicines and treatment records together.': {
    en: 'Keep your medicines and treatment records together.',
    fr: 'Gardez vos médicaments et vos traitements au même endroit.',
    ar: 'احتفظ بأدويتك وسجلات علاجك معاً.',
  },
  'First name': {
    en: 'First name',
    fr: 'Prénom',
    ar: 'الاسم',
  },
  'Last name': {
    en: 'Last name',
    fr: 'Nom',
    ar: 'اللقب',
  },
  'Email or international phone number': {
    en: 'Email or international phone number',
    fr: 'E-mail ou numéro de téléphone international',
    ar: 'البريد الإلكتروني أو رقم الهاتف الدولي',
  },
  'Password (15–128 characters)': {
    en: 'Password (15–128 characters)',
    fr: 'Mot de passe (15–128 caractères)',
    ar: 'كلمة المرور (15–128 حرفاً)',
  },
  Password: {
    en: 'Password',
    fr: 'Mot de passe',
    ar: 'كلمة المرور',
  },
  'Please wait…': {
    en: 'Please wait…',
    fr: 'Veuillez patienter…',
    ar: 'يرجى الانتظار…',
  },
  'Create account': {
    en: 'Create account',
    fr: 'Créer le compte',
    ar: 'إنشاء الحساب',
  },
  'Sign in': {
    en: 'Sign in',
    fr: 'Se connecter',
    ar: 'تسجيل الدخول',
  },
  'I already have an account': {
    en: 'I already have an account',
    fr: 'J’ai déjà un compte',
    ar: 'لدي حساب بالفعل',
  },
  'Create an account': {
    en: 'Create an account',
    fr: 'Créer un compte',
    ar: 'إنشاء حساب',
  },
  'Back to list': {
    en: 'Back to list',
    fr: 'Retour à la liste',
    ar: 'العودة إلى القائمة',
  },
  'View medicine': {
    en: 'View medicine',
    fr: 'Voir le médicament',
    ar: 'عرض الدواء',
  },
  'Not recorded': {
    en: 'Not recorded',
    fr: 'Non enregistré',
    ar: 'غير مسجلة',
  },
  Taken: {
    en: 'Taken',
    fr: 'Prise',
    ar: 'مأخوذة',
  },
  Skipped: {
    en: 'Skipped',
    fr: 'Non prise',
    ar: 'متروكة',
  },
  'No description supplied.': {
    en: 'No description supplied.',
    fr: 'Aucune description fournie.',
    ar: 'لا يوجد وصف.',
  },
  Source: {
    en: 'Source',
    fr: 'Source',
    ar: 'المصدر',
  },
  'Not supplied': {
    en: 'Not supplied',
    fr: 'Non fourni',
    ar: 'غير متوفر',
  },
  'Search medicine names': {
    en: 'Search medicine names',
    fr: 'Rechercher un médicament',
    ar: 'البحث عن أسماء الأدوية',
  },
  Search: {
    en: 'Search',
    fr: 'Rechercher',
    ar: 'بحث',
  },
  'Local demo entries are synthetic and labeled DEMO.': {
    en: 'Local demo entries are synthetic and labeled DEMO.',
    fr: 'Les données de démonstration locales sont fictives et marquées DEMO.',
    ar: 'بيانات العرض المحلية افتراضية وتحمل علامة DEMO.',
  },
  'Open {name}': {
    en: 'Open {name}',
    fr: 'Ouvrir {name}',
    ar: 'فتح {name}',
  },
  'No medicines found.': {
    en: 'No medicines found.',
    fr: 'Aucun médicament trouvé.',
    ar: 'لم يتم العثور على أدوية.',
  },
  'Review your saved schedules and record doses.': {
    en: 'Review your saved schedules and record doses.',
    fr: 'Consultez vos programmes et enregistrez vos prises.',
    ar: 'راجع جداولك المحفوظة وسجّل الجرعات.',
  },
  'No treatments yet': {
    en: 'No treatments yet',
    fr: 'Aucun traitement pour le moment',
    ar: 'لا توجد علاجات بعد',
  },
  'Treatments created through the API will appear here. Treatment creation on mobile is coming next.':
    {
      en: 'Treatments created through the API will appear here. Treatment creation on mobile is coming next.',
      fr: 'Les traitements créés via l’API apparaîtront ici. La création sur mobile sera bientôt disponible.',
      ar: 'ستظهر هنا العلاجات المنشأة عبر واجهة البرمجة. سيتوفر إنشاء العلاجات على الهاتف لاحقاً.',
    },
  'In-app reminders. Phone push is not connected yet.': {
    en: 'In-app reminders. Phone push is not connected yet.',
    fr: 'Rappels dans l’application. Les notifications push ne sont pas encore connectées.',
    ar: 'تذكيرات داخل التطبيق. إشعارات الهاتف غير متصلة بعد.',
  },
  'Mark all as read': {
    en: 'Mark all as read',
    fr: 'Tout marquer comme lu',
    ar: 'تحديد الكل كمقروء',
  },
  'Review treatment': {
    en: 'Review treatment',
    fr: 'Consulter le traitement',
    ar: 'مراجعة العلاج',
  },
  'You’re all caught up.': {
    en: 'You’re all caught up.',
    fr: 'Vous êtes à jour.',
    ar: 'لا توجد رسائل جديدة.',
  },
  'Reminder preferences': {
    en: 'Reminder preferences',
    fr: 'Préférences de rappel',
    ar: 'تفضيلات التذكير',
  },
  'Your saved choices': {
    en: 'Your saved choices',
    fr: 'Vos choix enregistrés',
    ar: 'اختياراتك المحفوظة',
  },
  'Choose and save your preferences. Nothing is enabled automatically.': {
    en: 'Choose and save your preferences. Nothing is enabled automatically.',
    fr: 'Choisissez et enregistrez vos préférences. Rien n’est activé automatiquement.',
    ar: 'اختر تفضيلاتك واحفظها. لا يتم تفعيل أي شيء تلقائياً.',
  },
  'Only dose inbox reminders are delivered currently. Other choices are saved for future features.':
    {
      en: 'Only dose inbox reminders are delivered currently. Other choices are saved for future features.',
      fr: 'Seuls les rappels de prise dans la messagerie sont actuellement envoyés. Les autres choix sont enregistrés pour les futures fonctionnalités.',
      ar: 'حالياً يتم إرسال تذكيرات الجرعات داخل الرسائل فقط. تُحفظ الخيارات الأخرى للميزات القادمة.',
    },
  'Save preferences': {
    en: 'Save preferences',
    fr: 'Enregistrer les préférences',
    ar: 'حفظ التفضيلات',
  },
  'Preferences saved': {
    en: 'Preferences saved',
    fr: 'Préférences enregistrées',
    ar: 'تم حفظ التفضيلات',
  },
  'Sign out': {
    en: 'Sign out',
    fr: 'Se déconnecter',
    ar: 'تسجيل الخروج',
  },
  Previous: {
    en: 'Previous',
    fr: 'Précédent',
    ar: 'السابق',
  },
  Next: {
    en: 'Next',
    fr: 'Suivant',
    ar: 'التالي',
  },
  'Language could not be saved. Please try again.': {
    en: 'Language could not be saved. Please try again.',
    fr: 'Impossible d’enregistrer la langue. Réessayez.',
    ar: 'تعذر حفظ اللغة. حاول مجدداً.',
  },
  ACTIVE: {
    en: 'ACTIVE',
    fr: 'Actif',
    ar: 'نشط',
  },
  COMPLETED: {
    en: 'COMPLETED',
    fr: 'Terminé',
    ar: 'مكتمل',
  },
  CANCELLED: {
    en: 'CANCELLED',
    fr: 'Annulé',
    ar: 'ملغى',
  },
  PAUSED: {
    en: 'PAUSED',
    fr: 'En pause',
    ar: 'متوقف مؤقتاً',
  },
  TAKEN: {
    en: 'TAKEN',
    fr: 'Prise',
    ar: 'مأخوذة',
  },
  SKIPPED: {
    en: 'SKIPPED',
    fr: 'Non prise',
    ar: 'متروكة',
  },
  MISSED: {
    en: 'MISSED',
    fr: 'Manquée',
    ar: 'فائتة',
  },
  Home: {
    en: 'Home',
    fr: 'Accueil',
    ar: 'الرئيسية',
  },
  'My Pharmacy': {
    en: 'My Pharmacy',
    fr: 'Ma pharmacie',
    ar: 'صيدليتي',
  },
  Pharmacy: {
    en: 'Pharmacy',
    fr: 'Pharmacie',
    ar: 'الصيدلية',
  },
  Prescriptions: {
    en: 'Prescriptions',
    fr: 'Ordonnances',
    ar: 'الوصفات',
  },
  More: {
    en: 'More',
    fr: 'Plus',
    ar: 'المزيد',
  },
  Add: {
    en: 'Add',
    fr: 'Ajouter',
    ar: 'إضافة',
  },
  'Open app': {
    en: 'Open app',
    fr: 'Ouvrir l’application',
    ar: 'فتح التطبيق',
  },
  'Back to introduction': {
    en: 'Back to introduction',
    fr: 'Retour à la présentation',
    ar: 'العودة إلى المقدمة',
  },
  'Open reminders': {
    en: 'Open reminders',
    fr: 'Ouvrir les rappels',
    ar: 'فتح التذكيرات',
  },
  'Open settings': {
    en: 'Open settings',
    fr: 'Ouvrir les paramètres',
    ar: 'فتح الإعدادات',
  },
  'Source:': {
    en: 'Source:',
    fr: 'Source :',
    ar: 'المصدر:',
  },
  'Everything you need, close at hand.': {
    en: 'Everything you need, close at hand.',
    fr: 'Tout ce qu’il vous faut, à portée de main.',
    ar: 'كل ما تحتاجه في متناول يدك.',
  },
  'My Prescriptions': {
    en: 'My Prescriptions',
    fr: 'Mes ordonnances',
    ar: 'وصفاتي',
  },
  'Create, attach and review prescriptions': {
    en: 'Create, attach and review prescriptions',
    fr: 'Créer, joindre et consulter des ordonnances',
    ar: 'إنشاء الوصفات وإرفاقها ومراجعتها',
  },
  'Medicine catalog': {
    en: 'Medicine catalog',
    fr: 'Catalogue des médicaments',
    ar: 'دليل الأدوية',
  },
  'Search medicines and add stock': {
    en: 'Search medicines and add stock',
    fr: 'Rechercher des médicaments et ajouter du stock',
    ar: 'البحث عن الأدوية وإضافة المخزون',
  },
  'My reminders': {
    en: 'My reminders',
    fr: 'Mes rappels',
    ar: 'تذكيراتي',
  },
  'Review your in-app notifications': {
    en: 'Review your in-app notifications',
    fr: 'Consulter vos notifications dans l’application',
    ar: 'مراجعة إشعاراتك داخل التطبيق',
  },
  'Reminder preferences and account': {
    en: 'Reminder preferences and account',
    fr: 'Préférences de rappel et compte',
    ar: 'تفضيلات التذكير والحساب',
  },
  'After scanning, select the matching catalog medicine and check its strength before adding stock.':
    {
      en: 'After scanning, select the matching catalog medicine and check its strength before adding stock.',
      fr: 'Après le scan, sélectionnez le médicament correspondant et vérifiez son dosage avant d’ajouter du stock.',
      ar: 'بعد المسح، اختر الدواء المطابق وتحقق من تركيزه قبل إضافة المخزون.',
    },
  'Search by brand or active ingredient.': {
    en: 'Search by brand or active ingredient.',
    fr: 'Rechercher par marque ou substance active.',
    ar: 'البحث بالاسم التجاري أو المادة الفعالة.',
  },
  'Dismiss quick actions': {
    en: 'Dismiss quick actions',
    fr: 'Fermer les actions rapides',
    ar: 'إغلاق الإجراءات السريعة',
  },
  'A little more care': {
    en: 'A little more care',
    fr: 'Un peu plus de soin',
    ar: 'قليل من العناية الإضافية',
  },
  'Close quick actions': {
    en: 'Close quick actions',
    fr: 'Fermer les actions rapides',
    ar: 'إغلاق الإجراءات السريعة',
  },
  'What would you like to do?': {
    en: 'What would you like to do?',
    fr: 'Que souhaitez-vous faire ?',
    ar: 'ماذا تود أن تفعل؟',
  },
  'Create a draft or review saved prescriptions': {
    en: 'Create a draft or review saved prescriptions',
    fr: 'Créer un brouillon ou consulter les ordonnances',
    ar: 'إنشاء مسودة أو مراجعة الوصفات المحفوظة',
  },
  'Add a medicine': {
    en: 'Add a medicine',
    fr: 'Ajouter un médicament',
    ar: 'إضافة دواء',
  },
  'Search the catalog and record your stock': {
    en: 'Search the catalog and record your stock',
    fr: 'Rechercher dans le catalogue et enregistrer le stock',
    ar: 'البحث في الدليل وتسجيل مخزونك',
  },
  'Review a dose': {
    en: 'Review a dose',
    fr: 'Consulter une prise',
    ar: 'مراجعة جرعة',
  },
  'Open your treatment schedule': {
    en: 'Open your treatment schedule',
    fr: 'Ouvrir votre programme de traitement',
    ar: 'فتح جدول علاجك',
  },
  'Check my pharmacy': {
    en: 'Check my pharmacy',
    fr: 'Consulter ma pharmacie',
    ar: 'عرض صيدليتي',
  },
  'See quantities, expiry dates and low stock': {
    en: 'See quantities, expiry dates and low stock',
    fr: 'Voir les quantités, péremptions et stocks faibles',
    ar: 'عرض الكميات وتواريخ الصلاحية والمخزون المنخفض',
  },
  'Illustrative app preview · example content': {
    en: 'Illustrative app preview · example content',
    fr: 'Aperçu illustratif · contenu d’exemple',
    ar: 'معاينة توضيحية للتطبيق · محتوى تجريبي',
  },
  'Available in English, French and Arabic.': {
    en: 'Available in English, French and Arabic.',
    fr: 'Disponible en anglais, français et arabe.',
    ar: 'متوفر بالإنجليزية والفرنسية والعربية.',
  },
  'Box image not available': {
    en: 'Box image not available',
    fr: 'Image de la boîte indisponible',
    ar: 'صورة العلبة غير متوفرة',
  },
  'No box image yet': {
    en: 'No box image yet',
    fr: 'Pas encore d’image de la boîte',
    ar: 'لا توجد صورة للعلبة بعد',
  },
  'Name or active ingredient': {
    en: 'Name or active ingredient',
    fr: 'Nom ou substance active',
    ar: 'الاسم أو المادة الفعالة',
  },
  'Finding medicines…': {
    en: 'Finding medicines…',
    fr: 'Recherche de médicaments…',
    ar: 'جارٍ البحث عن الأدوية…',
  },
  'No suggestions found.': {
    en: 'No suggestions found.',
    fr: 'Aucune suggestion trouvée.',
    ar: 'لم يتم العثور على اقتراحات.',
  },
  'Dismiss suggestions': {
    en: 'Dismiss suggestions',
    fr: 'Fermer les suggestions',
    ar: 'إغلاق الاقتراحات',
  },
  Category: {
    en: 'Category',
    fr: 'Catégorie',
    ar: 'الفئة',
  },
  'All categories': {
    en: 'All categories',
    fr: 'Toutes les catégories',
    ar: 'كل الفئات',
  },
  'Low stock': {
    en: 'Low stock',
    fr: 'Stock faible',
    ar: 'مخزون منخفض',
  },
  'Loading your pharmacy': {
    en: 'Loading your pharmacy',
    fr: 'Chargement de votre pharmacie',
    ar: 'جارٍ تحميل صيدليتك',
  },
  'Your pharmacy could not be loaded. Pull down to try again.': {
    en: 'Your pharmacy could not be loaded. Pull down to try again.',
    fr: 'Impossible de charger votre pharmacie. Tirez vers le bas pour réessayer.',
    ar: 'تعذر تحميل صيدليتك. اسحب للأسفل للمحاولة مجدداً.',
  },
  'YOUR EVERYDAY HEALTH COMPANION': {
    en: 'YOUR EVERYDAY HEALTH COMPANION',
    fr: 'VOTRE COMPAGNON SANTÉ AU QUOTIDIEN',
    ar: 'رفيقك الصحي اليومي',
  },
  Hello: {
    en: 'Hello',
    fr: 'Bonjour',
    ar: 'مرحباً',
  },
  'A little care, every day. Keep your medicines and routines together.': {
    en: 'A little care, every day. Keep your medicines and routines together.',
    fr: 'Un peu de soin chaque jour. Gardez vos médicaments et habitudes au même endroit.',
    ar: 'قليل من العناية كل يوم. احتفظ بأدويتك وروتينك معاً.',
  },
  'Your current treatments': {
    en: 'Your current treatments',
    fr: 'Vos traitements en cours',
    ar: 'علاجاتك الحالية',
  },
  'Room for your routine': {
    en: 'Room for your routine',
    fr: 'Une place pour vos habitudes',
    ar: 'مساحة لروتينك',
  },
  'Your active treatment plans will appear here when available.': {
    en: 'Your active treatment plans will appear here when available.',
    fr: 'Vos traitements actifs apparaîtront ici lorsqu’ils seront disponibles.',
    ar: 'ستظهر خطط علاجك النشطة هنا عند توفرها.',
  },
  'Quick actions': {
    en: 'Quick actions',
    fr: 'Actions rapides',
    ar: 'إجراءات سريعة',
  },
  'Add medicine': {
    en: 'Add medicine',
    fr: 'Ajouter un médicament',
    ar: 'إضافة دواء',
  },
  'Find it in the catalog': {
    en: 'Find it in the catalog',
    fr: 'Trouver dans le catalogue',
    ar: 'ابحث عنه في الدليل',
  },
  'Stay up to date': {
    en: 'Stay up to date',
    fr: 'Rester à jour',
    ar: 'ابقَ على اطلاع',
  },
  'Recently added': {
    en: 'Recently added',
    fr: 'Ajouts récents',
    ar: 'المضاف حديثاً',
  },
  'View all': {
    en: 'View all',
    fr: 'Tout voir',
    ar: 'عرض الكل',
  },
  'Your medicines, quantities and expiry dates in one place.': {
    en: 'Your medicines, quantities and expiry dates in one place.',
    fr: 'Vos médicaments, quantités et péremptions au même endroit.',
    ar: 'أدويتك وكمياتها وتواريخ صلاحيتها في مكان واحد.',
  },
  'Search the catalog to build your pharmacy': {
    en: 'Search the catalog to build your pharmacy',
    fr: 'Rechercher dans le catalogue pour remplir votre pharmacie',
    ar: 'ابحث في الدليل لإضافة أدوية إلى صيدليتك',
  },
  'stock entries': {
    en: 'stock entries',
    fr: 'entrées de stock',
    ar: 'سجلات مخزون',
  },
  'Add to My Pharmacy': {
    en: 'Add to My Pharmacy',
    fr: 'Ajouter à ma pharmacie',
    ar: 'إضافة إلى صيدليتي',
  },
  'Scanned:': {
    en: 'Scanned:',
    fr: 'Scanné :',
    ar: 'نتيجة المسح:',
  },
  '. Verify this matches the selected medicine. Pack quantity may differ from your remaining stock.':
    {
      en: '. Verify this matches the selected medicine. Pack quantity may differ from your remaining stock.',
      fr: '. Vérifiez la correspondance avec le médicament choisi. La quantité de la boîte peut différer du stock restant.',
      ar: '. تحقق من مطابقته للدواء المختار. قد تختلف كمية العلبة عن مخزونك المتبقي.',
    },
  'Record the quantity you have. This does not change your treatment or dose.':
    {
      en: 'Record the quantity you have. This does not change your treatment or dose.',
      fr: 'Enregistrez la quantité disponible. Cela ne change ni votre traitement ni votre dose.',
      ar: 'سجّل الكمية الموجودة لديك. هذا لا يغيّر علاجك أو جرعتك.',
    },
  Quantity: {
    en: 'Quantity',
    fr: 'Quantité',
    ar: 'الكمية',
  },
  'Stock quantity': {
    en: 'Stock quantity',
    fr: 'Quantité en stock',
    ar: 'كمية المخزون',
  },
  'e.g. 20': {
    en: 'e.g. 20',
    fr: 'p. ex. 20',
    ar: 'مثلاً 20',
  },
  Unit: {
    en: 'Unit',
    fr: 'Unité',
    ar: 'الوحدة',
  },
  'Expiry date (optional)': {
    en: 'Expiry date (optional)',
    fr: 'Date de péremption (facultative)',
    ar: 'تاريخ انتهاء الصلاحية (اختياري)',
  },
  'Select medicines only': {
    en: 'Select medicines only',
    fr: 'Sélectionner uniquement les médicaments',
    ar: 'حدد الأدوية فقط',
  },
  'The starting box is a suggested area, not automatic detection. Drag its corners or adjust the edges below. Exclude every name, address, ID, barcode and patient detail.':
    {
      en: 'The starting box is a suggested area, not automatic detection. Drag its corners or adjust the edges below. Exclude every name, address, ID, barcode and patient detail.',
      fr: 'Le cadre initial est une zone suggérée. Déplacez les coins ou ajustez les bords. Excluez les noms, adresses, identifiants, codes-barres et données du patient.',
      ar: 'الإطار الأولي منطقة مقترحة وليس كشفاً تلقائياً. اسحب الزوايا أو عدّل الحواف. استبعد الأسماء والعناوين والمعرّفات والباركود وكل بيانات المريض.',
    },
  'Only the selected area will appear in the next preview. Nothing is uploaded yet.':
    {
      en: 'Only the selected area will appear in the next preview. Nothing is uploaded yet.',
      fr: 'Seule la zone sélectionnée apparaîtra dans l’aperçu. Rien n’a encore été envoyé.',
      ar: 'ستظهر المنطقة المحددة فقط في المعاينة التالية. لم يتم رفع أي شيء بعد.',
    },
  edge: {
    en: 'edge',
    fr: 'bord',
    ar: 'الحافة',
  },
  'Cancel — keep image on device': {
    en: 'Cancel — keep image on device',
    fr: 'Annuler — garder l’image sur l’appareil',
    ar: 'إلغاء — إبقاء الصورة على الجهاز',
  },
  '1. Crop to medicines · 2. Check privacy · 3. Extract': {
    en: '1. Crop to medicines · 2. Check privacy · 3. Extract',
    fr: '1. Recadrer les médicaments · 2. Vérifier la confidentialité · 3. Extraire',
    ar: '1. قص الأدوية · 2. تحقق من الخصوصية · 3. استخرج',
  },
  'In the crop editor, keep only medicine information. Exclude names, birth dates, addresses, identifiers, barcodes and patient/doctor headers. If identifying text overlaps a medicine, use manual entry instead.':
    {
      en: 'In the crop editor, keep only medicine information. Exclude names, birth dates, addresses, identifiers, barcodes and patient/doctor headers. If identifying text overlaps a medicine, use manual entry instead.',
      fr: 'Ne gardez que les informations sur les médicaments. Excluez noms, dates de naissance, adresses, identifiants, codes-barres et en-têtes du patient ou médecin. Si ces données chevauchent un médicament, utilisez la saisie manuelle.',
      ar: 'احتفظ بمعلومات الأدوية فقط. استبعد الأسماء وتواريخ الميلاد والعناوين والمعرّفات والباركود وبيانات المريض والطبيب. إذا تداخلت بيانات تعريفية مع دواء، استخدم الإدخال اليدوي.',
    },
  'Checking extraction availability…': {
    en: 'Checking extraction availability…',
    fr: 'Vérification de la disponibilité de l’extraction…',
    ar: 'جارٍ التحقق من توفر الاستخراج…',
  },
  'Automatic extraction is currently unavailable. You can enter your medicines manually. No image has been sent.':
    {
      en: 'Automatic extraction is currently unavailable. You can enter your medicines manually. No image has been sent.',
      fr: 'L’extraction automatique est indisponible. Vous pouvez saisir les médicaments manuellement. Aucune image n’a été envoyée.',
      ar: 'الاستخراج التلقائي غير متوفر حالياً. يمكنك إدخال الأدوية يدوياً. لم تُرسل أي صورة.',
    },
  'Cropped medicines image — review for patient information': {
    en: 'Cropped medicines image — review for patient information',
    fr: 'Image recadrée — vérifier l’absence de données du patient',
    ar: 'صورة الأدوية المقصوصة — تحقق من خلوها من بيانات المريض',
  },
  'Only this crop will be sent through your API to OpenAI. Image metadata is removed on the server. Check the visible text carefully: cropping does not automatically detect or erase personal information.':
    {
      en: 'Only this crop will be sent through your API to OpenAI. Image metadata is removed on the server. Check the visible text carefully: cropping does not automatically detect or erase personal information.',
      fr: 'Seule cette zone sera envoyée via votre API à OpenAI. Les métadonnées sont supprimées sur le serveur. Vérifiez le texte visible : le recadrage ne détecte ni n’efface automatiquement les données personnelles.',
      ar: 'سيُرسل هذا الجزء فقط عبر واجهة البرمجة إلى OpenAI. تُزال البيانات الوصفية على الخادم. تحقق من النص الظاهر بعناية: القص لا يكشف المعلومات الشخصية أو يمحوها تلقائياً.',
    },
  'I checked this crop: only medicine information is visible, with no patient details.':
    {
      en: 'I checked this crop: only medicine information is visible, with no patient details.',
      fr: 'J’ai vérifié : seules les informations sur les médicaments sont visibles, sans données du patient.',
      ar: 'تحققت من هذا الجزء: لا تظهر سوى معلومات الأدوية، دون بيانات المريض.',
    },
  'Confirm crop contains no patient information': {
    en: 'Confirm crop contains no patient information',
    fr: 'Confirmer l’absence de données du patient',
    ar: 'تأكيد خلو الجزء المقصوص من بيانات المريض',
  },
  'I agree to send only this medicines crop to the Saydaliyati server and OpenAI for processing.':
    {
      en: 'I agree to send only this medicines crop to the Saydaliyati server and OpenAI for processing.',
      fr: 'J’accepte d’envoyer uniquement cette zone au serveur Saydaliyati et à OpenAI pour traitement.',
      ar: 'أوافق على إرسال جزء الأدوية هذا فقط إلى خادم صيدليتي وOpenAI لمعالجته.',
    },
  'Agree to server and OpenAI processing': {
    en: 'Agree to server and OpenAI processing',
    fr: 'Accepter le traitement par le serveur et OpenAI',
    ar: 'الموافقة على المعالجة بواسطة الخادم وOpenAI',
  },
  'Processing medicines crop': {
    en: 'Processing medicines crop',
    fr: 'Traitement de l’image des médicaments',
    ar: 'جارٍ معالجة صورة الأدوية',
  },
  'Review extracted suggestions': {
    en: 'Review extracted suggestions',
    fr: 'Vérifier les suggestions extraites',
    ar: 'مراجعة الاقتراحات المستخرجة',
  },
  'Compare these with the crop. Unknown values stay blank. Catalog links, doses and schedules are never confirmed automatically.':
    {
      en: 'Compare these with the crop. Unknown values stay blank. Catalog links, doses and schedules are never confirmed automatically.',
      fr: 'Comparez avec l’image. Les valeurs inconnues restent vides. Les liens du catalogue, doses et horaires ne sont jamais confirmés automatiquement.',
      ar: 'قارنها بالصورة. تبقى القيم المجهولة فارغة. لا يتم تأكيد روابط الدليل أو الجرعات أو الجداول تلقائياً.',
    },
  Medicine: {
    en: 'Medicine',
    fr: 'Médicament',
    ar: 'الدواء',
  },
  'Pack quantity:': {
    en: 'Pack quantity:',
    fr: 'Quantité de la boîte :',
    ar: 'كمية العلبة:',
  },
  'Expiry:': {
    en: 'Expiry:',
    fr: 'Péremption :',
    ar: 'الصلاحية:',
  },
  'Check the quantity you actually have; a box count is not remaining stock.': {
    en: 'Check the quantity you actually have; a box count is not remaining stock.',
    fr: 'Vérifiez la quantité réellement disponible ; le contenu d’une boîte n’est pas le stock restant.',
    ar: 'تحقق من الكمية الموجودة فعلياً؛ كمية العلبة ليست المخزون المتبقي.',
  },
  'I reviewed the suggestions. Use them to replace this draft’s current entries.':
    {
      en: 'I reviewed the suggestions. Use them to replace this draft’s current entries.',
      fr: 'J’ai vérifié les suggestions. Les utiliser pour remplacer les entrées de ce brouillon.',
      ar: 'راجعت الاقتراحات. استخدمها لاستبدال البيانات الحالية في هذه المسودة.',
    },
  'Accept extracted suggestions for editing': {
    en: 'Accept extracted suggestions for editing',
    fr: 'Accepter les suggestions pour les modifier',
    ar: 'قبول الاقتراحات المستخرجة لتعديلها',
  },
  'Unknown if blank': {
    en: 'Unknown if blank',
    fr: 'Inconnu si vide',
    ar: 'مجهول إذا كان فارغاً',
  },
  'Search catalog': {
    en: 'Search catalog',
    fr: 'Rechercher dans le catalogue',
    ar: 'البحث في الدليل',
  },
  'Clear catalog link': {
    en: 'Clear catalog link',
    fr: 'Supprimer le lien au catalogue',
    ar: 'إزالة رابط الدليل',
  },
  'I reviewed': {
    en: 'I reviewed',
    fr: 'J’ai vérifié',
    ar: 'راجعت',
  },
  'Review each value, including unknowns. Editing clears the field’s review check. Save each medicine’s review.':
    {
      en: 'Review each value, including unknowns. Editing clears the field’s review check. Save each medicine’s review.',
      fr: 'Vérifiez chaque valeur, y compris les inconnues. Une modification annule la vérification du champ. Enregistrez la vérification de chaque médicament.',
      ar: 'راجع كل قيمة بما فيها المجهولة. يلغي التعديل علامة مراجعة الحقل. احفظ مراجعة كل دواء.',
    },
  'Save this medicine review': {
    en: 'Save this medicine review',
    fr: 'Enregistrer la vérification de ce médicament',
    ar: 'حفظ مراجعة هذا الدواء',
  },
  'Reject this medicine line': {
    en: 'Reject this medicine line',
    fr: 'Rejeter cette ligne de médicament',
    ar: 'رفض سطر الدواء هذا',
  },
  'Back to prescriptions': {
    en: 'Back to prescriptions',
    fr: 'Retour aux ordonnances',
    ar: 'العودة إلى الوصفات',
  },
  'Save prescription details, attach images, and review what you entered.': {
    en: 'Save prescription details, attach images, and review what you entered.',
    fr: 'Enregistrez les détails, joignez des images et vérifiez votre saisie.',
    ar: 'احفظ تفاصيل الوصفة وأرفق الصور وراجع ما أدخلته.',
  },
  'New prescription': {
    en: 'New prescription',
    fr: 'Nouvelle ordonnance',
    ar: 'وصفة جديدة',
  },
  'Prescription ·': {
    en: 'Prescription ·',
    fr: 'Ordonnance ·',
    ar: 'وصفة ·',
  },
  'medicine lines': {
    en: 'medicine lines',
    fr: 'lignes de médicaments',
    ar: 'أسطر أدوية',
  },
  'Loading prescriptions…': {
    en: 'Loading prescriptions…',
    fr: 'Chargement des ordonnances…',
    ar: 'جارٍ تحميل الوصفات…',
  },
  'No prescriptions yet. Create a manual draft to get started.': {
    en: 'No prescriptions yet. Create a manual draft to get started.',
    fr: 'Aucune ordonnance. Créez un brouillon pour commencer.',
    ar: 'لا توجد وصفات بعد. أنشئ مسودة يدوية للبدء.',
  },
  'Review or enter the prescription details below. Unknown values stay blank. Saving creates a draft, never a confirmed treatment.':
    {
      en: 'Review or enter the prescription details below. Unknown values stay blank. Saving creates a draft, never a confirmed treatment.',
      fr: 'Vérifiez ou saisissez les détails ci-dessous. Les valeurs inconnues restent vides. L’enregistrement crée un brouillon, jamais un traitement confirmé.',
      ar: 'راجع أو أدخل تفاصيل الوصفة أدناه. تبقى القيم المجهولة فارغة. ينشئ الحفظ مسودة وليس علاجاً مؤكداً.',
    },
  'Prescription date (optional)': {
    en: 'Prescription date (optional)',
    fr: 'Date de l’ordonnance (facultative)',
    ar: 'تاريخ الوصفة (اختياري)',
  },
  'Valid until (optional)': {
    en: 'Valid until (optional)',
    fr: 'Valable jusqu’au (facultatif)',
    ar: 'صالحة حتى (اختياري)',
  },
  'Add another medicine': {
    en: 'Add another medicine',
    fr: 'Ajouter un autre médicament',
    ar: 'إضافة دواء آخر',
  },
  'Save draft': {
    en: 'Save draft',
    fr: 'Enregistrer le brouillon',
    ar: 'حفظ المسودة',
  },
  'Valid until:': {
    en: 'Valid until:',
    fr: 'Valable jusqu’au :',
    ar: 'صالحة حتى:',
  },
  'Reload prescription': {
    en: 'Reload prescription',
    fr: 'Recharger l’ordonnance',
    ar: 'إعادة تحميل الوصفة',
  },
  'Original images': {
    en: 'Original images',
    fr: 'Images originales',
    ar: 'الصور الأصلية',
  },
  'JPEG or PNG, up to 5 MiB and 20 million pixels per page. No text extraction. Original images may include location metadata; remove unwanted metadata before selecting a file.':
    {
      en: 'JPEG or PNG, up to 5 MiB and 20 million pixels per page. No text extraction. Original images may include location metadata; remove unwanted metadata before selecting a file.',
      fr: 'JPEG ou PNG, jusqu’à 5 Mio et 20 millions de pixels par page. Pas d’extraction de texte. Les images peuvent contenir des métadonnées de localisation ; supprimez-les avant de choisir le fichier.',
      ar: 'JPEG أو PNG، حتى 5 ميبيبايت و20 مليون بكسل لكل صفحة. دون استخراج النص. قد تتضمن الصور الأصلية بيانات الموقع؛ أزل البيانات غير المرغوبة قبل اختيار الملف.',
    },
  'No images attached.': {
    en: 'No images attached.',
    fr: 'Aucune image jointe.',
    ar: 'لا توجد صور مرفقة.',
  },
  'Confirm reviewed prescription': {
    en: 'Confirm reviewed prescription',
    fr: 'Confirmer l’ordonnance vérifiée',
    ar: 'تأكيد الوصفة المراجعة',
  },
  'This confirms your entered information. It is not professional verification and does not create or activate a treatment.':
    {
      en: 'This confirms your entered information. It is not professional verification and does not create or activate a treatment.',
      fr: 'Cela confirme votre saisie. Il ne s’agit pas d’une vérification professionnelle et aucun traitement n’est créé ou activé.',
      ar: 'هذا يؤكد المعلومات المدخلة. ليس تحققاً مهنياً ولا ينشئ أو يفعّل علاجاً.',
    },
  'Save your edited medicine reviews before confirming.': {
    en: 'Save your edited medicine reviews before confirming.',
    fr: 'Enregistrez les vérifications modifiées avant de confirmer.',
    ar: 'احفظ مراجعات الأدوية المعدلة قبل التأكيد.',
  },
  'Confirm prescription': {
    en: 'Confirm prescription',
    fr: 'Confirmer l’ordonnance',
    ar: 'تأكيد الوصفة',
  },
  'Archive prescription': {
    en: 'Archive prescription',
    fr: 'Archiver l’ordonnance',
    ar: 'أرشفة الوصفة',
  },
  'Catalog medicine': {
    en: 'Catalog medicine',
    fr: 'Médicament du catalogue',
    ar: 'دواء من الدليل',
  },
  'Medicine name as written': {
    en: 'Medicine name as written',
    fr: 'Nom du médicament tel qu’écrit',
    ar: 'اسم الدواء كما هو مكتوب',
  },
  Strength: {
    en: 'Strength',
    fr: 'Dosage du médicament',
    ar: 'التركيز',
  },
  Dose: {
    en: 'Dose',
    fr: 'Dose',
    ar: 'الجرعة',
  },
  'Dose unit': {
    en: 'Dose unit',
    fr: 'Unité de dose',
    ar: 'وحدة الجرعة',
  },
  Frequency: {
    en: 'Frequency',
    fr: 'Fréquence',
    ar: 'التكرار',
  },
  'Frequency unit (DAY for daily plans)': {
    en: 'Frequency unit (DAY for daily plans)',
    fr: 'Unité de fréquence (DAY pour les plans quotidiens)',
    ar: 'وحدة التكرار (DAY للخطط اليومية)',
  },
  Duration: {
    en: 'Duration',
    fr: 'Durée',
    ar: 'المدة',
  },
  'Duration unit (DAY for daily plans)': {
    en: 'Duration unit (DAY for daily plans)',
    fr: 'Unité de durée (DAY pour les plans quotidiens)',
    ar: 'وحدة المدة (DAY للخطط اليومية)',
  },
  'Prescribed quantity': {
    en: 'Prescribed quantity',
    fr: 'Quantité prescrite',
    ar: 'الكمية الموصوفة',
  },
  Instructions: {
    en: 'Instructions',
    fr: 'Instructions',
    ar: 'التعليمات',
  },
  'Daily times': {
    en: 'Daily times',
    fr: 'Horaires quotidiens',
    ar: 'الأوقات اليومية',
  },
  'Start date': {
    en: 'Start date',
    fr: 'Date de début',
    ar: 'تاريخ البدء',
  },
  'End date': {
    en: 'End date',
    fr: 'Date de fin',
    ar: 'تاريخ الانتهاء',
  },
  'Choose date': {
    en: 'Choose date',
    fr: 'Choisir une date',
    ar: 'اختر تاريخاً',
  },
  'Choose time': {
    en: 'Choose time',
    fr: 'Choisir une heure',
    ar: 'اختر وقتاً',
  },
  Clear: {
    en: 'Clear',
    fr: 'Effacer',
    ar: 'مسح',
  },
  Done: {
    en: 'Done',
    fr: 'Terminé',
    ar: 'تم',
  },
  'Add time': {
    en: 'Add time',
    fr: 'Ajouter un horaire',
    ar: 'إضافة وقت',
  },
  Remove: {
    en: 'Remove',
    fr: 'Supprimer',
    ar: 'إزالة',
  },
  'Daily time {number}': {
    en: 'Daily time {number}',
    fr: 'Horaire quotidien {number}',
    ar: 'وقت الجرعة اليومية {number}',
  },
  'Remove daily time {number}': {
    en: 'Remove daily time {number}',
    fr: 'Supprimer l’horaire {number}',
    ar: 'إزالة وقت الجرعة {number}',
  },
  'Choose each daily dose time. Leave blank if unknown.': {
    en: 'Choose each daily dose time. Leave blank if unknown.',
    fr: 'Choisissez chaque horaire. Laissez vide si inconnu.',
    ar: 'اختر وقت كل جرعة يومية. اتركه فارغاً إذا كان مجهولاً.',
  },
  'Leave unsaved changes?': {
    en: 'Leave unsaved changes?',
    fr: 'Quitter sans enregistrer ?',
    ar: 'مغادرة دون حفظ التغييرات؟',
  },
  'Unsaved entries will be lost.': {
    en: 'Unsaved entries will be lost.',
    fr: 'Les données non enregistrées seront perdues.',
    ar: 'ستفقد البيانات غير المحفوظة.',
  },
  'Keep editing': {
    en: 'Keep editing',
    fr: 'Continuer la modification',
    ar: 'متابعة التعديل',
  },
  Leave: {
    en: 'Leave',
    fr: 'Quitter',
    ar: 'مغادرة',
  },
  'Saving…': {
    en: 'Saving…',
    fr: 'Enregistrement…',
    ar: 'جارٍ الحفظ…',
  },
  Uncategorized: {
    en: 'Uncategorized',
    fr: 'Sans catégorie',
    ar: 'غير مصنف',
  },
  'Expiry not recorded': {
    en: 'Expiry not recorded',
    fr: 'Péremption non renseignée',
    ar: 'لم يُسجل تاريخ الصلاحية',
  },
  DRAFT: {
    en: 'DRAFT',
    fr: 'Brouillon',
    ar: 'مسودة',
  },
  CONFIRMED: {
    en: 'CONFIRMED',
    fr: 'Confirmée',
    ar: 'مؤكدة',
  },
  ARCHIVED: {
    en: 'ARCHIVED',
    fr: 'Archivée',
    ar: 'مؤرشفة',
  },
  PENDING: {
    en: 'PENDING',
    fr: 'En attente',
    ar: 'قيد الانتظار',
  },
  REJECTED: {
    en: 'REJECTED',
    fr: 'Rejeté',
    ar: 'مرفوض',
  },
  'Open quick actions': {
    en: 'Open quick actions',
    fr: 'Ouvrir les actions rapides',
    ar: 'فتح الإجراءات السريعة',
  },
  'Continue to my pharmacy': {
    en: 'Continue to my pharmacy',
    fr: 'Continuer vers ma pharmacie',
    ar: 'المتابعة إلى صيدليتي',
  },
  'Which languages are available?': {
    en: 'Which languages are available?',
    fr: 'Quelles langues sont disponibles ?',
    ar: 'ما اللغات المتوفرة؟',
  },
  'Create my account': {
    en: 'Create my account',
    fr: 'Créer mon compte',
    ar: 'إنشاء حسابي',
  },
  'Search medicines': {
    en: 'Search medicines',
    fr: 'Rechercher des médicaments',
    ar: 'البحث عن الأدوية',
  },
  'Suggestions unavailable. You can still search.': {
    en: 'Suggestions unavailable. You can still search.',
    fr: 'Suggestions indisponibles. Vous pouvez toujours rechercher.',
    ar: 'الاقتراحات غير متوفرة. لا يزال بإمكانك البحث.',
  },
  'In pharmacy': {
    en: 'In pharmacy',
    fr: 'En pharmacie',
    ar: 'في الصيدلية',
  },
  'Active plans': {
    en: 'Active plans',
    fr: 'Traitements actifs',
    ar: 'الخطط النشطة',
  },
  'Your pharmacy starts here': {
    en: 'Your pharmacy starts here',
    fr: 'Votre pharmacie commence ici',
    ar: 'تبدأ صيدليتك هنا',
  },
  'No matching medicines': {
    en: 'No matching medicines',
    fr: 'Aucun médicament correspondant',
    ar: 'لا توجد أدوية مطابقة',
  },
  'Add your first medicine to keep track of what you have at home.': {
    en: 'Add your first medicine to keep track of what you have at home.',
    fr: 'Ajoutez votre premier médicament pour suivre votre stock à domicile.',
    ar: 'أضف دواءك الأول لمتابعة ما لديك في المنزل.',
  },
  'Try another filter to see your stock.': {
    en: 'Try another filter to see your stock.',
    fr: 'Essayez un autre filtre pour voir votre stock.',
    ar: 'جرّب مرشحاً آخر لعرض مخزونك.',
  },
  'Check that the scanned box matches the selected catalog medicine and that the quantity is your remaining stock.':
    {
      en: 'Check that the scanned box matches the selected catalog medicine and that the quantity is your remaining stock.',
      fr: 'Vérifiez que la boîte correspond au médicament choisi et que la quantité est votre stock restant.',
      ar: 'تحقق من مطابقة العلبة للدواء المختار ومن أن الكمية تمثل مخزونك المتبقي.',
    },
  'Top left crop handle': {
    en: 'Top left crop handle',
    fr: 'Poignée du coin supérieur gauche',
    ar: 'مقبض القص العلوي الأيسر',
  },
  'Bottom right crop handle': {
    en: 'Bottom right crop handle',
    fr: 'Poignée du coin inférieur droit',
    ar: 'مقبض القص السفلي الأيمن',
  },
  'The crop could not be created. Adjust the selection or choose another photo.':
    {
      en: 'The crop could not be created. Adjust the selection or choose another photo.',
      fr: 'Impossible de recadrer l’image. Ajustez la sélection ou choisissez une autre photo.',
      ar: 'تعذر قص الصورة. عدّل التحديد أو اختر صورة أخرى.',
    },
  'Creating crop…': {
    en: 'Creating crop…',
    fr: 'Recadrage en cours…',
    ar: 'جارٍ قص الصورة…',
  },
  'Use this crop and review privacy': {
    en: 'Use this crop and review privacy',
    fr: 'Utiliser ce recadrage et vérifier la confidentialité',
    ar: 'استخدم هذا الجزء وراجع الخصوصية',
  },
  'Use the native app to crop prescription images.': {
    en: 'Use the native app to crop prescription images.',
    fr: 'Utilisez l’application mobile pour recadrer les ordonnances.',
    ar: 'استخدم التطبيق الأصلي لقص صور الوصفات.',
  },
  'Camera access is needed. Enable it in phone settings or choose an image instead.':
    {
      en: 'Camera access is needed. Enable it in phone settings or choose an image instead.',
      fr: 'L’accès à la caméra est nécessaire. Autorisez-le dans les paramètres ou choisissez une image.',
      ar: 'يلزم الوصول إلى الكاميرا. فعّله من إعدادات الهاتف أو اختر صورة.',
    },
  'Choose a local image that can be cropped.': {
    en: 'Choose a local image that can be cropped.',
    fr: 'Choisissez une image locale pouvant être recadrée.',
    ar: 'اختر صورة محلية يمكن قصها.',
  },
  'Unable to open image.': {
    en: 'Unable to open image.',
    fr: 'Impossible d’ouvrir l’image.',
    ar: 'تعذر فتح الصورة.',
  },
  'No readable medicine lines found. Try a tighter, clearer crop or enter details manually.':
    {
      en: 'No readable medicine lines found. Try a tighter, clearer crop or enter details manually.',
      fr: 'Aucun médicament lisible trouvé. Essayez un recadrage plus net ou saisissez manuellement.',
      ar: 'لم يتم العثور على أسطر أدوية مقروءة. جرّب قصاً أوضح أو أدخل التفاصيل يدوياً.',
    },
  'Your server has not configured OpenAI extraction yet.': {
    en: 'Your server has not configured OpenAI extraction yet.',
    fr: 'L’extraction OpenAI n’est pas encore configurée sur votre serveur.',
    ar: 'لم يُعدّ خادمك استخراج OpenAI بعد.',
  },
  'Scan limit reached. Wait before trying again.': {
    en: 'Scan limit reached. Wait before trying again.',
    fr: 'Limite de scans atteinte. Patientez avant de réessayer.',
    ar: 'تم بلوغ حد المسح. انتظر قبل المحاولة مجدداً.',
  },
  'Extraction could not be completed. Try a clearer crop or enter details manually.':
    {
      en: 'Extraction could not be completed. Try a clearer crop or enter details manually.',
      fr: 'L’extraction a échoué. Essayez une image plus nette ou la saisie manuelle.',
      ar: 'تعذر إتمام الاستخراج. جرّب صورة أوضح أو أدخل التفاصيل يدوياً.',
    },
  'Scan a medicine box': {
    en: 'Scan a medicine box',
    fr: 'Scanner une boîte de médicament',
    ar: 'مسح علبة دواء',
  },
  'Scan your prescription': {
    en: 'Scan your prescription',
    fr: 'Scanner votre ordonnance',
    ar: 'مسح وصفتك',
  },
  'Take photo': {
    en: 'Take photo',
    fr: 'Prendre une photo',
    ar: 'التقاط صورة',
  },
  'Choose image': {
    en: 'Choose image',
    fr: 'Choisir une image',
    ar: 'اختيار صورة',
  },
  'Check again': {
    en: 'Check again',
    fr: 'Vérifier à nouveau',
    ar: 'التحقق مجدداً',
  },
  'Send medicines crop to OpenAI': {
    en: 'Send medicines crop to OpenAI',
    fr: 'Envoyer le recadrage des médicaments à OpenAI',
    ar: 'إرسال صورة الأدوية المقصوصة إلى OpenAI',
  },
  'Remove crop': {
    en: 'Remove crop',
    fr: 'Supprimer le recadrage',
    ar: 'إزالة الجزء المقصوص',
  },
  'Use suggestions in the form': {
    en: 'Use suggestions in the form',
    fr: 'Utiliser les suggestions dans le formulaire',
    ar: 'استخدام الاقتراحات في النموذج',
  },
  'Catalog medicine linked. Search to replace it.': {
    en: 'Catalog medicine linked. Search to replace it.',
    fr: 'Médicament lié au catalogue. Recherchez pour le remplacer.',
    ar: 'تم ربط الدواء بالدليل. ابحث لاستبداله.',
  },
  'Choose a medicine or keep the written name.': {
    en: 'Choose a medicine or keep the written name.',
    fr: 'Choisissez un médicament ou gardez le nom écrit.',
    ar: 'اختر دواءً أو احتفظ بالاسم المكتوب.',
  },
  'Choose an image with no more than 20 million pixels.': {
    en: 'Choose an image with no more than 20 million pixels.',
    fr: 'Choisissez une image de 20 millions de pixels maximum.',
    ar: 'اختر صورة لا تتجاوز 20 مليون بكسل.',
  },
  'The image could not be selected. Try a JPEG or PNG from your library.': {
    en: 'The image could not be selected. Try a JPEG or PNG from your library.',
    fr: 'Impossible de sélectionner l’image. Essayez un JPEG ou PNG de votre galerie.',
    ar: 'تعذر اختيار الصورة. جرّب JPEG أو PNG من مكتبتك.',
  },
  'Reload saved values?': {
    en: 'Reload saved values?',
    fr: 'Recharger les valeurs enregistrées ?',
    ar: 'إعادة تحميل القيم المحفوظة؟',
  },
  'Unsaved edits will be discarded.': {
    en: 'Unsaved edits will be discarded.',
    fr: 'Les modifications non enregistrées seront perdues.',
    ar: 'ستُفقد التعديلات غير المحفوظة.',
  },
  'Invalid document link.': {
    en: 'Invalid document link.',
    fr: 'Lien du document invalide.',
    ar: 'رابط المستند غير صالح.',
  },
  'Reject this medicine?': {
    en: 'Reject this medicine?',
    fr: 'Rejeter ce médicament ?',
    ar: 'رفض هذا الدواء؟',
  },
  'It remains in history and cannot be restored through this workflow.': {
    en: 'It remains in history and cannot be restored through this workflow.',
    fr: 'Il reste dans l’historique et ne peut pas être restauré ici.',
    ar: 'يبقى في السجل ولا يمكن استعادته عبر هذا المسار.',
  },
  'Confirm prescription?': {
    en: 'Confirm prescription?',
    fr: 'Confirmer l’ordonnance ?',
    ar: 'تأكيد الوصفة؟',
  },
  'The saved review will be finalized and cannot be edited. No treatment is started.':
    {
      en: 'The saved review will be finalized and cannot be edited. No treatment is started.',
      fr: 'La vérification enregistrée sera finalisée et ne pourra plus être modifiée. Aucun traitement ne sera démarré.',
      ar: 'ستُعتمد المراجعة المحفوظة ولن يمكن تعديلها. لن يبدأ أي علاج.',
    },
  'Archive prescription?': {
    en: 'Archive prescription?',
    fr: 'Archiver l’ordonnance ?',
    ar: 'أرشفة الوصفة؟',
  },
  'Documents and history are preserved. Restoring is not available.': {
    en: 'Documents and history are preserved. Restoring is not available.',
    fr: 'Les documents et l’historique sont conservés. La restauration est indisponible.',
    ar: 'تُحفظ المستندات والسجل. الاستعادة غير متوفرة.',
  },
  Unknown: {
    en: 'Unknown',
    fr: 'Inconnu',
    ar: 'مجهول',
  },
  ' (unknown)': {
    en: ' (unknown)',
    fr: ' (inconnu)',
    ar: ' (مجهول)',
  },
  All: {
    en: 'All',
    fr: 'Tous',
    ar: 'الكل',
  },
  Expired: {
    en: 'Expired',
    fr: 'Périmés',
    ar: 'منتهية الصلاحية',
  },
  Active: {
    en: 'Active',
    fr: 'Actifs',
    ar: 'نشطة',
  },
  Archived: {
    en: 'Archived',
    fr: 'Archivées',
    ar: 'مؤرشفة',
  },
  'Review schedule · ends {date}': {
    en: 'Review schedule · ends {date}',
    fr: 'Consulter le programme · fin le {date}',
    ar: 'مراجعة الجدول · ينتهي في {date}',
  },
  'Remove medicine {number}': {
    en: 'Remove medicine {number}',
    fr: 'Supprimer le médicament {number}',
    ar: 'إزالة الدواء {number}',
  },
  'Open page {number}': {
    en: 'Open page {number}',
    fr: 'Ouvrir la page {number}',
    ar: 'فتح الصفحة {number}',
  },
  'Attach image page {number}': {
    en: 'Attach image page {number}',
    fr: 'Joindre l’image de la page {number}',
    ar: 'إرفاق صورة الصفحة {number}',
  },
  'Expiry: {date}': {
    en: 'Expiry: {date}',
    fr: 'Péremption : {date}',
    ar: 'الصلاحية: {date}',
  },
  tablet: {
    en: 'tablet',
    fr: 'comprimé',
    ar: 'قرص',
  },
  capsule: {
    en: 'capsule',
    fr: 'gélule',
    ar: 'كبسولة',
  },
  ml: {
    en: 'ml',
    fr: 'ml',
    ar: 'مل',
  },
  mg: {
    en: 'mg',
    fr: 'mg',
    ar: 'ملغ',
  },
  g: {
    en: 'g',
    fr: 'g',
    ar: 'غ',
  },
  dose: {
    en: 'dose',
    fr: 'dose',
    ar: 'جرعة',
  },
  sachet: {
    en: 'sachet',
    fr: 'sachet',
    ar: 'كيس',
  },
  ampoule: {
    en: 'ampoule',
    fr: 'ampoule',
    ar: 'أمبولة',
  },
  vial: {
    en: 'vial',
    fr: 'flacon',
    ar: 'قارورة',
  },
  suppository: {
    en: 'suppository',
    fr: 'suppositoire',
    ar: 'تحميلة',
  },
  drop: {
    en: 'drop',
    fr: 'goutte',
    ar: 'قطرة',
  },
  patch: {
    en: 'patch',
    fr: 'patch',
    ar: 'لصقة',
  },
  other: {
    en: 'other',
    fr: 'autre',
    ar: 'أخرى',
  },
  'Enter a quantity of 0 or more, with up to 3 decimal places.': {
    en: 'Enter a quantity of 0 or more, with up to 3 decimal places.',
    fr: 'Saisissez une quantité positive ou nulle, avec au plus 3 décimales.',
    ar: 'أدخل كمية تساوي صفراً أو أكثر، حتى 3 منازل عشرية.',
  },
  'Choose the unit shown on your medicine packaging.': {
    en: 'Choose the unit shown on your medicine packaging.',
    fr: 'Choisissez l’unité indiquée sur l’emballage.',
    ar: 'اختر الوحدة الموضحة على عبوة الدواء.',
  },
  'Enter a valid expiry date as YYYY-MM-DD.': {
    en: 'Enter a valid expiry date as YYYY-MM-DD.',
    fr: 'Choisissez une date de péremption valide.',
    ar: 'اختر تاريخ صلاحية صالحاً.',
  },
  'Draft saved. Review the fields before confirming.': {
    en: 'Draft saved. Review the fields before confirming.',
    fr: 'Brouillon enregistré. Vérifiez les champs avant de confirmer.',
    ar: 'تم حفظ المسودة. راجع الحقول قبل التأكيد.',
  },
  'Prescription updated.': {
    en: 'Prescription updated.',
    fr: 'Ordonnance mise à jour.',
    ar: 'تم تحديث الوصفة.',
  },
};
export function translate(
  language: Language,
  key: string,
  values: Record<string, string | number> = {},
): string {
  return (messages[key]?.[language] ?? key).replace(
    /\{(\w+)\}/g,
    (match, name: string) => String(values[name] ?? match),
  );
}
