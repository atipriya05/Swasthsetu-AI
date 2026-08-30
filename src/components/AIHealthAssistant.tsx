import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  Bot,
  User,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RefreshCw,
  X,
  FileText,
  Sparkles,
  AlertTriangle,
  HeartPulse,
  Globe,
  Trash2,
  Activity,
  PhoneCall,
  CheckCircle2,
  HelpCircle,
  Stethoscope
} from 'lucide-react';
import { SpeechService, SpeechRecognitionService } from '../utils/speech';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isGeminiPowered?: boolean;
  language?: string;
  isAudioPlaying?: boolean;
}

interface AIHealthAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenReportGeneratorWithText?: (text: string) => void;
}

export const SUPPORTED_LANGUAGES = [
  { code: 'hi', label: 'हिंदी', name: 'Hindi' },
  { code: 'en', label: 'English', name: 'English' },
  { code: 'mr', label: 'मराठी', name: 'Marathi' },
  { code: 'bn', label: 'বাংলা', name: 'Bengali' },
  { code: 'ta', label: 'தமிழ்', name: 'Tamil' },
  { code: 'te', label: 'తెలుగు', name: 'Telugu' },
  { code: 'gu', label: 'ગુજરાતી', name: 'Gujarati' },
  { code: 'kn', label: 'ಕನ್ನಡ', name: 'Kannada' },
  { code: 'ml', label: 'മലയാളം', name: 'Malayalam' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ', name: 'Punjabi' },
  { code: 'or', label: 'ଓଡ଼ିଆ', name: 'Odia' },
  { code: 'ur', label: 'اردو', name: 'Urdu' }
];

export const AIHealthAssistant: React.FC<AIHealthAssistantProps> = ({
  isOpen,
  onClose,
  onOpenReportGeneratorWithText
}) => {
  const { language: globalAppLang } = useLanguage();

  // Active chat language selection
  const [chatLanguage, setChatLanguage] = useState<string>(globalAppLang || 'hi');
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [autoSpeakEnabled, setAutoSpeakEnabled] = useState(true);
  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);
  const [isGeminiReady, setIsGeminiReady] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initial welcome message localized to the chat language
  const getInitialWelcomeMessage = (lang: string): string => {
    switch (lang) {
      case 'hi':
        return 'नमस्ते! मैं स्वास्थ्य सेतु AI चिकित्सक सहायक हूँ।\n• अपने लक्षण, बुखार, दर्द या किसी भी बीमारी के बारे में बताएं या माइक दबाकर बोलें।\n• मैं तुरंत लक्षणों का क्लीनिकल विश्लेषण कर सही उपचार और सलाह दूंगा।';
      case 'mr':
        return 'नमस्कार! मी स्वास्थ्य सेतू AI आरोग्य सहाय्यक आहे.\n• आपली लक्षणे, दुखणे किंवा आरोग्याविषयी प्रश्न सांगा किंवा आवाजात बोला.\n• मी आपल्या लक्षणांचे विश्लेषण करून योग्य वैद्यकीय सल्ला देईन.';
      case 'bn':
        return 'নমস্কার! আমি স্বাস্থ্য সেতু এআই স্বাস্থ্য সহকারী।\n• আপনার লক্ষণ, জ্বর বা স্বাস্থ্য সমস্যা সম্পর্কে লিখুন বা বলুন।\n• আমি সঠিক বিশ্লেষণ ও প্রাথমিক পরামর্শ প্রদান করব।';
      case 'ta':
        return 'வணக்கம்! நான் ஸ்வஸ்த் சேது AI சுகாதார உதவியாளர்.\n• உங்கள் அறிகுறிகள் அல்லது உடல்நலப் பிரச்சனைகளை தெரிவிக்கவும்.\n• துல்லியமான மருத்துவ பகுப்பாய்வு மற்றும் ஆலோசனையை வழங்குவேன்.';
      case 'te':
        return 'నమస్కారం! నేను స్వాస్థ్య సేతు AI ఆరోగ్య సహాయకుడిని.\n• మీ లక్షణాలు లేదా అనారోగ్య సమస్యలను వివరించండి.\n• సరైన విశ్లేషణ మరియు వైద్య మార్గదర్శకత్వాన్ని అందిస్తాను.';
      case 'gu':
        return 'નમસ્તે! હું સ્વાસ્થ્ય સેતુ AI આરોગ્ય સહાયક છું.\n• તમારા લક્ષણો, તાવ અથવા સ્વાસ્થ્ય સમસ્યા જણાવો.\n• હું સચોટ વિશ્લેષણ અને યોગ્ય સલાહ આપીશ.';
      case 'en':
      default:
        return 'Hello! I am your SwasthSetu AI Health Assistant.\n• Type or speak your symptoms (e.g. fever, chest pain, stomach ache, rash).\n• I provide immediate clinical symptom analysis, urgency evaluation, and medical guidance.';
    }
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: getInitialWelcomeMessage(chatLanguage),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isGeminiPowered: false,
      language: chatLanguage
    }
  ]);

  // Sync initial language if global app language changes
  useEffect(() => {
    if (globalAppLang && !messages.some(m => m.sender === 'user')) {
      setChatLanguage(globalAppLang);
      setMessages([
        {
          id: `msg-welcome-${Date.now()}`,
          sender: 'assistant',
          text: getInitialWelcomeMessage(globalAppLang),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isGeminiPowered: false,
          language: globalAppLang
        }
      ]);
    }
  }, [globalAppLang]);

  // Check Gemini Status
  useEffect(() => {
    fetch('/api/gemini/status')
      .then(res => res.json())
      .then(data => {
        setIsGeminiReady(Boolean(data.configured));
      })
      .catch(() => setIsGeminiReady(false));
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      chatContainerRef.current?.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    } else {
      SpeechService.stop();
      SpeechRecognitionService.stopListening();
      setIsListening(false);
      setActivePlayingId(null);
    }
  }, [isOpen]);

  // Stop TTS when unmounted
  useEffect(() => {
    return () => {
      SpeechService.stop();
      SpeechRecognitionService.stopListening();
    };
  }, []);

  // Quick Action Symptom Prompts
  const quickPrompts = [
    {
      label: chatLanguage === 'hi' ? '🤒 बुखार और ठंड' : chatLanguage === 'mr' ? '🤒 ताप आणि थंडी' : '🤒 Fever & Chills',
      text: chatLanguage === 'hi' ? 'मुझे 3 दिन से 102 डिग्री तेज बुखार और बदन में तेज दर्द है।' : chatLanguage === 'mr' ? 'मला ३ दिवसांपासून तीव्र ताप आणि अंगदुखी आहे.' : 'I have high fever 102F and body aches for 3 days.'
    },
    {
      label: chatLanguage === 'hi' ? '🤢 पेट दर्द व उल्टी' : chatLanguage === 'mr' ? '🤢 पोटदुखी व उलटी' : '🤢 Stomach Pain & Vomiting',
      text: chatLanguage === 'hi' ? 'पेट में तेज मरोड़, दस्त और उल्टी की शिकायत है।' : chatLanguage === 'mr' ? 'पोटात तीव्र कळा, जुलाब आणि उलटीचा त्रास होत आहे.' : 'Severe stomach cramps, vomiting and loose motions.'
    },
    {
      label: chatLanguage === 'hi' ? '🐕 कुत्ते/जानवर का काटना' : chatLanguage === 'mr' ? '🐕 कुत्रा चावणे' : '🐕 Dog / Animal Bite',
      text: chatLanguage === 'hi' ? 'गली के कुत्ते ने पैर पर काट लिया है, क्या करें?' : chatLanguage === 'mr' ? 'कुत्रा पायाला चावला आहे, प्राथमिक उपचार काय करावे?' : 'Stray dog bite on leg, what is the immediate treatment?'
    },
    {
      label: chatLanguage === 'hi' ? '🫀 सीने में दर्द व सांस' : chatLanguage === 'mr' ? '🫀 छातीत दुखणे' : '🫀 Chest Pain / Breathing',
      text: chatLanguage === 'hi' ? 'सीने में भारीपन, पसीना और सांस लेने में तकलीफ हो रही है।' : chatLanguage === 'mr' ? 'छातीत जडपणा आणि श्वास घेण्यास त्रास होत आहे.' : 'Heavy chest tightness, sweating, and difficulty breathing.'
    },
    {
      label: chatLanguage === 'hi' ? '🤰 गर्भावस्था जांच (ANC)' : chatLanguage === 'mr' ? '🤰 गरोदर तपासणी' : '🤰 Pregnancy Care',
      text: chatLanguage === 'hi' ? 'गर्भवती महिलाओं के लिए सरकारी अस्पताल में क्या सुविधाएं हैं?' : chatLanguage === 'mr' ? 'गरोदर महिलांसाठी शासकीय दवाखान्यात काय सोयी आहेत?' : 'What free maternal care services and vaccines are available at the PHC?'
    },
    {
      label: chatLanguage === 'hi' ? '🏥 5 लाख आयुष्मान कार्ड' : chatLanguage === 'mr' ? '🏥 आयुष्यमान कार्ड' : '🏥 Ayushman Bharat Card',
      text: chatLanguage === 'hi' ? 'आयुष्मान भारत कार्ड से 5 लाख का मुफ्त इलाज कैसे मिलता है?' : chatLanguage === 'mr' ? 'आयुष्मान भारत कार्डद्वारे मोफत उपचार कसे मिळतात?' : 'How does Ayushman Bharat PM-JAY provide 5 Lakh free hospital treatment?'
    }
  ];

  // Send Message Handler
  const handleSendMessage = async (textToSend?: string) => {
    const rawText = (textToSend || inputText).trim();
    if (!rawText || isLoading) return;

    // Stop ongoing speech
    SpeechService.stop();
    setActivePlayingId(null);

    const userMessageId = `msg-user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMessageId,
      sender: 'user',
      text: rawText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language: chatLanguage
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      // Build conversation history for context
      const historyPayload = messages
        .filter(m => m.id !== 'msg-welcome' && !m.id.startsWith('msg-welcome-'))
        .map(m => ({
          sender: m.sender,
          text: m.text
        }));

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: rawText,
          language: chatLanguage,
          history: historyPayload
        })
      });

      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }

      const data = await res.json();
      const botReplyText = data.reply || 'Thank you for consulting. Please visit your nearest PHC.';
      const isPowered = Boolean(data.isGeminiPowered);

      const botMessageId = `msg-bot-${Date.now()}`;
      const botMsg: ChatMessage = {
        id: botMessageId,
        sender: 'assistant',
        text: botReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isGeminiPowered: isPowered,
        language: data.language || chatLanguage
      };

      setMessages(prev => [...prev, botMsg]);

      // Automatically speak the response if enabled
      if (autoSpeakEnabled) {
        playTTS(botMessageId, botReplyText, data.language || chatLanguage);
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      const fallbackMsg: ChatMessage = {
        id: `msg-bot-err-${Date.now()}`,
        sender: 'assistant',
        text: chatLanguage === 'hi'
          ? '⚠️ यदि आपको गंभीर लक्षण महसूस हो रहे हैं, तो तुरंत 108 पर कॉल करें या नजदीकी प्राथमिक स्वास्थ्य केंद्र (PHC) में डॉक्टर को दिखाएं।'
          : chatLanguage === 'mr'
          ? '⚠️ आपणास तीव्र त्रास होत असल्यास ताबडतोब १०८ रुग्णवाहिका बोलवा किंवा जवळच्या शासकीय रुग्णालयात जा.'
          : '⚠️ If experiencing severe symptoms, please dial 108 immediately or visit your nearest Primary Health Centre (PHC).',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isGeminiPowered: false,
        language: chatLanguage
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Text-to-Speech Playback
  const playTTS = (messageId: string, text: string, lang: string) => {
    if (activePlayingId === messageId) {
      SpeechService.stop();
      setActivePlayingId(null);
      return;
    }

    SpeechService.stop();
    setActivePlayingId(messageId);

    SpeechService.speak(
      text,
      lang || chatLanguage,
      () => setActivePlayingId(messageId),
      () => setActivePlayingId(null),
      () => setActivePlayingId(null)
    );
  };

  // Voice Input Toggle (Speech-to-Text)
  const handleToggleVoiceInput = () => {
    if (isListening) {
      SpeechRecognitionService.stopListening();
      setIsListening(false);
      return;
    }

    SpeechService.stop();
    setActivePlayingId(null);

    const started = SpeechRecognitionService.startListening(
      chatLanguage,
      (transcript, isFinal) => {
        setInputText(transcript);
        if (isFinal && transcript.trim().length > 3) {
          SpeechRecognitionService.stopListening();
          setIsListening(false);
          handleSendMessage(transcript);
        }
      },
      () => setIsListening(true),
      () => setIsListening(false),
      (err) => {
        console.warn('Speech recognition error:', err);
        setIsListening(false);
      }
    );

    if (!started) {
      setIsListening(false);
    }
  };

  // Clear Chat
  const handleClearChat = () => {
    SpeechService.stop();
    setActivePlayingId(null);
    setMessages([
      {
        id: `msg-welcome-${Date.now()}`,
        sender: 'assistant',
        text: getInitialWelcomeMessage(chatLanguage),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isGeminiPowered: false,
        language: chatLanguage
      }
    ]);
  };

  // Switch Language
  const handleSelectLanguage = (code: string) => {
    setChatLanguage(code);
    setIsLangMenuOpen(false);
    SpeechService.stop();
    setActivePlayingId(null);

    // Add a helpful transition note
    const langObj = SUPPORTED_LANGUAGES.find(l => l.code === code);
    const welcome = getInitialWelcomeMessage(code);
    setMessages(prev => [
      ...prev,
      {
        id: `msg-lang-switch-${Date.now()}`,
        sender: 'assistant',
        text: `${welcome}\n\n🌐 [Language switched to ${langObj?.name || code}]`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language: code
      }
    ]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl h-[92vh] max-h-[760px] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
        
        {/* Header */}
        <div className="bg-linear-to-r from-[#1A5FB4] via-[#1c6dd0] to-[#26A269] px-4 py-3 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-white/15 border border-white/30 flex items-center justify-center shadow-inner">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-[#1A5FB4] rounded-full animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base leading-tight">
                  {chatLanguage === 'hi' ? 'स्वास्थ्य सेतु AI चिकित्सक' : chatLanguage === 'mr' ? 'स्वास्थ्य सेतू AI सहाय्यक' : 'SwasthSetu AI Health Assistant'}
                </h3>
                {isGeminiReady ? (
                  <span className="bg-white/20 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 border border-white/20">
                    <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                    Gemini 2.5
                  </span>
                ) : (
                  <span className="bg-emerald-900/40 text-emerald-100 text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-400/30">
                    <Activity className="w-2.5 h-2.5 text-emerald-300" />
                    Clinical Engine
                  </span>
                )}
              </div>
              <p className="text-[11px] text-white/85 flex items-center gap-1.5">
                <span>🔊 Voice & Multilingual Clinical Symptom Analysis</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Language Switcher Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="bg-white/15 hover:bg-white/25 active:scale-95 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 border border-white/25 transition-all cursor-pointer"
                title="Change Chat Language"
              >
                <Globe className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {SUPPORTED_LANGUAGES.find(l => l.code === chatLanguage)?.label || 'Language'}
                </span>
                <span className="sm:hidden uppercase">{chatLanguage}</span>
              </button>

              {isLangMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-1.5 z-50 text-gray-800 text-xs max-h-64 overflow-y-auto">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100">
                    Select Language / भाषा चुनें
                  </div>
                  {SUPPORTED_LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => handleSelectLanguage(lang.code)}
                      className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-blue-50 transition-colors cursor-pointer ${
                        chatLanguage === lang.code ? 'font-bold text-[#1A5FB4] bg-blue-50/70' : ''
                      }`}
                    >
                      <span className="text-xs font-medium">{lang.label} ({lang.name})</span>
                      {chatLanguage === lang.code && <CheckCircle2 className="w-3.5 h-3.5 text-[#1A5FB4]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Auto-TTS Toggle */}
            <button
              type="button"
              onClick={() => {
                setAutoSpeakEnabled(!autoSpeakEnabled);
                if (autoSpeakEnabled) SpeechService.stop();
              }}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                autoSpeakEnabled
                  ? 'bg-amber-400 text-gray-900 border-amber-300 font-bold shadow-xs'
                  : 'bg-white/15 text-white border-white/25 opacity-70 hover:opacity-100'
              }`}
              title={autoSpeakEnabled ? 'Auto-Voice: ON' : 'Auto-Voice: OFF'}
            >
              {autoSpeakEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Clear Chat */}
            <button
              type="button"
              onClick={handleClearChat}
              className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white border border-white/25 transition-all cursor-pointer"
              title="Clear conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/15 hover:bg-red-500 hover:text-white text-white border border-white/25 transition-all cursor-pointer ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Emergency Alert Banner */}
        <div className="bg-red-50 border-b border-red-200 px-3.5 py-1.5 flex items-center justify-between text-xs text-red-800">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <span className="text-[11px] font-medium leading-tight">
              {chatLanguage === 'hi'
                ? 'आपातकाल में तुरंत 108 एम्बुलेंस डायल करें।'
                : chatLanguage === 'mr'
                ? 'तातडीच्या प्रसंगी त्वरित १०८ रुग्णवाहिकेला कॉल करा.'
                : 'For acute emergencies, dial 108 for immediate free ambulance.'}
            </span>
          </div>
          <a
            href="tel:108"
            className="font-bold text-red-700 bg-red-100 hover:bg-red-200 px-2 py-0.5 rounded text-[11px] flex items-center gap-1 shrink-0 transition-colors"
          >
            <PhoneCall className="w-3 h-3" />
            108
          </a>
        </div>

        {/* Messages Stream */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5 bg-[#F8FAFC]"
        >
          {messages.map(msg => {
            const isUser = msg.sender === 'user';
            const isPlaying = activePlayingId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-[#1A5FB4] text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[86%] sm:max-w-[78%] rounded-2xl p-3.5 text-xs sm:text-sm shadow-xs ${
                    isUser
                      ? 'bg-[#1A5FB4] text-white rounded-tr-xs font-medium'
                      : 'bg-white text-gray-900 border border-gray-200 rounded-tl-xs'
                  }`}
                >
                  {/* Message Text with clean line breaks */}
                  <div className="whitespace-pre-line leading-relaxed">
                    {msg.text}
                  </div>

                  {/* Message Footer / Controls */}
                  <div
                    className={`mt-2.5 pt-2 border-t flex flex-wrap items-center justify-between gap-2 text-[11px] ${
                      isUser ? 'border-blue-400/40 text-blue-100' : 'border-gray-100 text-gray-500'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{msg.timestamp}</span>
                      {!isUser && msg.isGeminiPowered && (
                        <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-1.5 py-0.2 rounded flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                          Gemini
                        </span>
                      )}
                    </div>

                    {/* Assistant Actions: Speak Audio & Create Doctor Report */}
                    {!isUser && (
                      <div className="flex items-center gap-1.5">
                        {/* Text to Speech Button */}
                        <button
                          type="button"
                          onClick={() => playTTS(msg.id, msg.text, msg.language || chatLanguage)}
                          className={`p-1 px-2 rounded-md font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer ${
                            isPlaying
                              ? 'bg-[#26A269] text-white animate-pulse'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          }`}
                          title="Listen to this message"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>{isPlaying ? 'Speaking...' : 'Listen'}</span>
                        </button>

                        {/* Convert to Doctor Triage Report */}
                        {onOpenReportGeneratorWithText && msg.id !== 'msg-welcome' && (
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onOpenReportGeneratorWithText(msg.text);
                            }}
                            className="p-1 px-2 rounded-md font-bold text-[11px] bg-blue-50 hover:bg-blue-100 text-[#1A5FB4] flex items-center gap-1 transition-all cursor-pointer"
                            title="Generate Doctor Clinical Report"
                          >
                            <Stethoscope className="w-3 h-3" />
                            <span>{chatLanguage === 'hi' ? 'डॉक्टर पर्ची बनाएं' : 'Doctor Report'}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-[#1A5FB4] border border-blue-200 flex items-center justify-center shrink-0 shadow-xs mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-2.5 items-start">
              <div className="w-8 h-8 rounded-full bg-[#1A5FB4] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-xs p-3.5 shadow-xs text-xs text-gray-600 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-[#1A5FB4]" />
                <span className="font-medium">
                  {chatLanguage === 'hi'
                    ? 'AI लक्षणों का क्लीनिकल विश्लेषण कर रहा है...'
                    : chatLanguage === 'mr'
                    ? 'AI लक्षणांचे विश्लेषण करत आहे...'
                    : 'AI is analyzing symptoms & triage guidelines...'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-3 py-2 bg-white border-t border-gray-200 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-1.5">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(p.text)}
              disabled={isLoading}
              className="bg-[#F0F5F9] hover:bg-[#DEE9F7] hover:border-[#1A5FB4] text-gray-800 border border-gray-200 text-xs font-bold px-3 py-1.5 rounded-full transition-all shrink-0 cursor-pointer disabled:opacity-50"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Live Listening Banner */}
        {isListening && (
          <div className="bg-red-500 text-white px-4 py-2 flex items-center justify-between text-xs font-bold animate-pulse">
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4 animate-ping" />
              <span>
                {chatLanguage === 'hi'
                  ? '🔴 आवाज़ रिकॉर्ड हो रही है... बोलें (माइक बंद करने हेतु दोबारा दबाएं)'
                  : '🔴 Listening... Speak clearly in your selected language.'}
              </span>
            </div>
            <button
              onClick={() => {
                SpeechRecognitionService.stopListening();
                setIsListening(false);
              }}
              className="bg-white text-red-600 px-2 py-0.5 rounded font-bold text-[11px]"
            >
              Stop
            </button>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-gray-200 flex items-center gap-2">
          {/* Voice Input Microphone Button */}
          <button
            type="button"
            onClick={handleToggleVoiceInput}
            className={`p-3 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-xs ${
              isListening
                ? 'bg-[#E01B24] text-white ring-4 ring-red-200 animate-pulse'
                : 'bg-[#26A269] hover:bg-emerald-700 text-white'
            }`}
            title="Speak symptoms (Voice to Text)"
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text Input */}
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
            placeholder={
              chatLanguage === 'hi'
                ? 'अपने लक्षण लिखें या माइक दबाकर बोलें...'
                : chatLanguage === 'mr'
                ? 'आपली लक्षणे लिहा किंवा माईक दाबून बोला...'
                : 'Describe your symptoms or press mic to speak...'
            }
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-[#F0F5F9] border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 font-medium focus:bg-white focus:ring-2 focus:ring-[#1A5FB4] outline-hidden transition-all disabled:opacity-60"
          />

          {/* Send Button */}
          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading}
            className="bg-[#1A5FB4] hover:bg-blue-700 disabled:opacity-40 text-white p-3 rounded-xl transition-all cursor-pointer shrink-0 shadow-xs"
            title="Send Message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  );
};
