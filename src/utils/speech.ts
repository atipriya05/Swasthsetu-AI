// Speech Synthesis (TTS), Recognition (STT), and Audio Recording Utilities for SwasthSetu AI

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

// Helper to translate speech recognition errors into actionable messages
export function formatSpeechError(error: string, lang: string = 'en'): string {
  const isHi = lang === 'hi';
  switch (error) {
    case 'not-allowed':
    case 'permission-denied':
      return isHi
        ? 'माइक्रोफ़ोन अनुमति अवरुद्ध है। कृपया ब्राउज़र के एड्रेस बार में लॉक/सेटिंग्स आइकन पर क्लिक करके माइक्रोफ़ोन की अनुमति दें।'
        : 'Microphone permission blocked. Please click the lock or settings icon in your browser address bar to allow microphone access.';
    case 'no-speech':
      return isHi
        ? 'कोई आवाज़ सुनाई नहीं दी। कृपया माइक्रोफ़ोन के पास आकर पुनः बोलें।'
        : 'No speech was detected. Please speak closer to your microphone and try again.';
    case 'audio-capture':
      return isHi
        ? 'माइक्रोफ़ोन उपकरण नहीं मिला। कृपया सुनिश्चित करें कि माइक्रोफ़ोन कनेक्टेड है।'
        : 'No microphone found. Please ensure a microphone is connected to your device.';
    case 'network':
      return isHi
        ? 'ब्राउज़र स्पीच सेवा अनुपलब्ध है। ऑडियो रिकॉर्डिंग मोड का उपयोग किया जा रहा है...'
        : 'Browser speech recognition network service is unavailable. Switching to audio recording fallback...';
    case 'aborted':
      return isHi ? 'वॉयस इनपुट रोक दिया गया।' : 'Voice input cancelled.';
    default:
      return isHi
        ? `वॉयस इनपुट त्रुटि: ${error}। कृपया पुनः प्रयास करें।`
        : `Voice input error: ${error}. Please try again.`;
  }
}

// Web Speech Recognition Helper (Chrome / Edge / Safari)
export class SpeechRecognitionService {
  private static recognition: any = null;
  private static isListening = false;

  public static isSupported(): boolean {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }

  public static async requestMicPermission(): Promise<{ granted: boolean; error?: string }> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return { granted: false, error: 'Media devices API not available in this browser.' };
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop all tracks immediately so mic is freed for recognition
      stream.getTracks().forEach((track) => track.stop());
      return { granted: true };
    } catch (err: any) {
      const name = err.name || '';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        return {
          granted: false,
          error: 'not-allowed'
        };
      }
      if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
        return {
          granted: false,
          error: 'audio-capture'
        };
      }
      return { granted: false, error: err.message || 'permission-error' };
    }
  }

  public static async startListening(
    language: string = 'en',
    onTranscript: (transcript: string, isFinal: boolean) => void,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (err: string, rawCode?: string) => void
  ): Promise<boolean> {
    if (!SpeechRecognitionService.isSupported()) {
      if (onError) {
        onError(
          formatSpeechError('network', language),
          'not-supported'
        );
      }
      return false;
    }

    SpeechRecognitionService.stopListening();
    // Allow brief micro-delay for audio subsystem to fully release before re-initializing
    await new Promise((r) => setTimeout(r, 60));

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

        for (let i = 0; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const text = (finalTranscript + interimTranscript).trim();
        if (text) {
          onTranscript(text, Boolean(finalTranscript.trim()));
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error event:', event.error);
        if (event.error === 'aborted') {
          return;
        }
        if (onError) {
          onError(formatSpeechError(event.error, language), event.error);
        }
      };

      recognition.onend = () => {
        SpeechRecognitionService.isListening = false;
        if (onEnd) onEnd();
      };

      recognition.start();
      return true;
    } catch (e: any) {
      console.error('Failed to start speech recognition:', e);
      if (onError) {
        onError(formatSpeechError(e.message || 'initialization-failed', language), 'error');
      }
      return false;
    }
  }

  public static stopListening(): void {
    if (SpeechRecognitionService.recognition) {
      const rec = SpeechRecognitionService.recognition;
      SpeechRecognitionService.recognition = null;
      SpeechRecognitionService.isListening = false;
      try {
        rec.onresult = null;
        rec.onerror = null;
        rec.onend = null;
        rec.stop();
      } catch {
        try {
          rec.abort();
        } catch {}
      }
    }
  }

  public static getIsListening(): boolean {
    return SpeechRecognitionService.isListening;
  }
}

// MediaRecorder Audio Service for cross-browser fallback (Opera / Firefox / Brave / WebViews)
export class AudioRecordingService {
  private static mediaRecorder: MediaRecorder | null = null;
  private static audioChunks: Blob[] = [];
  private static mediaStream: MediaStream | null = null;
  private static isRecording = false;

  public static isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      typeof navigator !== 'undefined' &&
      Boolean(navigator.mediaDevices?.getUserMedia) &&
      typeof MediaRecorder !== 'undefined'
    );
  }

  public static async startRecording(
    onStart?: () => void,
    onError?: (err: string) => void
  ): Promise<boolean> {
    if (!AudioRecordingService.isSupported()) {
      if (onError) onError('Audio recording is not supported in this browser.');
      return false;
    }

    AudioRecordingService.stopRecording();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      AudioRecordingService.mediaStream = stream;
      AudioRecordingService.audioChunks = [];

      // Determine best supported mime type
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg;codecs=opus',
        'audio/wav'
      ];
      let selectedMime = '';
      for (const m of mimeTypes) {
        if (MediaRecorder.isTypeSupported(m)) {
          selectedMime = m;
          break;
        }
      }

      const options = selectedMime ? { mimeType: selectedMime } : undefined;
      const recorder = new MediaRecorder(stream, options);
      AudioRecordingService.mediaRecorder = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          AudioRecordingService.audioChunks.push(event.data);
        }
      };

      recorder.start(250); // Slice chunks every 250ms
      AudioRecordingService.isRecording = true;
      if (onStart) onStart();
      return true;
    } catch (err: any) {
      console.error('Failed to start audio recording:', err);
      const name = err.name || '';
      let msg = 'Could not access microphone.';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        msg = 'Microphone permission denied. Please allow microphone access in your browser.';
      } else if (name === 'NotFoundError') {
        msg = 'No microphone device found on your system.';
      }
      if (onError) onError(msg);
      return false;
    }
  }

  public static stopRecording(): Promise<{ blob: Blob; mimeType: string } | null> {
    return new Promise((resolve) => {
      const recorder = AudioRecordingService.mediaRecorder;
      if (!recorder || recorder.state === 'inactive') {
        AudioRecordingService.cleanupStream();
        resolve(null);
        return;
      }

      recorder.onstop = () => {
        const mimeType = recorder.mimeType || 'audio/webm';
        const blob = new Blob(AudioRecordingService.audioChunks, { type: mimeType });
        AudioRecordingService.audioChunks = [];
        AudioRecordingService.cleanupStream();
        AudioRecordingService.isRecording = false;
        resolve({ blob, mimeType });
      };

      try {
        recorder.stop();
      } catch {
        AudioRecordingService.cleanupStream();
        resolve(null);
      }
    });
  }

  private static cleanupStream(): void {
    if (AudioRecordingService.mediaStream) {
      AudioRecordingService.mediaStream.getTracks().forEach((track) => track.stop());
      AudioRecordingService.mediaStream = null;
    }
    AudioRecordingService.mediaRecorder = null;
    AudioRecordingService.isRecording = false;
  }

  public static getIsRecording(): boolean {
    return AudioRecordingService.isRecording;
  }
}

// Convert Blob to Base64 string (without the data: prefix)
export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Unified Voice Input: Tries Web Speech API first, falls back to MediaRecorder + Gemini
export interface UnifiedVoiceOptions {
  language: string;
  onTranscript: (transcript: string) => void;
  onStateChange: (state: 'idle' | 'listening' | 'recording_fallback' | 'transcribing') => void;
  onError: (message: string) => void;
}

export class UnifiedVoiceInput {
  private static activeMode: 'recognition' | 'recorder' | 'none' = 'none';

  public static async start(options: UnifiedVoiceOptions): Promise<void> {
    await UnifiedVoiceInput.stop();

    // 1. Try Web Speech API first if supported
    if (SpeechRecognitionService.isSupported()) {
      let speechApiFailed = false;

      const started = await SpeechRecognitionService.startListening(
        options.language,
        (transcript) => {
          options.onTranscript(transcript);
        },
        () => {
          UnifiedVoiceInput.activeMode = 'recognition';
          options.onStateChange('listening');
        },
        () => {
          if (UnifiedVoiceInput.activeMode === 'recognition') {
            UnifiedVoiceInput.activeMode = 'none';
            options.onStateChange('idle');
          }
        },
        async (errorMessage, rawCode) => {
          // If Web Speech API fails due to network / service-not-allowed / not-supported / audio-capture, fallback to MediaRecorder
          if (
            rawCode === 'network' ||
            rawCode === 'not-supported' ||
            rawCode === 'service-not-allowed' ||
            rawCode === 'audio-capture' ||
            rawCode === 'initialization-failed'
          ) {
            speechApiFailed = true;
            SpeechRecognitionService.stopListening();
            await UnifiedVoiceInput.startFallbackRecorder(options);
          } else {
            UnifiedVoiceInput.activeMode = 'none';
            options.onStateChange('idle');
            options.onError(errorMessage);
          }
        }
      );

      if (started) return;
      if (speechApiFailed) return;
    }

    // 2. Fallback to MediaRecorder
    await UnifiedVoiceInput.startFallbackRecorder(options);
  }

  private static async startFallbackRecorder(options: UnifiedVoiceOptions): Promise<void> {
    if (!AudioRecordingService.isSupported()) {
      options.onStateChange('idle');
      options.onError(
        options.language === 'hi'
          ? 'आपका ब्राउज़र वॉयस इनपुट का समर्थन नहीं करता है। कृपया Google Chrome अथवा Microsoft Edge का उपयोग करें।'
          : 'Voice input is not supported in this browser. Please use Google Chrome or Microsoft Edge.'
      );
      return;
    }

    const started = await AudioRecordingService.startRecording(
      () => {
        UnifiedVoiceInput.activeMode = 'recorder';
        options.onStateChange('recording_fallback');
      },
      (err) => {
        UnifiedVoiceInput.activeMode = 'none';
        options.onStateChange('idle');
        options.onError(err);
      }
    );

    if (!started) {
      UnifiedVoiceInput.activeMode = 'none';
      options.onStateChange('idle');
    }
  }

  public static async stop(options?: UnifiedVoiceOptions): Promise<void> {
    if (UnifiedVoiceInput.activeMode === 'recognition') {
      SpeechRecognitionService.stopListening();
      UnifiedVoiceInput.activeMode = 'none';
      if (options) options.onStateChange('idle');
      return;
    }

    if (UnifiedVoiceInput.activeMode === 'recorder') {
      if (options) options.onStateChange('transcribing');
      const audioResult = await AudioRecordingService.stopRecording();
      UnifiedVoiceInput.activeMode = 'none';

      if (!audioResult || !options) {
        if (options) options.onStateChange('idle');
        return;
      }

      try {
        const base64 = await blobToBase64(audioResult.blob);
        const res = await fetch('/api/gemini/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audioBase64: base64,
            mimeType: audioResult.mimeType,
            language: options.language
          })
        });

        const data = await res.json();
        if (res.ok && data.transcript) {
          options.onTranscript(data.transcript);
        } else if (data.noKey) {
          options.onError(
            options.language === 'hi'
              ? 'ऑडियो रिकॉर्ड हो गया, परंतु सर्वर पर GEMINI_API_KEY सेट नहीं है। कृपया .env में API कुंजी जोड़ें या Google Chrome का उपयोग करें।'
              : 'Audio recorded, but GEMINI_API_KEY is not configured in .env for audio transcription. You can also use Chrome/Edge for built-in recognition.'
          );
        } else {
          options.onError(data.error || 'Audio transcription failed');
        }
      } catch (err: any) {
        options.onError(err.message || 'Failed to send audio for transcription');
      } finally {
        options.onStateChange('idle');
      }
      return;
    }

    SpeechRecognitionService.stopListening();
    AudioRecordingService.stopRecording();
    UnifiedVoiceInput.activeMode = 'none';
    if (options) options.onStateChange('idle');
  }

  public static getMode(): 'recognition' | 'recorder' | 'none' {
    return UnifiedVoiceInput.activeMode;
  }
}
