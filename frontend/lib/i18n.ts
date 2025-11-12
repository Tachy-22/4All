import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation resources
const resources = {
  en: {
    common: {
      // Navigation
      dashboard: 'Dashboard',
      transfer: 'Transfer',
      bills: 'Pay Bills',
      sme: 'SME Tools',
      coach: 'Financial Coach',
      settings: 'Settings',
      
      // Actions
      continue: 'Continue',
      back: 'Back',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      edit: 'Edit',
      delete: 'Delete',
      send: 'Send',
      
      // Common words
      amount: 'Amount',
      account: 'Account',
      balance: 'Balance',
      name: 'Name',
      phone: 'Phone',
      email: 'Email',
      date: 'Date',
      status: 'Status',
      
      // Status
      pending: 'Pending',
      completed: 'Completed',
      failed: 'Failed',
      active: 'Active',
      inactive: 'Inactive',
      
      // Ziva responses
      greeting: "Hello! I'm Ziva, your banking assistant. How can I help you today?",
      listening: "I'm listening...",
      processing: "Processing your request...",
      error: "I'm sorry, I didn't understand that. Could you please try again?",
    },
    onboarding: {
      title: '4All Setup',
      subtitle: "Let's personalize your banking experience",
      welcome: 'Welcome to 4All Banking',
      welcomeMessage: "Welcome to 4All onboarding! We'll help set up your banking experience. This will take about {{stepCount}} steps.",
      completeMessage: 'Onboarding complete! Welcome to 4All Banking. Redirecting to your dashboard.',
      stepProgress: 'Step {{current}} of {{total}}',
      percentComplete: '{{percent}}% Complete',
      accessibilityNeeds: 'Accessibility Needs',
      interactionPreference: 'Interaction Preference', 
      uiSetup: 'User Interface Setup',
      accessibilityCalibration: 'Accessibility Calibration',
      createAccount: 'Create Account',
      languageSelection: 'Which language would you prefer?',
      interactionMode: 'How would you like to interact?',
      voiceFirst: 'Voice-First',
      textOnly: 'Text Only',
    },
    banking: {
      sendMoney: 'Send Money',
      payBills: 'Pay Bills',
      checkBalance: 'Check Balance',
      viewTransactions: 'View Transactions',
      recipient: 'Recipient',
      transferAmount: 'Transfer Amount',
    }
  },
  pcm: {
    common: {
      dashboard: 'Dashboard',
      transfer: 'Send Money',
      bills: 'Pay Bills',
      sme: 'Business Tools',
      coach: 'Money Coach',
      settings: 'Settings',
      
      continue: 'Continue',
      back: 'Go Back',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save am',
      edit: 'Edit',
      delete: 'Delete',
      send: 'Send',
      
      amount: 'How Much',
      account: 'Account',
      balance: 'Balance',
      name: 'Name',
      phone: 'Phone',
      email: 'Email',
      date: 'Date',
      status: 'Status',
      
      pending: 'Dey Wait',
      completed: 'Done',
      failed: 'No Work',
      active: 'Dey Work',
      inactive: 'No Dey Work',
      
      greeting: "How far! I be Ziva, your banking helper. Wetin you wan do today?",
      listening: "I dey listen...",
      processing: "I dey work on am...",
      error: "Sorry o, I no understand wetin you talk. Try again abeg.",
    },
    onboarding: {
      title: '4All Setup',
      subtitle: 'Make we personalize your banking experience',
      welcome: 'Welcome to 4All Banking',
      welcomeMessage: 'Welcome to 4All onboarding! We go help you setup your banking experience. E go take about {{stepCount}} steps.',
      completeMessage: 'Onboarding don complete! Welcome to 4All Banking. I dey take you to your dashboard.',
      stepProgress: 'Step {{current}} of {{total}}',
      percentComplete: '{{percent}}% Complete',
      accessibilityNeeds: 'Accessibility Needs',
      interactionPreference: 'Interaction Preference',
      uiSetup: 'User Interface Setup', 
      accessibilityCalibration: 'Accessibility Calibration',
      createAccount: 'Create Account',
      languageSelection: 'Which language you wan use?',
      interactionMode: 'How you wan talk to us?',
      voiceFirst: 'Voice First',
      textOnly: 'Type Only',
    },
    banking: {
      sendMoney: 'Send Money',
      payBills: 'Pay Bills',
      checkBalance: 'Check Balance',
      viewTransactions: 'See Transactions',
      recipient: 'Who You Dey Send',
      transferAmount: 'How Much You Wan Send',
    }
  },
  yo: {
    common: {
      dashboard: 'Ojú-iwé',
      transfer: 'Firanṣẹ',
      bills: 'San Owo',
      sme: 'Ohun Elo Iṣowo',
      coach: 'Olukọni Owo',
      settings: 'Ètò',
      
      continue: 'Tẹ̀síwájú',
      back: 'Padà',
      cancel: 'Fagilee',
      confirm: 'Jẹ̀rìísí',
      save: 'Fipamọ́',
      edit: 'Ṣàtúnṣe',
      delete: 'Pajẹ',
      send: 'Firanṣẹ',
      
      amount: 'Iye Owo',
      account: 'Àkáǹtì',
      balance: 'Iye Owo Tó Kù',
      name: 'Orúkọ',
      phone: 'Nọ́mbà Fóònù',
      email: 'Ímeèlì',
      date: 'Ọjọ́',
      status: 'Ipò',
      
      pending: 'Ń Dúró',
      completed: 'Tí Parí',
      failed: 'Kò Ṣe',
      active: 'Ń Ṣiṣẹ́',
      inactive: 'Kò Ṣiṣẹ́',
      
      greeting: "Káàbọ̀! Èmi ni Ziva, olùrànwọ́ ìfowópamọ́ yín. Báwo ni mo ṣe le ṣe ìrànwọ́ fún yín lónìí?",
      listening: "Mò ń gbọ́...",
      processing: "Mò ń ṣiṣẹ́ lórí rẹ̀...",
      error: "Má bínú, òye mi kò yé ohun tí ẹ sọ. Ẹ gbìyànjú lẹ́ẹ̀kan sí i.",
    },
    onboarding: {
      welcome: 'Káàbọ̀ sí 4All Banking',
      languageSelection: 'Èdè wo ni ẹ fẹ́ lò?',
      accessibilityNeeds: 'Ṣé ẹ nílò ìrànlọ́wọ́ pàtàkì kan?',
      interactionMode: 'Báwo ni ẹ fẹ́ bá wa sọ̀rọ̀?',
      voiceFirst: 'Ohùn Lákọ̀kọ́',
      textOnly: 'Kọ̀ọ́ Nìkan',
    },
    banking: {
      sendMoney: 'Fi Owó Ránṣẹ́',
      payBills: 'San Owó',
      checkBalance: 'Wo Iye Owó',
      viewTransactions: 'Wo Àwọn Ìṣòwò',
      recipient: 'Ẹni Tí Ẹ Fẹ́ Firanṣẹ́',
      transferAmount: 'Iye Owó Tí Ẹ Fẹ́ Firanṣẹ́',
    }
  },
  ig: {
    common: {
      dashboard: 'Dashboard',
      transfer: 'Ziga Ego',
      bills: 'Kwụọ Ụgwọ',
      sme: 'Ngwa Azụmaahịa',
      coach: 'Onye Nkuzi Ego',
      settings: 'Ntọala',
      
      continue: 'Gaba n\'ihu',
      back: 'Laghachi azụ',
      cancel: 'Kagbuo',
      confirm: 'Kwenye',
      save: 'Chekwaa',
      edit: 'Dezie',
      delete: 'Hichapụ',
      send: 'Ziga',
      
      amount: 'Ego Ole',
      account: 'Akaụntụ',
      balance: 'Ego Dị',
      name: 'Aha',
      phone: 'Ekwentị',
      email: 'Email',
      date: 'Ụbọchị',
      status: 'Ọnọdụ',
      
      pending: 'Na-eche',
      completed: 'Emechara',
      failed: 'Emeghị',
      active: 'Na-arụ ọrụ',
      inactive: 'Anaghị arụ ọrụ',
      
      greeting: "Nnọọ! Abụ m Ziva, onye inyeaka ụlọ akụ gị. Kedu ka m ga-esi nyere gị aka taa?",
      listening: "Ana m ege ntị...",
      processing: "Ana m arụ ọrụ na ya...",
      error: "Ewela iwe, aghọtaghị m ihe i kwuru. Biko nwalee ọzọ.",
    },
    onboarding: {
      welcome: 'Nnọọ na 4All Banking',
      languageSelection: 'Kedu asụsụ ị chọrọ iji?',
      accessibilityNeeds: 'Ị nwere mkpa enyemaka pụrụ iche?',
      interactionMode: 'Kedu otu ị chọrọ ka anyị kwuo okwu?',
      voiceFirst: 'Olu Mbụ',
      textOnly: 'Naanị Ide',
    },
    banking: {
      sendMoney: 'Ziga Ego',
      payBills: 'Kwụọ Ụgwọ',
      checkBalance: 'Lee Ego Dị',
      viewTransactions: 'Lee Azụmaahịa',
      recipient: 'Onye Ị Na-eziga',
      transferAmount: 'Ego Ole Ị Chọrọ Iziga',
    }
  },
  ha: {
    common: {
      dashboard: 'Dashboard',
      transfer: 'Aika Kuɗi',
      bills: 'Biya Buɗewa',
      sme: 'Kayan Kasuwanci',
      coach: 'Malamin Kuɗi',
      settings: 'Saiti',
      
      continue: 'Ci gaba',
      back: 'Koma baya',
      cancel: 'Soke',
      confirm: 'Tabbatar',
      save: 'Ajiye',
      edit: 'Gyara',
      delete: 'Share',
      send: 'Aika',
      
      amount: 'Adadin Kuɗi',
      account: 'Asusun',
      balance: 'Kuɗin da Suka Rage',
      name: 'Suna',
      phone: 'Wayar',
      email: 'Email',
      date: 'Rana',
      status: 'Matsayi',
      
      pending: 'Ana Jira',
      completed: 'An Gama',
      failed: 'Bai Yi Ba',
      active: 'Yana Aiki',
      inactive: 'Ba Ya Aiki',
      
      greeting: "Sannu! Ni ne Ziva, mataimakiyar banki. Yaya zan iya taimaka muku yau?",
      listening: "Ina saurara...",
      processing: "Ina aiki a kai...",
      error: "Yi hakuri, ban fahimci abin da kuka faɗa ba. Da fatan za ku sake gwadawa.",
    },
    onboarding: {
      welcome: 'Maraba da zuwa 4All Banking',
      languageSelection: 'Wane harshe kuke so ku yi amfani da shi?',
      accessibilityNeeds: 'Kuna da wani buƙatu na musamman?',
      interactionMode: 'Ta yaya kuke son mu yi magana?',
      voiceFirst: 'Murya Da Farko',
      textOnly: 'Rubutu Kawai',
    },
    banking: {
      sendMoney: 'Aika Kuɗi',
      payBills: 'Biya Kuɗi',
      checkBalance: 'Duba Kuɗi',
      viewTransactions: 'Duba Kasuwanci',
      recipient: 'Wanda Ake Aikawa',
      transferAmount: 'Adadin Kuɗin Da Ake So',
    }
  }
};

// Initialize i18next
i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  
  interpolation: {
    escapeValue: false,
  },
  
  ns: ['common', 'onboarding', 'banking'],
  defaultNS: 'common',
});

export default i18n;