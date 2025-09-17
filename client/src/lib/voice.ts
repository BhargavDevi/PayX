// Type declarations for SpeechRecognition API
declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
}

export interface VoiceCommand {
  command: string;
  action: () => void;
  patterns: RegExp[];
}

export class VoiceAssistant {
  private recognition: SpeechRecognition | null = null;
  private isListening: boolean = false;
  private commands: VoiceCommand[] = [];

  constructor() {
    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
      const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognitionConstructor) {
        this.recognition = new SpeechRecognitionConstructor();
        this.setupRecognition();
      }
    }
  }

  private setupRecognition() {
    if (!this.recognition) return;

    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event) => {
      const lastResult = event.results[event.results.length - 1];
      if (lastResult.isFinal) {
        const transcript = lastResult[0].transcript.toLowerCase().trim();
        this.processCommand(transcript);
      }
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      this.isListening = false;
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };
  }

  public addCommand(command: VoiceCommand) {
    this.commands.push(command);
  }

  public removeCommand(commandName: string) {
    this.commands = this.commands.filter(cmd => cmd.command !== commandName);
  }

  private processCommand(transcript: string) {
    console.log('Processing voice command:', transcript);
    
    for (const command of this.commands) {
      for (const pattern of command.patterns) {
        if (pattern.test(transcript)) {
          console.log('Executing command:', command.command);
          command.action();
          return;
        }
      }
    }
    
    console.log('No matching command found for:', transcript);
  }

  public startListening(): boolean {
    if (!this.recognition) {
      console.warn('Speech recognition not supported');
      return false;
    }

    if (this.isListening) return true;

    try {
      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      return false;
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  public isSupported(): boolean {
    return this.recognition !== null;
  }

  public getIsListening(): boolean {
    return this.isListening;
  }
}

export const voiceAssistant = new VoiceAssistant();
