import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { LanguageSelectionProvider } from "@/contexts/LanguageSelectionContext";
import { VoterProvider } from "@/contexts/VoterContext";
import DigitalVerifyPage from "./pages/DigitalVerifyPage";
import ManualVerifyPage from "./pages/ManualVerifyPage";
import TokenCheckPage from "./pages/TokenCheckPage";

const queryClient = new QueryClient();

const getAppMode = (): 'digital' | 'manual' | 'token' => {
  const mode = import.meta.env.VITE_APP_MODE;
  if (mode !== 'digital' && mode !== 'manual' && mode !== 'token') {
    console.error(
      `Invalid VITE_APP_MODE: ${mode}. Must be 'digital', 'manual', or 'token'. Defaulting to 'digital'.`
    );
    return 'digital';
  }
  return mode;
};

const App = () => {
  const appMode = getAppMode();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <LanguageProvider>
          <LanguageSelectionProvider>
            <VoterProvider>
              {appMode === 'digital' && <DigitalVerifyPage />}
              {appMode === 'manual' && <ManualVerifyPage />}
              {appMode === 'token' && <TokenCheckPage />}
            </VoterProvider>
          </LanguageSelectionProvider>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
