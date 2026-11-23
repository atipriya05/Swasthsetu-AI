// Speech Synthesis (TTS) & Recognition (STT) Utilities for SwasthSetu AI

export interface SpeechRecognitionHookOptions {
  language: string;
  onResult: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

// Map app language code to BCP-47 locale tag
export function getLanguageLocale(lang: string): string {
  const normalized = (lang || '').toLowerCase().trim();
  switch (normalized) {
    case 'hi':
    case 'hindi':
      return 'hi-IN';
    case 'bn':
    case 'bengali':
      return 'bn-IN';
    case 'ta':
    case 'tamil':
      return 'ta-IN';
    case 'te':
    case 'telugu':
      return 'te-IN';
    case 'gu':
    case 'gujarati':
      return 'gu-IN';
    case 'kn':
    case 'kannada':
      return 'kn-IN';
    case 'ml':
    case 'malayalam':
      return 'ml-IN';
    case 'pa':
    case 'punjabi':
      return 'pa-IN';
    case 'or':
    case 'odia':
      return 'or-IN';
    case 'ur':
    case 'urdu':
      return 'ur-IN';
    case 'es':
    case 'spanish':
      return 'es-ES';
    case 'fr':
    case 'french':
      return 'fr-FR';
    case 'ar':
    case 'arabic':
      return 'ar-SA';
    case 'en':
    case 'english':
    default:
      return 'en-IN';
  }
}

// Text-to-Speech (TTS) Speaker Helper
export class SpeechService {
  private static isSpeaking = false;

  public static speak(
    text: string,
    language: string = 'en',
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (e: unknown) => void
  ): boolean {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in this browser.');
      if (onError) onError('Speech synthesis not supported');
      return false;
    }

    window.speechSynthesis.cancel();

    const cleanText = text
      .replace(/[*#_`~]/g, '')
      .replace(/•/g, ', ')
      .trim();

    if (!cleanText) return false;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const locale = getLanguageLocale(language);
    utterance.lang = locale;
    utterance.rate = language === 'hi' ? 0.95 : 1.0;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find(
      (v) =>
        v.lang === locale ||
        v.lang.startsWith(language) ||
        v.lang.startsWith(locale.split('-')[0])
    );
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onstart = () => {
      SpeechService.isSpeaking = true;
      if (onStart) onStart();
    };

    utterance.onend = () => {
      SpeechService.isSpeaking = false;
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      SpeechService.isSpeaking = false;
      if (onError) onError(e);
    };

    window.speechSynthesis.speak(utterance);
    return true;
  }

  public static stop(): void {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      SpeechService.isSpeaking = false;
    }
  }

  public static isSupported(): boolean {
    return 'speechSynthesis' in window;
  }
}

// Web Speech Recognition Helper
export class SpeechRecognitionService {
  private static recognition: any = null;
  private static isListening = false;

  public static isSupported(): boolean {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }

  public static startListening(
    language: string = 'en',
    onTranscript: (transcript: string, isFinal: boolean) => void,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (err: string) => void
  ): boolean {
    if (!SpeechRecognitionService.isSupported()) {
      if (onError) onError('Speech recognition is not supported in this browser.');
      return false;
    }

    SpeechRecognitionService.stopListening();

    try {
      const SpeechRecognitionClass =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognitionClass();
      SpeechRecognitionService.recognition = recognition;

      recognition.lang = getLanguageLocale(language);
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        SpeechRecognitionService.isListening = true;
        if (onStart) onStart();
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const text = finalTranscript || interimTranscript;
        if (text) {
          onTranscript(text, !!finalTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition event error:', event.error);
        if (onError) onError(event.error);
      };

      recognition.onend = () => {
        SpeechRecognitionService.isListening = false;
        if (onEnd) onEnd();
      };

      recognition.start();
      return true;
    } catch (e: any) {
      console.error('Failed to start speech recognition:', e);
      if (onError) onError(e.message || 'Speech recognition initialization failed');
      return false;
    }
  }

  public static stopListening(): void {
    if (SpeechRecognitionService.recognition) {
      try {
        SpeechRecognitionService.recognition.stop();
      } catch {
        // Ignore if already stopped
      }
      SpeechRecognitionService.recognition = null;
      SpeechRecognitionService.isListening = false;
    }
  }
}
