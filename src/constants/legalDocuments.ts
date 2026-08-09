import type { SupportedLanguageCode } from '../services/localization/languages';

export type LegalDocumentKind = 'privacy' | 'terms' | 'financial';

type LegalSection = {
  heading: string;
  paragraphs: string[];
};

export type LegalDocument = {
  title: string;
  meta: string;
  sections: LegalSection[];
};

type LegalDocumentSet = Record<LegalDocumentKind, LegalDocument>;

const en: LegalDocumentSet = {
  privacy: {
    title: 'Privacy policy',
    meta: 'Version 1.0.0 · Effective 9 August 2026',
    sections: [
      {
        heading: '1. Who controls your data',
        paragraphs: [
          'Pocket Ahead is published by Kael Labs. For privacy or data-rights requests, contact the publisher through Contact support in the app or the contact channel shown on the Google Play listing.',
        ],
      },
      {
        heading: '2. Data we process',
        paragraphs: [
          'We process your account identifier and email; optional profile and onboarding details; income, transactions, bills, debts, goals and contributions; language, currency, theme and notification preferences; and an optional profile image.',
          'Religion or cultural-event preferences are optional and are processed only after explicit consent. Pocket Ahead does not sell personal data, show targeted advertising, connect to bank accounts, or send your financial records to a generative-AI provider.',
        ],
      },
      {
        heading: '3. Why we process it',
        paragraphs: [
          'We use this data to calculate and display your plan, synchronize it across your signed-in devices, protect your account, provide requested features, and respond to support or legal requests. Optional sensitive preferences rely on your consent, which you can withdraw in the app.',
        ],
      },
      {
        heading: '4. Service providers and transfers',
        paragraphs: [
          'Supabase provides account authentication, database synchronization, file storage and account deletion infrastructure. If you choose Google sign-in, Google processes the authentication request. Android and Google Play may process technical data under their own terms. These providers may process data outside your country using their applicable safeguards.',
        ],
      },
      {
        heading: '5. Retention, export and deletion',
        paragraphs: [
          'Active account data is kept while your account is in use. You can export a machine-readable copy or permanently delete your account from Profile. Deletion removes active app records and authentication access; limited security logs and encrypted backups may remain temporarily for fraud prevention, legal compliance and provider backup rotation before expiry.',
        ],
      },
      {
        heading: '6. Your choices and security',
        paragraphs: [
          'You can correct profile information, change optional preferences, withdraw optional consent, export your data, and delete your account. Pocket Ahead uses access controls, encrypted transport and secure device storage, but no service can guarantee absolute security.',
        ],
      },
      {
        heading: '7. Age and policy changes',
        paragraphs: [
          'Pocket Ahead is intended for adults aged 18 or over. Material policy changes will be reflected by an updated effective date and, when appropriate, an in-app notice.',
        ],
      },
    ],
  },
  terms: {
    title: 'Terms of use',
    meta: 'Version 1.0.0 · Effective 9 August 2026',
    sections: [
      { heading: '1. Eligibility and acceptance', paragraphs: ['You must be at least 18 and legally able to accept these terms. By using Pocket Ahead, you agree to these terms and the privacy policy.'] },
      { heading: '2. Your account', paragraphs: ['Keep your credentials and device secure and provide accurate information. You are responsible for activity performed through your account. Tell the publisher promptly if you suspect unauthorized access.'] },
      { heading: '3. Permitted use', paragraphs: ['Pocket Ahead grants you a personal, limited, revocable right to use the app for lawful personal budgeting and planning. Do not scrape, reverse engineer, disrupt, misuse, or attempt to bypass the app or its security controls.'] },
      { heading: '4. Your data and synchronization', paragraphs: ['You retain responsibility for the information you enter. Signed-in use may synchronize data through Supabase; guest data remains local until you sign in and choose to migrate it. Keep independent records of information you cannot afford to lose.'] },
      { heading: '5. No financial services or advice', paragraphs: ['Pocket Ahead is a planning tool, not a bank, lender, broker, accountant, tax adviser or financial adviser. It does not hold, move or invest money. Calculations are estimates based on the information you provide and may be incomplete or inaccurate.'] },
      { heading: '6. Availability and changes', paragraphs: ['The service may be interrupted for maintenance, security or causes outside the publisher’s control. Features may change when necessary for safety, compliance or reliable operation.'] },
      { heading: '7. Deletion and termination', paragraphs: ['You may delete your account in the app. The publisher may suspend access when reasonably necessary to protect users, comply with law, or address serious misuse.'] },
      { heading: '8. Disclaimer and liability', paragraphs: ['Pocket Ahead is provided “as is” and “as available” to the extent permitted by law. The publisher does not guarantee a financial outcome. Liability is limited only to the extent allowed by applicable law; mandatory consumer rights are not excluded.'] },
      { heading: '9. Applicable law', paragraphs: ['These terms are governed by the law applicable to the publisher, subject to any mandatory consumer protections that apply where you live.'] },
    ],
  },
  financial: {
    title: 'Financial disclaimer',
    meta: 'Version 1.0.0 · Effective 9 August 2026',
    sections: [
      { heading: '1. Planning tool only', paragraphs: ['Pocket Ahead helps you record information and estimate budgets, obligations, goals and safe-to-spend amounts. Its output is educational planning information, not personalized financial advice.'] },
      { heading: '2. Not a financial institution', paragraphs: ['Pocket Ahead is not a bank, lender, broker, insurer, accountant or tax adviser. It does not connect to, hold, transfer, trade or invest real money.'] },
      { heading: '3. Estimates can change', paragraphs: ['Results depend on the amounts, dates and categories you enter. Missing, late or inaccurate data can make balances, projections, warnings and daily allowances inaccurate. Future income and expenses are not guaranteed.'] },
      { heading: '4. Your responsibility', paragraphs: ['Check important figures against your bank statements and contractual obligations before acting. For debt, tax, investment, credit or other high-impact decisions, consult a suitably qualified professional.'] },
      { heading: '5. Urgent situations', paragraphs: ['Do not rely on Pocket Ahead for emergency decisions. If you cannot meet essential costs or debt payments, contact the relevant provider, a qualified adviser, or local support service promptly.'] },
    ],
  },
};

const fr: LegalDocumentSet = {
  privacy: {
    title: 'Politique de confidentialité', meta: 'Version 1.0.0 · En vigueur le 9 août 2026', sections: [
      { heading: '1. Responsable de vos données', paragraphs: ['Pocket Ahead est publié par Kael Labs. Pour toute demande relative à la confidentialité ou à vos droits, contactez l’éditeur via Contacter l’assistance dans l’application ou le canal indiqué sur la fiche Google Play.'] },
      { heading: '2. Données traitées', paragraphs: ['Nous traitons votre identifiant de compte et votre e-mail ; les informations facultatives de profil et d’intégration ; les revenus, transactions, factures, dettes, objectifs et contributions ; les préférences de langue, devise, thème et notifications ; ainsi qu’une photo de profil facultative.', 'Les préférences religieuses ou liées à des événements culturels sont facultatives et ne sont traitées qu’après consentement explicite. Pocket Ahead ne vend pas de données personnelles, ne diffuse pas de publicité ciblée, ne se connecte pas aux comptes bancaires et n’envoie pas vos données financières à un fournisseur d’IA générative.'] },
      { heading: '3. Finalités', paragraphs: ['Ces données servent à calculer et afficher votre plan, le synchroniser entre vos appareils connectés, protéger votre compte, fournir les fonctions demandées et répondre aux demandes d’assistance ou légales. Vous pouvez retirer votre consentement facultatif dans l’application.'] },
      { heading: '4. Prestataires et transferts', paragraphs: ['Supabase fournit l’authentification, la synchronisation de base de données, le stockage de fichiers et la suppression de compte. Si vous choisissez Google, Google traite la connexion. Android et Google Play peuvent traiter des données techniques selon leurs propres conditions. Ces prestataires peuvent traiter des données hors de votre pays avec leurs garanties applicables.'] },
      { heading: '5. Conservation, export et suppression', paragraphs: ['Les données actives sont conservées tant que le compte est utilisé. Depuis Profil, vous pouvez exporter une copie lisible par machine ou supprimer définitivement le compte. La suppression efface les données actives et l’accès ; certains journaux de sécurité et sauvegardes chiffrées peuvent subsister temporairement pour la prévention de la fraude, les obligations légales et la rotation des sauvegardes.'] },
      { heading: '6. Vos choix et la sécurité', paragraphs: ['Vous pouvez corriger votre profil, modifier les préférences facultatives, retirer un consentement, exporter vos données et supprimer le compte. Pocket Ahead utilise des contrôles d’accès, le transport chiffré et le stockage sécurisé de l’appareil, sans pouvoir garantir une sécurité absolue.'] },
      { heading: '7. Âge et modifications', paragraphs: ['Pocket Ahead est destiné aux adultes de 18 ans ou plus. Toute modification importante sera indiquée par une nouvelle date d’entrée en vigueur et, si nécessaire, un avis dans l’application.'] },
    ],
  },
  terms: {
    title: 'Conditions d’utilisation', meta: 'Version 1.0.0 · En vigueur le 9 août 2026', sections: [
      { heading: '1. Éligibilité et acceptation', paragraphs: ['Vous devez avoir au moins 18 ans et la capacité juridique d’accepter ces conditions. En utilisant Pocket Ahead, vous acceptez ces conditions et la politique de confidentialité.'] },
      { heading: '2. Votre compte', paragraphs: ['Protégez vos identifiants et votre appareil et fournissez des informations exactes. Vous êtes responsable des activités réalisées avec votre compte. Signalez rapidement tout accès non autorisé suspecté.'] },
      { heading: '3. Utilisation autorisée', paragraphs: ['Pocket Ahead vous accorde un droit personnel, limité et révocable d’utiliser l’application pour une budgétisation légale. Il est interdit d’extraire, de rétroconcevoir, de perturber ou de contourner l’application ou ses contrôles de sécurité.'] },
      { heading: '4. Vos données et la synchronisation', paragraphs: ['Vous restez responsable des informations saisies. Les données d’un compte connecté peuvent être synchronisées via Supabase ; les données invitées restent locales jusqu’à votre connexion et votre choix de migration. Conservez une copie indépendante des informations essentielles.'] },
      { heading: '5. Aucun service ni conseil financier', paragraphs: ['Pocket Ahead est un outil de planification, pas une banque, un prêteur, un courtier, un comptable, un conseiller fiscal ou financier. Il ne détient, ne déplace ni n’investit d’argent. Les calculs sont des estimations fondées sur vos données.'] },
      { heading: '6. Disponibilité et changements', paragraphs: ['Le service peut être interrompu pour maintenance, sécurité ou pour des causes externes. Des fonctions peuvent changer pour assurer la sécurité, la conformité ou la fiabilité.'] },
      { heading: '7. Suppression et suspension', paragraphs: ['Vous pouvez supprimer votre compte dans l’application. L’éditeur peut suspendre l’accès lorsque cela est raisonnablement nécessaire pour protéger les utilisateurs, respecter la loi ou traiter un abus grave.'] },
      { heading: '8. Exclusion et responsabilité', paragraphs: ['Pocket Ahead est fourni « en l’état » et « selon disponibilité » dans les limites de la loi. Aucun résultat financier n’est garanti. La responsabilité n’est limitée que dans la mesure autorisée ; les droits impératifs des consommateurs restent applicables.'] },
      { heading: '9. Droit applicable', paragraphs: ['Ces conditions sont régies par le droit applicable à l’éditeur, sous réserve des protections impératives des consommateurs de votre lieu de résidence.'] },
    ],
  },
  financial: {
    title: 'Avertissement financier', meta: 'Version 1.0.0 · En vigueur le 9 août 2026', sections: [
      { heading: '1. Outil de planification uniquement', paragraphs: ['Pocket Ahead vous aide à enregistrer des informations et à estimer budgets, obligations, objectifs et montant disponible. Ses résultats sont informatifs et ne constituent pas un conseil financier personnalisé.'] },
      { heading: '2. Pas un établissement financier', paragraphs: ['Pocket Ahead n’est ni une banque, ni un prêteur, courtier, assureur, comptable ou conseiller fiscal. Il ne se connecte pas à des comptes bancaires et ne détient, transfère, négocie ou investit aucun argent réel.'] },
      { heading: '3. Les estimations peuvent changer', paragraphs: ['Les résultats dépendent des montants, dates et catégories saisis. Des données manquantes, tardives ou inexactes peuvent fausser soldes, projections, alertes et budgets quotidiens.'] },
      { heading: '4. Votre responsabilité', paragraphs: ['Vérifiez les chiffres importants avec vos relevés et obligations contractuelles. Pour les dettes, impôts, investissements, crédits ou décisions importantes, consultez un professionnel qualifié.'] },
      { heading: '5. Situations urgentes', paragraphs: ['Ne vous fiez pas à Pocket Ahead pour une décision d’urgence. Si vous ne pouvez pas payer vos besoins essentiels ou vos dettes, contactez rapidement le prestataire concerné, un conseiller qualifié ou un service d’aide local.'] },
    ],
  },
};

const ar: LegalDocumentSet = {
  privacy: {
    title: 'سياسة الخصوصية', meta: 'الإصدار 1.0.0 · سارية من 9 أغسطس 2026', sections: [
      { heading: '1. الجهة المسؤولة عن بياناتك', paragraphs: ['يُنشر Pocket Ahead بواسطة Kael Labs. لطلبات الخصوصية أو حقوق البيانات، تواصل مع الناشر عبر «الاتصال بالدعم» داخل التطبيق أو قناة الاتصال المعروضة في صفحة Google Play.'] },
      { heading: '2. البيانات التي نعالجها', paragraphs: ['نعالج معرّف الحساب والبريد الإلكتروني؛ وبيانات الملف الشخصي والإعداد الاختيارية؛ والدخل والمعاملات والفواتير والديون والأهداف والمساهمات؛ وتفضيلات اللغة والعملة والمظهر والإشعارات؛ وصورة ملف شخصي اختيارية.', 'تفضيلات الدين أو المناسبات الثقافية اختيارية ولا تُعالج إلا بعد موافقة صريحة. لا يبيع Pocket Ahead البيانات الشخصية، ولا يعرض إعلانات موجهة، ولا يتصل بالحسابات البنكية، ولا يرسل سجلاتك المالية إلى مزود ذكاء اصطناعي توليدي.'] },
      { heading: '3. أسباب المعالجة', paragraphs: ['نستخدم البيانات لحساب خطتك وعرضها ومزامنتها بين أجهزتك المسجل دخولها، وحماية حسابك، وتقديم الميزات المطلوبة، والرد على طلبات الدعم أو الطلبات القانونية. يمكنك سحب الموافقات الاختيارية من التطبيق.'] },
      { heading: '4. مزودو الخدمة ونقل البيانات', paragraphs: ['توفر Supabase المصادقة ومزامنة قاعدة البيانات وتخزين الملفات وحذف الحساب. عند اختيار تسجيل الدخول عبر Google، تعالج Google طلب المصادقة. قد يعالج Android وGoogle Play بيانات تقنية وفق شروطهما. وقد تتم المعالجة خارج بلدك مع تطبيق الضمانات المناسبة لدى المزود.'] },
      { heading: '5. الاحتفاظ والتصدير والحذف', paragraphs: ['تُحفظ بيانات الحساب النشطة ما دام الحساب مستخدماً. يمكنك من صفحة الملف الشخصي تصدير نسخة قابلة للقراءة آلياً أو حذف الحساب نهائياً. يزيل الحذف السجلات النشطة والوصول؛ وقد تبقى سجلات أمنية محدودة ونسخ احتياطية مشفرة مؤقتاً لمنع الاحتيال والامتثال القانوني ودورة النسخ الاحتياطي.'] },
      { heading: '6. خياراتك والأمان', paragraphs: ['يمكنك تصحيح الملف الشخصي وتغيير التفضيلات الاختيارية وسحب الموافقة وتصدير البيانات وحذف الحساب. يستخدم Pocket Ahead ضوابط وصول ونقلاً مشفراً وتخزيناً آمناً على الجهاز، لكن لا يمكن لأي خدمة ضمان أمان مطلق.'] },
      { heading: '7. العمر وتغييرات السياسة', paragraphs: ['Pocket Ahead مخصص للبالغين بعمر 18 سنة أو أكثر. ستظهر التغييرات الجوهرية بتاريخ سريان محدث، وعند الحاجة بإشعار داخل التطبيق.'] },
    ],
  },
  terms: {
    title: 'شروط الاستخدام', meta: 'الإصدار 1.0.0 · سارية من 9 أغسطس 2026', sections: [
      { heading: '1. الأهلية والموافقة', paragraphs: ['يجب أن يكون عمرك 18 سنة على الأقل وأن تكون مؤهلاً قانونياً لقبول هذه الشروط. باستخدام Pocket Ahead فإنك توافق على هذه الشروط وسياسة الخصوصية.'] },
      { heading: '2. حسابك', paragraphs: ['حافظ على أمان بيانات الدخول والجهاز وقدّم معلومات دقيقة. أنت مسؤول عن النشاط المنفذ عبر حسابك. أبلغ الناشر سريعاً عند الاشتباه بوصول غير مصرح به.'] },
      { heading: '3. الاستخدام المسموح', paragraphs: ['يمنحك Pocket Ahead حقاً شخصياً محدوداً وقابلاً للإلغاء لاستخدام التطبيق للتخطيط المالي الشخصي المشروع. لا يجوز جمع البيانات آلياً أو إجراء هندسة عكسية أو تعطيل التطبيق أو تجاوز ضوابطه الأمنية.'] },
      { heading: '4. بياناتك والمزامنة', paragraphs: ['تبقى مسؤولاً عن المعلومات التي تدخلها. قد تُزامن بيانات الحساب المسجل عبر Supabase؛ وتبقى بيانات الضيف محلية حتى تسجل الدخول وتختار نقلها. احتفظ بنسخة مستقلة من المعلومات التي لا يمكنك تحمل فقدانها.'] },
      { heading: '5. لا خدمات أو نصائح مالية', paragraphs: ['Pocket Ahead أداة تخطيط وليس بنكاً أو مقرضاً أو وسيطاً أو محاسباً أو مستشاراً ضريبياً أو مالياً. لا يحتفظ بالأموال ولا ينقلها أو يستثمرها. الحسابات تقديرية وتعتمد على معلوماتك.'] },
      { heading: '6. التوفر والتغييرات', paragraphs: ['قد تتوقف الخدمة للصيانة أو الأمان أو لأسباب خارج سيطرة الناشر. وقد تتغير الميزات عند الحاجة للسلامة أو الامتثال أو التشغيل الموثوق.'] },
      { heading: '7. الحذف والإيقاف', paragraphs: ['يمكنك حذف حسابك داخل التطبيق. وقد يوقف الناشر الوصول عند الضرورة المعقولة لحماية المستخدمين أو الامتثال للقانون أو معالجة إساءة استخدام خطيرة.'] },
      { heading: '8. إخلاء المسؤولية وحدودها', paragraphs: ['يُقدّم Pocket Ahead «كما هو» و«حسب التوفر» في حدود القانون. لا يضمن الناشر نتيجة مالية. ولا تُحد المسؤولية إلا بالقدر الذي يسمح به القانون مع بقاء حقوق المستهلك الإلزامية.'] },
      { heading: '9. القانون المطبق', paragraphs: ['تخضع هذه الشروط للقانون المطبق على الناشر، مع مراعاة حماية المستهلك الإلزامية في مكان إقامتك.'] },
    ],
  },
  financial: {
    title: 'إخلاء المسؤولية المالية', meta: 'الإصدار 1.0.0 · سارية من 9 أغسطس 2026', sections: [
      { heading: '1. أداة تخطيط فقط', paragraphs: ['يساعدك Pocket Ahead على تسجيل المعلومات وتقدير الميزانيات والالتزامات والأهداف والمبلغ الآمن للإنفاق. مخرجاته معلومات تعليمية للتخطيط وليست نصيحة مالية شخصية.'] },
      { heading: '2. ليس مؤسسة مالية', paragraphs: ['Pocket Ahead ليس بنكاً أو مقرضاً أو وسيطاً أو شركة تأمين أو محاسباً أو مستشاراً ضريبياً. ولا يتصل بالحسابات البنكية أو يحتفظ بأموال حقيقية أو ينقلها أو يتداولها أو يستثمرها.'] },
      { heading: '3. التقديرات قابلة للتغيير', paragraphs: ['تعتمد النتائج على المبالغ والتواريخ والتصنيفات التي تدخلها. وقد تجعل البيانات الناقصة أو المتأخرة أو غير الدقيقة الأرصدة والتوقعات والتنبيهات والمخصص اليومي غير دقيقة.'] },
      { heading: '4. مسؤوليتك', paragraphs: ['راجع الأرقام المهمة مقابل كشوف البنك والالتزامات التعاقدية قبل اتخاذ إجراء. استشر مختصاً مؤهلاً في قرارات الديون أو الضرائب أو الاستثمار أو الائتمان أو القرارات الكبيرة.'] },
      { heading: '5. الحالات العاجلة', paragraphs: ['لا تعتمد على Pocket Ahead لاتخاذ قرارات طارئة. إذا تعذر دفع التكاليف الأساسية أو الديون، تواصل سريعاً مع الجهة المعنية أو مستشار مؤهل أو خدمة دعم محلية.'] },
    ],
  },
};

type SectionInput = [heading: string, paragraphs: string | string[]];

const makeSections = (items: SectionInput[]): LegalSection[] => items.map(([heading, paragraphs]) => ({
  heading,
  paragraphs: Array.isArray(paragraphs) ? paragraphs : [paragraphs],
}));

const es: LegalDocumentSet = {
  privacy: {
    title: 'Política de privacidad', meta: 'Versión 1.0.0 · Vigente desde el 9 de agosto de 2026', sections: makeSections([
      ['1. Responsable de tus datos', 'Pocket Ahead es publicado por Kael Labs. Para solicitudes de privacidad o derechos sobre los datos, contacta al editor mediante Contactar con soporte en la aplicación o el canal indicado en Google Play.'],
      ['2. Datos que tratamos', ['Tratamos el identificador y correo de la cuenta; datos opcionales del perfil y la configuración inicial; ingresos, transacciones, facturas, deudas, objetivos y aportaciones; preferencias de idioma, moneda, tema y notificaciones; y una foto de perfil opcional.', 'Las preferencias religiosas o culturales son opcionales y solo se tratan con consentimiento explícito. Pocket Ahead no vende datos personales, no muestra publicidad dirigida, no conecta cuentas bancarias ni envía tus registros financieros a un proveedor de IA generativa.']],
      ['3. Para qué los usamos', 'Usamos los datos para calcular y mostrar tu plan, sincronizarlo entre dispositivos con sesión iniciada, proteger la cuenta, ofrecer las funciones solicitadas y responder a solicitudes de soporte o legales. Puedes retirar el consentimiento opcional en la aplicación.'],
      ['4. Proveedores y transferencias', 'Supabase proporciona autenticación, sincronización, almacenamiento de archivos y eliminación de cuentas. Si eliges Google, Google procesa el inicio de sesión. Android y Google Play pueden tratar datos técnicos según sus condiciones. Estos proveedores pueden tratar datos fuera de tu país con las garantías correspondientes.'],
      ['5. Conservación, exportación y eliminación', 'Los datos activos se conservan mientras uses la cuenta. Desde Perfil puedes exportar una copia legible por máquina o eliminar la cuenta definitivamente. La eliminación borra los datos activos y el acceso; ciertos registros de seguridad y copias cifradas pueden permanecer temporalmente por prevención del fraude, cumplimiento legal y rotación de copias.'],
      ['6. Tus opciones y seguridad', 'Puedes corregir el perfil, cambiar preferencias opcionales, retirar consentimientos, exportar tus datos y eliminar la cuenta. Pocket Ahead usa controles de acceso, transporte cifrado y almacenamiento seguro del dispositivo, aunque ningún servicio garantiza seguridad absoluta.'],
      ['7. Edad y cambios', 'Pocket Ahead está destinado a personas de 18 años o más. Los cambios importantes mostrarán una fecha de vigencia actualizada y, cuando corresponda, un aviso en la aplicación.'],
    ]),
  },
  terms: {
    title: 'Términos de uso', meta: 'Versión 1.0.0 · Vigente desde el 9 de agosto de 2026', sections: makeSections([
      ['1. Requisitos y aceptación', 'Debes tener al menos 18 años y capacidad legal para aceptar estos términos. Al usar Pocket Ahead aceptas estos términos y la política de privacidad.'],
      ['2. Tu cuenta', 'Protege tus credenciales y dispositivo y aporta información exacta. Eres responsable de la actividad de tu cuenta. Informa rápidamente si sospechas un acceso no autorizado.'],
      ['3. Uso permitido', 'Pocket Ahead te concede un derecho personal, limitado y revocable para usar la aplicación con fines legales de presupuesto y planificación. No extraigas datos, realices ingeniería inversa, interrumpas ni eludas sus controles de seguridad.'],
      ['4. Tus datos y la sincronización', 'Sigues siendo responsable de la información que introduces. Los datos con sesión iniciada pueden sincronizarse mediante Supabase; los datos de invitado siguen siendo locales hasta que inicies sesión y elijas migrarlos. Conserva copias independientes de la información importante.'],
      ['5. Sin servicios ni asesoramiento financiero', 'Pocket Ahead es una herramienta de planificación, no un banco, prestamista, bróker, contable ni asesor fiscal o financiero. No guarda, mueve ni invierte dinero. Los cálculos son estimaciones basadas en tus datos.'],
      ['6. Disponibilidad y cambios', 'El servicio puede interrumpirse por mantenimiento, seguridad o causas externas. Las funciones pueden cambiar por seguridad, cumplimiento o funcionamiento fiable.'],
      ['7. Eliminación y suspensión', 'Puedes eliminar la cuenta desde la aplicación. El editor puede suspender el acceso cuando sea razonablemente necesario para proteger a los usuarios, cumplir la ley o tratar un uso indebido grave.'],
      ['8. Exención y responsabilidad', 'Pocket Ahead se ofrece «tal cual» y «según disponibilidad» dentro de lo permitido por la ley. No se garantiza ningún resultado financiero. La responsabilidad solo se limita en la medida permitida; no se excluyen los derechos obligatorios del consumidor.'],
      ['9. Ley aplicable', 'Estos términos se rigen por la ley aplicable al editor, sin perjuicio de las protecciones obligatorias del consumidor donde vivas.'],
    ]),
  },
  financial: {
    title: 'Aviso financiero', meta: 'Versión 1.0.0 · Vigente desde el 9 de agosto de 2026', sections: makeSections([
      ['1. Solo herramienta de planificación', 'Pocket Ahead ayuda a registrar información y estimar presupuestos, obligaciones, objetivos y gasto disponible. Sus resultados son información educativa, no asesoramiento financiero personalizado.'],
      ['2. No es una entidad financiera', 'Pocket Ahead no es banco, prestamista, bróker, aseguradora, contable ni asesor fiscal. No conecta, guarda, transfiere, negocia ni invierte dinero real.'],
      ['3. Las estimaciones pueden cambiar', 'Los resultados dependen de importes, fechas y categorías introducidos. Datos incompletos, tardíos o incorrectos pueden hacer inexactos los saldos, proyecciones, avisos y límites diarios.'],
      ['4. Tu responsabilidad', 'Compara las cifras importantes con tus extractos y obligaciones contractuales. Para decisiones de deuda, impuestos, inversión, crédito u otras de gran impacto, consulta a un profesional cualificado.'],
      ['5. Situaciones urgentes', 'No dependas de Pocket Ahead para decisiones de emergencia. Si no puedes cubrir costes esenciales o deudas, contacta pronto al proveedor, a un asesor cualificado o a un servicio local de apoyo.'],
    ]),
  },
};

const de: LegalDocumentSet = {
  privacy: {
    title: 'Datenschutzerklärung', meta: 'Version 1.0.0 · Gültig ab 9. August 2026', sections: makeSections([
      ['1. Verantwortlicher', 'Pocket Ahead wird von Kael Labs veröffentlicht. Datenschutz- und Betroffenenanfragen richten Sie über Support kontaktieren in der App oder über den in Google Play angegebenen Kontaktkanal an den Herausgeber.'],
      ['2. Verarbeitete Daten', ['Wir verarbeiten Konto-ID und E-Mail; optionale Profil- und Einrichtungsdaten; Einkommen, Transaktionen, Rechnungen, Schulden, Ziele und Beiträge; Sprach-, Währungs-, Design- und Benachrichtigungseinstellungen; sowie ein optionales Profilbild.', 'Religiöse oder kulturelle Präferenzen sind optional und werden nur mit ausdrücklicher Einwilligung verarbeitet. Pocket Ahead verkauft keine personenbezogenen Daten, zeigt keine zielgerichtete Werbung, verbindet keine Bankkonten und sendet Finanzdaten nicht an einen Anbieter generativer KI.']],
      ['3. Zwecke', 'Wir nutzen die Daten, um Ihren Plan zu berechnen und anzuzeigen, ihn zwischen angemeldeten Geräten zu synchronisieren, das Konto zu schützen, gewünschte Funktionen bereitzustellen und Support- oder Rechtsanfragen zu beantworten. Optionale Einwilligungen können in der App widerrufen werden.'],
      ['4. Dienstleister und Übermittlungen', 'Supabase stellt Authentifizierung, Datenbanksynchronisierung, Dateispeicherung und Kontolöschung bereit. Bei Google-Anmeldung verarbeitet Google den Anmeldevorgang. Android und Google Play können technische Daten nach eigenen Bedingungen verarbeiten. Eine Verarbeitung außerhalb Ihres Landes kann mit den jeweiligen Schutzmaßnahmen erfolgen.'],
      ['5. Speicherung, Export und Löschung', 'Aktive Daten werden während der Kontonutzung gespeichert. Unter Profil können Sie eine maschinenlesbare Kopie exportieren oder das Konto dauerhaft löschen. Dabei werden aktive Daten und Zugriffe entfernt; begrenzte Sicherheitsprotokolle und verschlüsselte Sicherungen können vorübergehend zur Betrugsprävention, Rechtsbefolgung und Sicherungsrotation verbleiben.'],
      ['6. Wahlmöglichkeiten und Sicherheit', 'Sie können Profildaten berichtigen, optionale Einstellungen ändern, Einwilligungen widerrufen, Daten exportieren und das Konto löschen. Pocket Ahead nutzt Zugriffskontrollen, verschlüsselte Übertragung und sicheren Gerätespeicher; absolute Sicherheit kann jedoch nicht garantiert werden.'],
      ['7. Alter und Änderungen', 'Pocket Ahead ist für Erwachsene ab 18 Jahren bestimmt. Wesentliche Änderungen werden durch ein neues Gültigkeitsdatum und gegebenenfalls einen Hinweis in der App kenntlich gemacht.'],
    ]),
  },
  terms: {
    title: 'Nutzungsbedingungen', meta: 'Version 1.0.0 · Gültig ab 9. August 2026', sections: makeSections([
      ['1. Voraussetzungen und Zustimmung', 'Sie müssen mindestens 18 Jahre alt und rechtlich zur Zustimmung befugt sein. Mit der Nutzung stimmen Sie diesen Bedingungen und der Datenschutzerklärung zu.'],
      ['2. Ihr Konto', 'Schützen Sie Zugangsdaten und Gerät und machen Sie richtige Angaben. Sie sind für Aktivitäten über Ihr Konto verantwortlich. Melden Sie vermuteten unbefugten Zugriff unverzüglich.'],
      ['3. Zulässige Nutzung', 'Sie erhalten ein persönliches, begrenztes und widerrufliches Recht zur rechtmäßigen privaten Budgetplanung. Scraping, Reverse Engineering, Störung, Missbrauch oder Umgehung von Sicherheitskontrollen sind untersagt.'],
      ['4. Ihre Daten und Synchronisierung', 'Sie bleiben für eingegebene Informationen verantwortlich. Angemeldete Daten können über Supabase synchronisiert werden; Gastdaten bleiben lokal, bis Sie sich anmelden und die Migration wählen. Sichern Sie unverzichtbare Informationen zusätzlich.'],
      ['5. Keine Finanzdienstleistung oder Beratung', 'Pocket Ahead ist ein Planungstool und keine Bank, Kreditgeber, Makler, Buchhaltung, Steuer- oder Finanzberatung. Es hält, bewegt oder investiert kein Geld. Berechnungen sind Schätzungen anhand Ihrer Angaben.'],
      ['6. Verfügbarkeit und Änderungen', 'Der Dienst kann wegen Wartung, Sicherheit oder externer Ursachen unterbrochen werden. Funktionen können zur Sicherheit, Rechtsbefolgung oder Zuverlässigkeit geändert werden.'],
      ['7. Löschung und Sperrung', 'Sie können Ihr Konto in der App löschen. Der Herausgeber kann den Zugriff angemessen sperren, um Nutzer zu schützen, Gesetze einzuhalten oder schweren Missbrauch zu behandeln.'],
      ['8. Haftungsausschluss', 'Pocket Ahead wird im gesetzlich zulässigen Umfang „wie besehen“ und „wie verfügbar“ bereitgestellt. Ein finanzielles Ergebnis wird nicht garantiert. Zwingende Verbraucherrechte bleiben unberührt.'],
      ['9. Anwendbares Recht', 'Es gilt das auf den Herausgeber anwendbare Recht, vorbehaltlich zwingender Verbraucherschutzvorschriften an Ihrem Wohnort.'],
    ]),
  },
  financial: {
    title: 'Finanzhinweis', meta: 'Version 1.0.0 · Gültig ab 9. August 2026', sections: makeSections([
      ['1. Nur Planungshilfe', 'Pocket Ahead hilft beim Erfassen von Daten und Schätzen von Budgets, Verpflichtungen, Zielen und frei verfügbarem Betrag. Die Ergebnisse sind Bildungs- und Planungsinformationen, keine persönliche Finanzberatung.'],
      ['2. Kein Finanzinstitut', 'Pocket Ahead ist weder Bank, Kreditgeber, Makler, Versicherer, Buchhaltung noch Steuerberatung. Es verbindet, hält, überträgt, handelt oder investiert kein echtes Geld.'],
      ['3. Veränderliche Schätzungen', 'Ergebnisse hängen von eingegebenen Beträgen, Daten und Kategorien ab. Fehlende, verspätete oder falsche Angaben können Salden, Prognosen, Warnungen und Tagesbudgets verfälschen.'],
      ['4. Ihre Verantwortung', 'Prüfen Sie wichtige Werte anhand von Kontoauszügen und Verträgen. Für Schulden-, Steuer-, Anlage-, Kredit- oder andere weitreichende Entscheidungen wenden Sie sich an qualifizierte Fachleute.'],
      ['5. Dringende Situationen', 'Verlassen Sie sich bei Notfällen nicht auf Pocket Ahead. Können Sie notwendige Kosten oder Schulden nicht zahlen, kontaktieren Sie frühzeitig den Anbieter, eine qualifizierte Beratung oder lokale Hilfsstelle.'],
    ]),
  },
};

const pt: LegalDocumentSet = {
  privacy: {
    title: 'Política de privacidade', meta: 'Versão 1.0.0 · Em vigor desde 9 de agosto de 2026', sections: makeSections([
      ['1. Responsável pelos dados', 'Pocket Ahead é publicado pela Kael Labs. Para pedidos de privacidade ou direitos sobre dados, contacte o editor através de Contactar o suporte na aplicação ou do canal indicado no Google Play.'],
      ['2. Dados tratados', ['Tratamos o identificador e e-mail da conta; dados opcionais de perfil e configuração; rendimentos, transações, contas, dívidas, objetivos e contribuições; preferências de idioma, moeda, tema e notificações; e uma foto de perfil opcional.', 'Preferências religiosas ou culturais são opcionais e só são tratadas após consentimento explícito. Pocket Ahead não vende dados pessoais, não mostra publicidade direcionada, não liga contas bancárias e não envia registos financeiros a fornecedores de IA generativa.']],
      ['3. Finalidades', 'Usamos os dados para calcular e apresentar o plano, sincronizá-lo entre dispositivos autenticados, proteger a conta, fornecer funcionalidades e responder a pedidos de suporte ou legais. O consentimento opcional pode ser retirado na aplicação.'],
      ['4. Prestadores e transferências', 'Supabase fornece autenticação, sincronização, armazenamento de ficheiros e eliminação de conta. Ao escolher Google, a Google trata o início de sessão. Android e Google Play podem tratar dados técnicos segundo os seus termos. Os prestadores podem tratar dados fora do seu país com salvaguardas aplicáveis.'],
      ['5. Conservação, exportação e eliminação', 'Os dados ativos são conservados enquanto a conta for utilizada. Em Perfil pode exportar uma cópia legível por máquina ou eliminar a conta permanentemente. A eliminação remove dados ativos e acesso; alguns registos de segurança e cópias cifradas podem permanecer temporariamente para prevenção de fraude, obrigações legais e rotação de cópias.'],
      ['6. Escolhas e segurança', 'Pode corrigir o perfil, alterar preferências opcionais, retirar consentimentos, exportar dados e eliminar a conta. Pocket Ahead usa controlos de acesso, transporte cifrado e armazenamento seguro no dispositivo, mas nenhum serviço garante segurança absoluta.'],
      ['7. Idade e alterações', 'Pocket Ahead destina-se a adultos com 18 anos ou mais. Alterações importantes terão uma nova data de vigência e, quando adequado, um aviso na aplicação.'],
    ]),
  },
  terms: {
    title: 'Termos de uso', meta: 'Versão 1.0.0 · Em vigor desde 9 de agosto de 2026', sections: makeSections([
      ['1. Elegibilidade e aceitação', 'Deve ter pelo menos 18 anos e capacidade legal para aceitar estes termos. Ao usar Pocket Ahead, aceita estes termos e a política de privacidade.'],
      ['2. A sua conta', 'Proteja as credenciais e o dispositivo e forneça informações corretas. É responsável pela atividade da conta. Informe rapidamente qualquer suspeita de acesso não autorizado.'],
      ['3. Uso permitido', 'Pocket Ahead concede um direito pessoal, limitado e revogável para planeamento financeiro pessoal lícito. Não recolha dados automaticamente, faça engenharia inversa, perturbe ou contorne os controlos de segurança.'],
      ['4. Dados e sincronização', 'Continua responsável pelas informações inseridas. Dados autenticados podem ser sincronizados via Supabase; dados de convidado ficam locais até iniciar sessão e escolher migrá-los. Mantenha cópias independentes de informações essenciais.'],
      ['5. Sem serviços ou aconselhamento financeiro', 'Pocket Ahead é uma ferramenta de planeamento, não um banco, credor, corretor, contabilista ou consultor fiscal ou financeiro. Não guarda, move nem investe dinheiro. Os cálculos são estimativas baseadas nos seus dados.'],
      ['6. Disponibilidade e alterações', 'O serviço pode ser interrompido por manutenção, segurança ou causas externas. As funcionalidades podem mudar por segurança, conformidade ou fiabilidade.'],
      ['7. Eliminação e suspensão', 'Pode eliminar a conta na aplicação. O editor pode suspender o acesso quando razoavelmente necessário para proteger utilizadores, cumprir a lei ou tratar abuso grave.'],
      ['8. Isenção e responsabilidade', 'Pocket Ahead é fornecido “tal como está” e “conforme disponível” nos limites legais. Não é garantido qualquer resultado financeiro. Direitos obrigatórios do consumidor não são excluídos.'],
      ['9. Lei aplicável', 'Aplicam-se as leis relevantes para o editor, sem prejuízo das proteções obrigatórias do consumidor onde reside.'],
    ]),
  },
  financial: {
    title: 'Aviso financeiro', meta: 'Versão 1.0.0 · Em vigor desde 9 de agosto de 2026', sections: makeSections([
      ['1. Apenas planeamento', 'Pocket Ahead ajuda a registar informações e estimar orçamentos, obrigações, objetivos e valor disponível. Os resultados são informação educativa, não aconselhamento financeiro personalizado.'],
      ['2. Não é uma instituição financeira', 'Pocket Ahead não é banco, credor, corretor, seguradora, contabilista ou consultor fiscal. Não liga, guarda, transfere, negocia ou investe dinheiro real.'],
      ['3. Estimativas podem mudar', 'Os resultados dependem dos valores, datas e categorias inseridos. Dados em falta, atrasados ou incorretos podem tornar saldos, projeções, avisos e limites diários imprecisos.'],
      ['4. Sua responsabilidade', 'Compare valores importantes com extratos e obrigações contratuais. Para decisões sobre dívidas, impostos, investimentos, crédito ou outras de grande impacto, consulte um profissional qualificado.'],
      ['5. Situações urgentes', 'Não dependa de Pocket Ahead em emergências. Se não puder pagar custos essenciais ou dívidas, contacte rapidamente o prestador, um consultor qualificado ou um serviço de apoio local.'],
    ]),
  },
};

const it: LegalDocumentSet = {
  privacy: {
    title: 'Informativa sulla privacy', meta: 'Versione 1.0.0 · In vigore dal 9 agosto 2026', sections: makeSections([
      ['1. Titolare dei dati', 'Pocket Ahead è pubblicato da Kael Labs. Per richieste sulla privacy o sui diritti relativi ai dati, contatta l’editore tramite Contatta l’assistenza nell’app o il canale indicato su Google Play.'],
      ['2. Dati trattati', ['Trattiamo identificativo ed e-mail dell’account; dati facoltativi di profilo e configurazione; entrate, transazioni, bollette, debiti, obiettivi e contributi; preferenze di lingua, valuta, tema e notifiche; e un’immagine profilo facoltativa.', 'Le preferenze religiose o culturali sono facoltative e trattate solo con consenso esplicito. Pocket Ahead non vende dati personali, non mostra pubblicità mirata, non collega conti bancari e non invia i registri finanziari a fornitori di IA generativa.']],
      ['3. Finalità', 'Usiamo i dati per calcolare e mostrare il piano, sincronizzarlo tra dispositivi autenticati, proteggere l’account, fornire le funzioni richieste e rispondere a richieste di assistenza o legali. Puoi revocare il consenso facoltativo nell’app.'],
      ['4. Fornitori e trasferimenti', 'Supabase fornisce autenticazione, sincronizzazione, archiviazione di file ed eliminazione dell’account. Se scegli Google, Google tratta l’accesso. Android e Google Play possono trattare dati tecnici secondo i propri termini. I fornitori possono trattare dati fuori dal tuo Paese con le garanzie applicabili.'],
      ['5. Conservazione, esportazione ed eliminazione', 'I dati attivi restano finché l’account è usato. Da Profilo puoi esportare una copia leggibile da macchina o eliminare definitivamente l’account. L’eliminazione rimuove dati attivi e accesso; alcuni log di sicurezza e backup cifrati possono restare temporaneamente per prevenzione frodi, obblighi legali e rotazione dei backup.'],
      ['6. Scelte e sicurezza', 'Puoi correggere il profilo, modificare preferenze facoltative, revocare consensi, esportare i dati ed eliminare l’account. Pocket Ahead usa controlli di accesso, trasporto cifrato e archiviazione sicura sul dispositivo, ma nessun servizio garantisce sicurezza assoluta.'],
      ['7. Età e modifiche', 'Pocket Ahead è destinato ad adulti di almeno 18 anni. Le modifiche sostanziali mostreranno una nuova data di efficacia e, quando opportuno, un avviso nell’app.'],
    ]),
  },
  terms: {
    title: 'Termini di utilizzo', meta: 'Versione 1.0.0 · In vigore dal 9 agosto 2026', sections: makeSections([
      ['1. Requisiti e accettazione', 'Devi avere almeno 18 anni e capacità legale di accettare questi termini. Usando Pocket Ahead accetti questi termini e l’informativa sulla privacy.'],
      ['2. Il tuo account', 'Proteggi credenziali e dispositivo e fornisci informazioni corrette. Sei responsabile delle attività del tuo account. Segnala rapidamente eventuali accessi non autorizzati.'],
      ['3. Uso consentito', 'Pocket Ahead concede un diritto personale, limitato e revocabile per la pianificazione finanziaria personale lecita. Non effettuare scraping, reverse engineering, interruzioni o elusione dei controlli di sicurezza.'],
      ['4. Dati e sincronizzazione', 'Rimani responsabile delle informazioni inserite. I dati autenticati possono sincronizzarsi tramite Supabase; i dati ospite restano locali finché non accedi e scegli di migrarli. Conserva copie indipendenti delle informazioni essenziali.'],
      ['5. Nessun servizio o consiglio finanziario', 'Pocket Ahead è uno strumento di pianificazione, non banca, prestatore, broker, commercialista o consulente fiscale o finanziario. Non conserva, sposta o investe denaro. I calcoli sono stime basate sui tuoi dati.'],
      ['6. Disponibilità e modifiche', 'Il servizio può interrompersi per manutenzione, sicurezza o cause esterne. Le funzioni possono cambiare per sicurezza, conformità o affidabilità.'],
      ['7. Eliminazione e sospensione', 'Puoi eliminare l’account nell’app. L’editore può sospendere l’accesso quando ragionevolmente necessario per proteggere gli utenti, rispettare la legge o affrontare gravi abusi.'],
      ['8. Esclusione e responsabilità', 'Pocket Ahead è fornito “così com’è” e “secondo disponibilità” nei limiti di legge. Non garantisce risultati finanziari. I diritti obbligatori dei consumatori restano invariati.'],
      ['9. Legge applicabile', 'Si applica la legge pertinente all’editore, fatte salve le tutele obbligatorie dei consumatori nel luogo di residenza.'],
    ]),
  },
  financial: {
    title: 'Avvertenza finanziaria', meta: 'Versione 1.0.0 · In vigore dal 9 agosto 2026', sections: makeSections([
      ['1. Solo pianificazione', 'Pocket Ahead aiuta a registrare informazioni e stimare budget, obblighi, obiettivi e disponibilità. I risultati sono informazioni educative, non consulenza finanziaria personalizzata.'],
      ['2. Non è un istituto finanziario', 'Pocket Ahead non è una banca, prestatore, broker, assicuratore, commercialista o consulente fiscale. Non collega, conserva, trasferisce, negozia o investe denaro reale.'],
      ['3. Le stime possono cambiare', 'I risultati dipendono da importi, date e categorie inseriti. Dati mancanti, tardivi o errati possono rendere imprecisi saldi, proiezioni, avvisi e limiti giornalieri.'],
      ['4. La tua responsabilità', 'Confronta le cifre importanti con estratti conto e obblighi contrattuali. Per debiti, imposte, investimenti, credito o altre decisioni rilevanti, consulta un professionista qualificato.'],
      ['5. Situazioni urgenti', 'Non affidarti a Pocket Ahead per emergenze. Se non puoi coprire costi essenziali o debiti, contatta subito il fornitore, un consulente qualificato o un servizio di supporto locale.'],
    ]),
  },
};

const nl: LegalDocumentSet = {
  privacy: {
    title: 'Privacybeleid', meta: 'Versie 1.0.0 · Geldig vanaf 9 augustus 2026', sections: makeSections([
      ['1. Verantwoordelijke voor je gegevens', 'Pocket Ahead wordt uitgegeven door Kael Labs. Neem voor privacy- of gegevensrechten contact op via Contact met ondersteuning in de app of via het contactkanaal in Google Play.'],
      ['2. Verwerkte gegevens', ['We verwerken je account-ID en e-mail; optionele profiel- en instelgegevens; inkomsten, transacties, rekeningen, schulden, doelen en bijdragen; taal-, valuta-, thema- en meldingsvoorkeuren; en een optionele profielfoto.', 'Religieuze of culturele voorkeuren zijn optioneel en worden alleen met uitdrukkelijke toestemming verwerkt. Pocket Ahead verkoopt geen persoonsgegevens, toont geen gerichte advertenties, koppelt geen bankrekeningen en stuurt financiële gegevens niet naar een leverancier van generatieve AI.']],
      ['3. Doeleinden', 'We gebruiken gegevens om je plan te berekenen en tonen, te synchroniseren tussen aangemelde apparaten, je account te beschermen, functies te leveren en ondersteunings- of juridische verzoeken te beantwoorden. Optionele toestemming kun je in de app intrekken.'],
      ['4. Dienstverleners en doorgifte', 'Supabase levert authenticatie, synchronisatie, bestandsopslag en accountverwijdering. Bij Google-aanmelding verwerkt Google de aanmelding. Android en Google Play kunnen technische gegevens volgens hun voorwaarden verwerken. Leveranciers kunnen gegevens buiten je land verwerken met toepasselijke waarborgen.'],
      ['5. Bewaring, export en verwijdering', 'Actieve gegevens blijven bewaard zolang het account wordt gebruikt. Via Profiel kun je een machineleesbare kopie exporteren of het account definitief verwijderen. Verwijdering wist actieve gegevens en toegang; beperkte beveiligingslogs en versleutelde back-ups kunnen tijdelijk blijven voor fraudepreventie, wettelijke verplichtingen en back-uprotatie.'],
      ['6. Keuzes en beveiliging', 'Je kunt profielgegevens corrigeren, optionele voorkeuren wijzigen, toestemming intrekken, gegevens exporteren en het account verwijderen. Pocket Ahead gebruikt toegangscontrole, versleuteld transport en veilige apparaatopslag, maar absolute veiligheid kan niet worden gegarandeerd.'],
      ['7. Leeftijd en wijzigingen', 'Pocket Ahead is bedoeld voor volwassenen van 18 jaar en ouder. Belangrijke wijzigingen krijgen een nieuwe ingangsdatum en zo nodig een melding in de app.'],
    ]),
  },
  terms: {
    title: 'Gebruiksvoorwaarden', meta: 'Versie 1.0.0 · Geldig vanaf 9 augustus 2026', sections: makeSections([
      ['1. Geschiktheid en aanvaarding', 'Je moet minimaal 18 jaar zijn en juridisch bevoegd zijn om deze voorwaarden te aanvaarden. Door Pocket Ahead te gebruiken, accepteer je deze voorwaarden en het privacybeleid.'],
      ['2. Je account', 'Bescherm je inloggegevens en apparaat en geef juiste informatie. Je bent verantwoordelijk voor activiteit via je account. Meld vermoedelijke onbevoegde toegang direct.'],
      ['3. Toegestaan gebruik', 'Pocket Ahead geeft een persoonlijk, beperkt en herroepbaar recht voor rechtmatige persoonlijke budgetplanning. Scrapen, reverse-engineering, verstoring, misbruik of omzeiling van beveiliging is verboden.'],
      ['4. Gegevens en synchronisatie', 'Je blijft verantwoordelijk voor ingevoerde informatie. Aangemelde gegevens kunnen via Supabase synchroniseren; gastgegevens blijven lokaal tot je inlogt en voor migratie kiest. Bewaar zelfstandig kopieën van essentiële informatie.'],
      ['5. Geen financiële dienst of advies', 'Pocket Ahead is een planningstool, geen bank, kredietverstrekker, broker, accountant, belasting- of financieel adviseur. Het houdt, verplaatst of belegt geen geld. Berekeningen zijn schattingen op basis van je invoer.'],
      ['6. Beschikbaarheid en wijzigingen', 'De dienst kan worden onderbroken voor onderhoud, beveiliging of externe oorzaken. Functies kunnen wijzigen voor veiligheid, naleving of betrouwbare werking.'],
      ['7. Verwijdering en opschorting', 'Je kunt je account in de app verwijderen. De uitgever kan toegang redelijkerwijs opschorten om gebruikers te beschermen, de wet na te leven of ernstig misbruik aan te pakken.'],
      ['8. Afwijzing en aansprakelijkheid', 'Pocket Ahead wordt binnen de wet geleverd “zoals het is” en “zoals beschikbaar”. Er wordt geen financieel resultaat gegarandeerd. Verplichte consumentenrechten blijven gelden.'],
      ['9. Toepasselijk recht', 'Het op de uitgever toepasselijke recht geldt, met behoud van verplichte consumentenbescherming waar je woont.'],
    ]),
  },
  financial: {
    title: 'Financiële disclaimer', meta: 'Versie 1.0.0 · Geldig vanaf 9 augustus 2026', sections: makeSections([
      ['1. Alleen planning', 'Pocket Ahead helpt gegevens vast te leggen en budgetten, verplichtingen, doelen en besteedbare ruimte te schatten. De uitkomsten zijn educatieve planningsinformatie, geen persoonlijk financieel advies.'],
      ['2. Geen financiële instelling', 'Pocket Ahead is geen bank, kredietverstrekker, broker, verzekeraar, accountant of belastingadviseur. Het koppelt, bewaart, verplaatst, verhandelt of belegt geen echt geld.'],
      ['3. Schattingen kunnen wijzigen', 'Resultaten hangen af van ingevoerde bedragen, datums en categorieën. Ontbrekende, late of onjuiste gegevens kunnen saldi, prognoses, waarschuwingen en daglimieten onnauwkeurig maken.'],
      ['4. Je verantwoordelijkheid', 'Controleer belangrijke bedragen aan de hand van afschriften en contracten. Raadpleeg voor schulden, belasting, beleggingen, krediet of andere ingrijpende beslissingen een gekwalificeerde professional.'],
      ['5. Dringende situaties', 'Vertrouw bij noodgevallen niet op Pocket Ahead. Kun je essentiële kosten of schulden niet betalen, neem dan snel contact op met de aanbieder, een gekwalificeerde adviseur of lokale hulpdienst.'],
    ]),
  },
};

const tr: LegalDocumentSet = {
  privacy: {
    title: 'Gizlilik politikası', meta: 'Sürüm 1.0.0 · 9 Ağustos 2026 tarihinde yürürlüğe girer', sections: makeSections([
      ['1. Veri sorumlusu', 'Pocket Ahead, Kael Labs tarafından yayımlanır. Gizlilik veya veri hakkı talepleri için uygulamadaki Destekle iletişime geç seçeneğini ya da Google Play’de belirtilen iletişim kanalını kullanın.'],
      ['2. İşlediğimiz veriler', ['Hesap kimliği ve e-posta; isteğe bağlı profil ve kurulum bilgileri; gelir, işlemler, faturalar, borçlar, hedefler ve katkılar; dil, para birimi, tema ve bildirim tercihleri; ayrıca isteğe bağlı profil resmi işlenir.', 'Dinî veya kültürel tercihler isteğe bağlıdır ve yalnızca açık onayla işlenir. Pocket Ahead kişisel verileri satmaz, hedefli reklam göstermez, banka hesabı bağlamaz ve finansal kayıtları üretken yapay zekâ sağlayıcısına göndermez.']],
      ['3. İşleme amaçları', 'Verileri planınızı hesaplamak ve göstermek, oturum açılmış cihazlar arasında eşitlemek, hesabı korumak, istenen özellikleri sunmak ve destek veya yasal talepleri yanıtlamak için kullanırız. İsteğe bağlı onayı uygulamadan geri çekebilirsiniz.'],
      ['4. Hizmet sağlayıcılar ve aktarım', 'Supabase kimlik doğrulama, veritabanı eşitleme, dosya depolama ve hesap silme altyapısı sağlar. Google ile girişi seçerseniz giriş işlemini Google yürütür. Android ve Google Play kendi koşulları kapsamında teknik veri işleyebilir. Sağlayıcılar verileri uygun güvencelerle ülkeniz dışında işleyebilir.'],
      ['5. Saklama, dışa aktarma ve silme', 'Etkin veriler hesap kullanıldığı sürece saklanır. Profil’den makinece okunabilir kopya alabilir veya hesabı kalıcı silebilirsiniz. Silme etkin verileri ve erişimi kaldırır; sınırlı güvenlik kayıtları ve şifreli yedekler dolandırıcılık önleme, yasal uyum ve yedekleme döngüsü için geçici kalabilir.'],
      ['6. Seçimler ve güvenlik', 'Profilinizi düzeltebilir, isteğe bağlı tercihleri değiştirebilir, onayı çekebilir, verileri dışa aktarabilir ve hesabı silebilirsiniz. Pocket Ahead erişim kontrolleri, şifreli aktarım ve güvenli cihaz depolaması kullanır; hiçbir hizmet mutlak güvenlik garanti edemez.'],
      ['7. Yaş ve değişiklikler', 'Pocket Ahead 18 yaş ve üzeri yetişkinler içindir. Önemli değişiklikler yeni yürürlük tarihiyle ve gerektiğinde uygulama içi bildirimle duyurulur.'],
    ]),
  },
  terms: {
    title: 'Kullanım koşulları', meta: 'Sürüm 1.0.0 · 9 Ağustos 2026 tarihinde yürürlüğe girer', sections: makeSections([
      ['1. Uygunluk ve kabul', 'En az 18 yaşında ve bu koşulları kabul etme ehliyetine sahip olmalısınız. Pocket Ahead’i kullanarak bu koşulları ve gizlilik politikasını kabul edersiniz.'],
      ['2. Hesabınız', 'Giriş bilgilerinizi ve cihazınızı koruyun, doğru bilgi verin. Hesap üzerinden yapılan işlemlerden siz sorumlusunuz. Yetkisiz erişim şüphesini hızla bildirin.'],
      ['3. İzin verilen kullanım', 'Pocket Ahead, yasal kişisel bütçe planlaması için kişisel, sınırlı ve geri alınabilir kullanım hakkı verir. Veri kazıma, tersine mühendislik, hizmeti bozma veya güvenlik kontrollerini aşma yasaktır.'],
      ['4. Veriler ve eşitleme', 'Girdiğiniz bilgilerden siz sorumlusunuz. Oturum açılan veriler Supabase ile eşitlenebilir; misafir verileri siz giriş yapıp taşımayı seçene kadar yerelde kalır. Kaybını göze alamayacağınız bilgilerin ayrı kaydını tutun.'],
      ['5. Finansal hizmet veya tavsiye değildir', 'Pocket Ahead bir planlama aracıdır; banka, kredi veren, aracı, muhasebeci, vergi veya finans danışmanı değildir. Para tutmaz, taşımaz veya yatırım yapmaz. Hesaplamalar girdilerinize dayalı tahminlerdir.'],
      ['6. Kullanılabilirlik ve değişiklikler', 'Hizmet bakım, güvenlik veya dış nedenlerle kesilebilir. Özellikler güvenlik, uyum veya güvenilir çalışma için değişebilir.'],
      ['7. Silme ve askıya alma', 'Hesabı uygulamada silebilirsiniz. Yayımcı kullanıcıları korumak, yasaya uymak veya ciddi kötüye kullanımı gidermek için makul şekilde erişimi askıya alabilir.'],
      ['8. Sorumluluk reddi ve sınırı', 'Pocket Ahead, yasaların izin verdiği ölçüde “olduğu gibi” ve “mevcut olduğu şekilde” sunulur. Finansal sonuç garanti edilmez. Zorunlu tüketici hakları hariç tutulmaz.'],
      ['9. Uygulanacak hukuk', 'Yaşadığınız yerdeki zorunlu tüketici korumaları saklı kalmak üzere yayımcıya uygulanan hukuk geçerlidir.'],
    ]),
  },
  financial: {
    title: 'Finansal sorumluluk reddi', meta: 'Sürüm 1.0.0 · 9 Ağustos 2026 tarihinde yürürlüğe girer', sections: makeSections([
      ['1. Yalnızca planlama aracı', 'Pocket Ahead bilgileri kaydetmeye ve bütçe, yükümlülük, hedef ve harcanabilir tutarı tahmin etmeye yardımcı olur. Çıktılar eğitim amaçlı planlama bilgisidir, kişisel finansal tavsiye değildir.'],
      ['2. Finans kurumu değildir', 'Pocket Ahead banka, kredi veren, aracı, sigortacı, muhasebeci veya vergi danışmanı değildir. Gerçek para hesaplarına bağlanmaz; para tutmaz, aktarmaz, alıp satmaz veya yatırım yapmaz.'],
      ['3. Tahminler değişebilir', 'Sonuçlar girdiğiniz tutar, tarih ve kategorilere bağlıdır. Eksik, geç veya yanlış veriler bakiye, tahmin, uyarı ve günlük sınırları hatalı yapabilir.'],
      ['4. Sorumluluğunuz', 'Önemli rakamları banka ekstreleri ve sözleşmelerle doğrulayın. Borç, vergi, yatırım, kredi veya yüksek etkili kararlar için yetkin uzmana danışın.'],
      ['5. Acil durumlar', 'Acil kararlar için Pocket Ahead’e güvenmeyin. Temel giderleri veya borçları karşılayamıyorsanız ilgili sağlayıcı, yetkin danışman ya da yerel destek hizmetiyle erken iletişime geçin.'],
    ]),
  },
};

export const legalDocuments: Record<SupportedLanguageCode, LegalDocumentSet> = {
  en,
  fr,
  ar,
  es,
  de,
  pt,
  it,
  nl,
  tr,
};
