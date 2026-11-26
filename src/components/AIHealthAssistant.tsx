import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  AlertTriangle,
  Globe,
  RotateCcw,
  PhoneCall,
  Check,
  Stethoscope,
  User,
  Square,
  Info
} from 'lucide-react';
import { SpeechService, UnifiedVoiceInput } from '../utils/speech';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isGeminiPowered?: boolean;
  language?: string;
}

interface AIHealthAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenReportGeneratorWithText?: (text: string) => void;
}

// Supported assistant languages
export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', name: 'English' },
  { code: 'hi', label: 'हिंदी', name: 'Hindi' },
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
  const { language: globalAppLang, t } = useLanguage();

  const [chatLanguage, setChatLanguage] = useState<string>(globalAppLang || 'en');
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [voiceState, setVoiceState] = useState<'idle' | 'listening' | 'recording_fallback' | 'transcribing'>('idle');
  const [voiceError, setVoiceError] = useState('');
  const [autoSpeakEnabled, setAutoSpeakEnabled] = useState(false);
  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const getInitialWelcomeMessage = (lang: string): string => {
    switch (lang) {
      case 'hi':
        return 'नमस्ते। मैं स्वास्थ्य सेतु AI लक्षण जांच सहायक हूँ।\nकृपया अपने लक्षण, अवधि या स्वास्थ्य संबंधी प्रश्न लिखें अथवा माइक्रोफ़ोन का उपयोग कर बोलें। मैं प्रारंभिक नैदानिक मार्गदर्शन और अगले आवश्यक चरणों की जानकारी प्रदान करूंगा।';
      case 'bn':
        return 'নমস্কার। আমি স্বাস্থ্য সেতু AI স্বাস্থ্য সহকারী।\nঅনুগ্রহ করে আপনার লক্ষণ বা স্বাস্থ্য সংক্রান্ত প্রশ্ন লিখুন বা বলুন। আমি প্রাথমিক চিকিৎসা পরামর্শ প্রদান করব।';
      case 'ta':
        return 'வணக்கம். நான் ஸ்வஸ்த் சேது AI சுகாதார உதவியாளர்.\nஉங்கள் அறிகுறிகள் அல்லது உடல்நலக் கேள்விகளைப் பதிவிடவும். ஆரம்பக்கட்ட மருத்துவ வழிகாட்டுதலை வழங்குவேன்.';
      case 'te':
        return 'నమస్కారం. నేను స్వాస్థ్య సేతు AI ఆరోగ్య సహాయకుడిని.\nదయచేసి మీ లక్షణాలు లేదా ఆరోగ్య ప్రశ్నలను తెలియజేయండి. ప్రాథమిక వైద్య మార్గదర్శకత్వం అందిస్తాను.';
      case 'gu':
        return 'નમસ્તે. હું સ્વાસ્થ્ય સેતુ AI આરોગ્ય સહાયક છું.\nકૃપા કરીને તમારા લક્ષણો અથવા સ્વાસ્થ્ય પ્રશ્નો જણાવો. હું પ્રાથમિક તબીબી માર્ગદર્શન આપીશ.';
      case 'en':
      default:
        return 'Welcome to the SwasthSetu AI Symptom Checker.\nDescribe your symptoms, their duration, or any public healthcare question below. You may also use the microphone for voice input to receive structured preliminary guidance.';
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

  useEffect(() => {
    if (globalAppLang && !messages.some((m) => m.sender === 'user')) {
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

  useEffect(() => {
    if (isOpen) {
      chatContainerRef.current?.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading, isOpen]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 120);
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      SpeechService.stop();
      UnifiedVoiceInput.stop();
      setActivePlayingId(null);
      setIsLangMenuOpen(false);
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    return () => {
      SpeechService.stop();
      UnifiedVoiceInput.stop();
    };
  }, []);

  // Neat suggested prompt chips (emoji-free, formal clinical wording)
  const quickPrompts = [
    {
      label: chatLanguage === 'hi' ? 'बुखार और कंपकंपी' : 'Fever and chills',
      text:
        chatLanguage === 'hi'
          ? 'मुझे 3 दिन से 102°F तेज बुखार और शरीर में दर्द है।'
          : 'I have had a high fever of 102°F and body aches for 3 days.'
    },
    {
      label: chatLanguage === 'hi' ? 'पेट दर्द व उल्टी' : 'Stomach pain & vomiting',
      text:
        chatLanguage === 'hi'
          ? 'पेट में तेज मरोड़, दस्त और उल्टी की शिकायत है।'
          : 'I am experiencing abdominal cramps, vomiting, and loose stools.'
    },
    {
      label: chatLanguage === 'hi' ? 'पशु काटने पर उपचार' : 'Animal bite first aid',
      text:
        chatLanguage === 'hi'
          ? 'कुत्ते ने पैर पर काट लिया है, तत्काल प्राथमिक उपचार क्या करें?'
          : 'A stray dog bit my leg. What immediate first aid and vaccine steps should I take?'
    },
    {
      label: chatLanguage === 'hi' ? 'सीने में दर्द व सांस' : 'Chest pain or breathlessness',
      text:
        chatLanguage === 'hi'
          ? 'सीने में भारीपन, पसीना और सांस लेने में कठिनाई हो रही है।'
          : 'I have chest tightness, sweating, and shortness of breath.'
    },
    {
      label: chatLanguage === 'hi' ? 'प्रसव पूर्व जांच (ANC)' : 'Antenatal care (ANC)',
      text:
        chatLanguage === 'hi'
          ? 'गर्भवती महिलाओं के लिए सरकारी PHC पर कौन-सी निःशुल्क सुविधाएं उपलब्ध हैं?'
          : 'What free antenatal care services and vaccines are available at the PHC?'
    },
    {
      label: chatLanguage === 'hi' ? 'आयुष्मान भारत योजना' : 'Ayushman Bharat PM-JAY',
      text:
        chatLanguage === 'hi'
          ? 'आयुष्मान भारत PM-JAY कार्ड से निःशुल्क अस्पताल उपचार कैसे प्राप्त होता है?'
          : 'How does Ayushman Bharat PM-JAY provide cashless hospital coverage?'
    }
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const rawText = (textToSend ?? inputText).trim();
    if (!rawText || isLoading) return;

    // Immediately stop any active voice input to prevent speech events from re-populating the chat box
    await UnifiedVoiceInput.stop();
    setVoiceState('idle');

    SpeechService.stop();
    setActivePlayingId(null);

    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: rawText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language: chatLanguage
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    setIsLoading(true);

    try {
      const historyPayload = messages
        .filter((m) => !m.id.startsWith('msg-welcome'))
        .map((m) => ({
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
      const botReplyText =
        data.reply ||
        'Thank you for sharing your symptoms. Please consult a physician at your nearest Primary Health Centre.';

      const botMessageId = `msg-bot-${Date.now()}`;
      const botMsg: ChatMessage = {
        id: botMessageId,
        sender: 'assistant',
        text: botReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isGeminiPowered: Boolean(data.isGeminiPowered),
        language: data.language || chatLanguage
      };

      setMessages((prev) => [...prev, botMsg]);

      if (autoSpeakEnabled) {
        playTTS(botMessageId, botReplyText, data.language || chatLanguage);
      }
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackMsg: ChatMessage = {
        id: `msg-bot-err-${Date.now()}`,
        sender: 'assistant',
        text:
          chatLanguage === 'hi'
            ? 'कनेक्शन में अस्थायी बाधा है। यदि लक्षण गंभीर हैं, तो कृपया तुरंत 108 पर कॉल करें या निकटतम प्राथमिक स्वास्थ्य केंद्र (PHC) जाएं।'
            : 'Unable to reach the guidance service at this moment. If you are experiencing severe symptoms, please call 108 immediately or visit your nearest Primary Health Centre.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isGeminiPowered: false,
        language: chatLanguage
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleToggleVoiceInput = async () => {
    setVoiceError('');
    SpeechService.stop();
    setActivePlayingId(null);

    if (voiceState !== 'idle') {
      await UnifiedVoiceInput.stop({
        language: chatLanguage,
        onTranscript: (transcript) => {
          setInputText(transcript);
        },
        onStateChange: (state) => setVoiceState(state),
        onError: (err) => setVoiceError(err)
      });
      return;
    }

    await UnifiedVoiceInput.start({
      language: chatLanguage,
      onTranscript: (transcript) => {
        setInputText(transcript);
        setVoiceError('');
      },
      onStateChange: (state) => setVoiceState(state),
      onError: (err) => setVoiceError(err)
    });
  };

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

  const handleSelectLanguage = (code: string) => {
    setChatLanguage(code);
    setIsLangMenuOpen(false);
    SpeechService.stop();
    setActivePlayingId(null);

    const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === code);
    const welcome = getInitialWelcomeMessage(code);
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-lang-switch-${Date.now()}`,
        sender: 'assistant',
        text: `${welcome}\n\n[Language updated to ${langObj?.name || code}]`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language: code
      }
    ]);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-900/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="assistant-modal-title"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl h-[100dvh] sm:h-[92vh] sm:max-h-[760px] rounded-none sm:rounded-xl shadow-[var(--shadow-elevated)] flex flex-col overflow-hidden border-0 sm:border border-[var(--border-default)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Clinical Modal Header */}
        <div className="bg-white px-3 sm:px-5 py-3 sm:py-4 border-b border-[var(--border-default)] flex items-center justify-between gap-2 sm:gap-3 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[var(--brand-primary)] text-white flex items-center justify-center shrink-0"
              aria-hidden="true"
            >
              <Stethoscope className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h2
                id="assistant-modal-title"
                className="text-sm sm:text-base font-semibold text-[var(--text-primary)] truncate"
              >
                {t('chatbotTitle')}
              </h2>
              <p className="text-[11px] sm:text-xs text-[var(--text-muted)] truncate hidden sm:block">
                {t('chatbotSubtitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Language Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsLangMenuOpen((prev) => !prev)}
                aria-expanded={isLangMenuOpen}
                aria-haspopup="listbox"
                className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-md text-xs font-medium text-[var(--text-primary)] bg-[var(--bg-subtle)] hover:bg-slate-200/70 border border-[var(--border-default)] transition-colors cursor-pointer"
                title="Change conversation language"
              >
                <Globe className="w-3.5 h-3.5 text-[var(--text-secondary)]" aria-hidden="true" />
                <span className="hidden sm:inline">
                  {SUPPORTED_LANGUAGES.find((l) => l.code === chatLanguage)?.label || 'English'}
                </span>
                <span className="sm:hidden font-mono uppercase font-semibold">
                  {chatLanguage}
                </span>
              </button>

              {isLangMenuOpen && (
                <div
                  role="listbox"
                  aria-label="Conversation language"
                  className="absolute right-0 mt-1.5 w-48 bg-white rounded-lg shadow-lg border border-[var(--border-default)] py-1 z-50 max-h-64 overflow-y-auto"
                >
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-[var(--text-muted)] border-b border-[var(--border-default)]">
                    Select Language / भाषा चुनें
                  </div>
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      role="option"
                      aria-selected={chatLanguage === lang.code}
                      onClick={() => handleSelectLanguage(lang.code)}
                      className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer ${
                        chatLanguage === lang.code
                          ? 'font-semibold text-[var(--brand-primary)] bg-[var(--brand-primary-tint)]'
                          : 'text-[var(--text-primary)]'
                      }`}
                    >
                      <span>
                        {lang.label} ({lang.name})
                      </span>
                      {chatLanguage === lang.code && (
                        <Check className="w-3.5 h-3.5 text-[var(--brand-primary)]" aria-hidden="true" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Auto-Voice Readout Toggle */}
            <button
              type="button"
              onClick={() => {
                setAutoSpeakEnabled((prev) => {
                  if (prev) SpeechService.stop();
                  return !prev;
                });
              }}
              aria-pressed={autoSpeakEnabled}
              aria-label={autoSpeakEnabled ? 'Disable automatic voice readout' : 'Enable automatic voice readout'}
              title={autoSpeakEnabled ? 'Auto-readout enabled' : 'Auto-readout muted'}
              className={`p-2 rounded-md border transition-colors cursor-pointer ${
                autoSpeakEnabled
                  ? 'bg-[var(--brand-primary-tint)] text-[var(--brand-primary)] border-[var(--brand-primary-border)]'
                  : 'bg-white text-[var(--text-muted)] border-[var(--border-default)] hover:text-[var(--text-primary)]'
              }`}
            >
              {autoSpeakEnabled ? (
                <Volume2 className="w-4 h-4" aria-hidden="true" />
              ) : (
                <VolumeX className="w-4 h-4" aria-hidden="true" />
              )}
            </button>

            {/* Reset Chat */}
            <button
              type="button"
              onClick={handleClearChat}
              className="p-2 rounded-md bg-white text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-default)] transition-colors cursor-pointer"
              aria-label={t('clearChat')}
              title={t('clearChat')}
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-md bg-white text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
              aria-label={t('close')}
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Visible Medical Disclaimer & Emergency Notice Bar */}
        <div className="bg-[var(--bg-canvas)] border-b border-[var(--border-default)] px-5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-start gap-2 text-[var(--text-secondary)]">
            <Info className="w-4 h-4 text-[var(--brand-primary)] shrink-0 mt-0.5" aria-hidden="true" />
            <span>{t('medicalDisclaimer')}</span>
          </div>
          <a
            href="tel:108"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[var(--status-danger-bg)] text-[var(--status-danger)] border border-[var(--status-danger-border)] font-semibold whitespace-nowrap shrink-0 self-start sm:self-center"
          >
            <PhoneCall className="w-3 h-3" aria-hidden="true" />
            <span>{chatLanguage === 'hi' ? 'आपातकाल: 108' : 'Emergency: 108'}</span>
          </a>
        </div>

        {/* Messages Stream */}
        <div
          ref={chatContainerRef}
          role="log"
          aria-live="polite"
          aria-label="Symptom checker conversation"
          className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[var(--bg-canvas)]"
        >
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isPlaying = activePlayingId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div
                    className="w-7 h-7 rounded-md bg-[var(--brand-primary-tint)] text-[var(--brand-primary)] border border-[var(--brand-primary-border)] flex items-center justify-center shrink-0 mt-0.5"
                    aria-hidden="true"
                  >
                    <Stethoscope className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[78%] rounded-xl px-4 py-3 text-sm ${
                    isUser
                      ? 'bg-[var(--brand-primary)] text-white rounded-tr-xs'
                      : 'bg-white text-[var(--text-primary)] border border-[var(--border-default)] rounded-tl-xs shadow-[var(--shadow-card)]'
                  }`}
                >
                  <div className="text-[11px] font-semibold mb-1 opacity-80">
                    {isUser
                      ? chatLanguage === 'hi'
                        ? 'आप'
                        : 'You'
                      : chatLanguage === 'hi'
                        ? 'स्वास्थ्य सेतु AI'
                        : 'SwasthSetu AI'}
                  </div>

                  <div className="whitespace-pre-line leading-relaxed">{msg.text}</div>

                  <div
                    className={`mt-2.5 pt-2 border-t flex flex-wrap items-center justify-between gap-2 text-[11px] ${
                      isUser
                        ? 'border-white/20 text-blue-100'
                        : 'border-[var(--border-default)] text-[var(--text-muted)]'
                    }`}
                  >
                    <span className="tabular-nums">{msg.timestamp}</span>

                    {!isUser && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => playTTS(msg.id, msg.text, msg.language || chatLanguage)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                            isPlaying
                              ? 'bg-[var(--brand-teal-tint)] text-[var(--brand-teal)] border border-[var(--brand-teal-border)]'
                              : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
                          }`}
                        >
                          <Volume2 className="w-3 h-3" aria-hidden="true" />
                          <span>{isPlaying ? (chatLanguage === 'hi' ? 'रोकें' : 'Stop') : t('voiceOutputPlay')}</span>
                        </button>

                        {onOpenReportGeneratorWithText && !msg.id.startsWith('msg-welcome') && (
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onOpenReportGeneratorWithText(msg.text);
                            }}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-medium text-[var(--brand-primary)] hover:bg-[var(--brand-primary-tint)] transition-colors cursor-pointer"
                          >
                            <span>{t('convertReportBtn')}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {isUser && (
                  <div
                    className="w-7 h-7 rounded-md bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-default)] flex items-center justify-center shrink-0 mt-0.5"
                    aria-hidden="true"
                  >
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Subtle Typing / Loading Indicator */}
          {isLoading && (
            <div className="flex items-start gap-2.5" aria-label="Analyzing symptoms">
              <div
                className="w-7 h-7 rounded-md bg-[var(--brand-primary-tint)] text-[var(--brand-primary)] border border-[var(--brand-primary-border)] flex items-center justify-center shrink-0"
                aria-hidden="true"
              >
                <Stethoscope className="w-3.5 h-3.5" />
              </div>
              <div className="bg-white border border-[var(--border-default)] rounded-xl rounded-tl-xs px-4 py-3 text-xs text-[var(--text-secondary)] flex items-center gap-2.5 shadow-[var(--shadow-card)]">
                <span className="inline-flex items-center gap-1" aria-hidden="true">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-primary)] typing-dot" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-primary)] typing-dot" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-primary)] typing-dot" />
                </span>
                <span>
                  {chatLanguage === 'hi'
                    ? 'लक्षणों का विश्लेषण किया जा रहा है...'
                    : 'Evaluating symptoms and guidance...'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Suggested Prompts Chips */}
        <div className="px-4 py-2.5 bg-white border-t border-[var(--border-default)] flex items-center gap-1.5 overflow-x-auto">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(p.text)}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-md text-xs font-medium text-[var(--text-secondary)] bg-[var(--bg-canvas)] hover:bg-[var(--brand-primary-tint)] hover:text-[var(--brand-primary)] border border-[var(--border-default)] hover:border-[var(--brand-primary-border)] transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Active Voice Recording Notice */}
        {voiceState !== 'idle' && (
          <div className={`border-t px-4 py-2 flex items-center justify-between text-xs font-medium ${
            voiceState === 'listening'
              ? 'bg-[var(--status-danger-bg)] border-[var(--status-danger-border)] text-[var(--status-danger)]'
              : voiceState === 'recording_fallback'
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-blue-50 border-blue-200 text-blue-900'
          }`}>
            <div className="flex items-center gap-2">
              {voiceState === 'transcribing' ? (
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
              )}
              <span>
                {voiceState === 'listening'
                  ? (chatLanguage === 'hi'
                      ? 'वॉयस इनपुट सक्रिय है। कृपया स्पष्ट बोलें।'
                      : 'Live speech recognition active. Speak clearly into your microphone.')
                  : voiceState === 'recording_fallback'
                  ? (chatLanguage === 'hi'
                      ? 'ऑडियो रिकॉर्डिंग जारी है... समाप्त होने पर स्टॉप बटन दबाएं।'
                      : 'Recording audio... Click stop when finished to transcribe.')
                  : (chatLanguage === 'hi'
                      ? 'AI आवाज़ का विश्लेषण कर रहा है...'
                      : 'Transcribing speech with AI...')}
              </span>
            </div>
            {voiceState !== 'transcribing' && (
              <button
                type="button"
                onClick={handleToggleVoiceInput}
                className="px-2.5 py-1 rounded bg-white border border-current font-semibold cursor-pointer"
              >
                {t('voiceInputStop')}
              </button>
            )}
          </div>
        )}

        {/* Voice Error Notice */}
        {voiceError && (
          <div className="bg-amber-50 border-t border-amber-200 px-4 py-2 text-xs text-amber-900 flex items-center justify-between">
            <span className="line-clamp-2">{voiceError}</span>
            <button
              type="button"
              onClick={() => setVoiceError('')}
              className="ml-2 font-bold hover:underline shrink-0"
            >
              ✕
            </button>
          </div>
        )}

        {/* Input Form Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-2.5 sm:p-4 bg-white border-t border-[var(--border-default)] flex items-center gap-2 safe-area-pb"
        >
          <button
            type="button"
            onClick={handleToggleVoiceInput}
            disabled={voiceState === 'transcribing'}
            aria-label={voiceState !== 'idle' ? t('voiceInputStop') : t('voiceInputStart')}
            title={voiceState !== 'idle' ? t('voiceInputStop') : t('voiceInputStart')}
            className={`w-10 h-10 sm:w-auto sm:h-auto sm:p-2.5 rounded-lg sm:rounded-md border flex items-center justify-center transition-all active:scale-95 cursor-pointer shrink-0 ${
              voiceState === 'listening'
                ? 'bg-[var(--status-danger)] text-white border-[var(--status-danger)] animate-pulse'
                : voiceState === 'recording_fallback'
                ? 'bg-amber-600 text-white border-amber-600 animate-pulse'
                : voiceState === 'transcribing'
                ? 'bg-slate-100 text-[var(--text-muted)] border-[var(--border-default)] cursor-wait'
                : 'bg-[var(--bg-subtle)] text-[var(--text-primary)] border-[var(--border-strong)] hover:bg-slate-200/70'
            }`}
          >
            {voiceState === 'listening' ? (
              <MicOff className="w-5 h-5 sm:w-4 sm:h-4" aria-hidden="true" />
            ) : voiceState === 'recording_fallback' ? (
              <Square className="w-4 h-4 fill-current" aria-hidden="true" />
            ) : voiceState === 'transcribing' ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Mic className="w-5 h-5 sm:w-4 sm:h-4" aria-hidden="true" />
            )}
          </button>

          <label htmlFor="symptom-chat-input" className="sr-only">
            {t('chatPlaceholder')}
          </label>
          <input
            id="symptom-chat-input"
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              chatLanguage === 'hi'
                ? 'लक्षण लिखें या बोलें...'
                : 'Describe symptoms or speak...'
            }
            disabled={isLoading}
            className="flex-1 px-3 sm:px-3.5 py-2.5 bg-[var(--bg-canvas)] border border-[var(--border-strong)] rounded-lg sm:rounded-md text-base sm:text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:bg-white focus:border-[var(--brand-primary)] transition-colors disabled:opacity-60"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            aria-label="Send message"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2.5 rounded-lg sm:rounded-md text-sm font-semibold text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">{chatLanguage === 'hi' ? 'भेजें' : 'Send'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
