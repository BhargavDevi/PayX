import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Mic, MicOff } from "lucide-react";
import { voiceAssistant } from "@/lib/voice";
import { useToast } from "@/hooks/use-toast";

export function VoiceAssistant() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    setIsSupported(voiceAssistant.isSupported());
    
    if (voiceAssistant.isSupported()) {
      // Register voice commands
      voiceAssistant.addCommand({
        command: 'showBalance',
        patterns: [
          /show.*balance/i,
          /my.*balance/i,
          /account.*balance/i,
          /check.*balance/i
        ],
        action: () => {
          setLocation('/dashboard');
          setIsOpen(false);
          toast({
            title: "Voice Command",
            description: "Navigating to your account balance",
          });
        }
      });

      voiceAssistant.addCommand({
        command: 'makePayment',
        patterns: [
          /make.*payment/i,
          /send.*money/i,
          /transfer.*money/i,
          /pay.*someone/i
        ],
        action: () => {
          setLocation('/payments');
          setIsOpen(false);
          toast({
            title: "Voice Command",
            description: "Navigating to payments",
          });
        }
      });

      voiceAssistant.addCommand({
        command: 'showHistory',
        patterns: [
          /show.*history/i,
          /transaction.*history/i,
          /my.*transactions/i,
          /payment.*history/i
        ],
        action: () => {
          setLocation('/history');
          setIsOpen(false);
          toast({
            title: "Voice Command",
            description: "Navigating to transaction history",
          });
        }
      });

      voiceAssistant.addCommand({
        command: 'goHome',
        patterns: [
          /go.*home/i,
          /navigate.*home/i,
          /home.*page/i,
          /main.*page/i
        ],
        action: () => {
          setLocation('/');
          setIsOpen(false);
          toast({
            title: "Voice Command",
            description: "Navigating to home page",
          });
        }
      });
    }

    return () => {
      voiceAssistant.stopListening();
    };
  }, [setLocation, toast]);

  const handleStartListening = () => {
    if (voiceAssistant.startListening()) {
      setIsListening(true);
    } else {
      toast({
        title: "Error",
        description: "Could not start voice recognition",
        variant: "destructive",
      });
    }
  };

  const handleStopListening = () => {
    voiceAssistant.stopListening();
    setIsListening(false);
  };

  const handleOpenVoice = () => {
    setIsOpen(true);
    handleStartListening();
  };

  const handleCloseVoice = () => {
    handleStopListening();
    setIsOpen(false);
  };

  if (!isSupported) {
    return null;
  }

  return (
    <>
      <Button
        onClick={handleOpenVoice}
        className="bg-accent text-accent-foreground p-2 rounded-full hover:opacity-80"
        size="icon"
        data-testid="button-voice-assistant"
      >
        <Mic className="h-4 w-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              {t("voice.title")}
            </DialogTitle>
            <DialogDescription className="text-center">
              {t("voice.listening")}
            </DialogDescription>
          </DialogHeader>
          
          <div className="text-center py-6">
            <div className={`w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4 ${isListening ? 'voice-pulse' : ''}`}>
              {isListening ? (
                <Mic className="text-accent-foreground text-2xl" />
              ) : (
                <MicOff className="text-accent-foreground text-2xl" />
              )}
            </div>
            
            <div className="flex space-x-4 justify-center">
              {isListening ? (
                <Button
                  onClick={handleStopListening}
                  variant="destructive"
                  data-testid="button-stop-listening"
                >
                  {t("voice.stop")}
                </Button>
              ) : (
                <Button
                  onClick={handleStartListening}
                  variant="default"
                  data-testid="button-start-listening"
                >
                  Start Listening
                </Button>
              )}
              <Button
                onClick={handleCloseVoice}
                variant="secondary"
                data-testid="button-close-voice"
              >
                {t("voice.close")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
