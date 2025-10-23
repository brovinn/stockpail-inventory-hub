import { useState, useEffect } from 'react';
import { Download, Smartphone, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function Install() {
  const { toast } = useToast();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for the beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      toast({
        title: 'Already Installed',
        description: 'This app is already installed or cannot be installed on this device',
      });
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
      toast({
        title: 'Success!',
        description: 'App installed successfully',
      });
    }

    setDeferredPrompt(null);
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Install App</h1>
        <p className="text-muted-foreground">
          Install StockPail as a native app on your device
        </p>
      </div>

      <Card className="bg-gradient-card shadow-professional-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Progressive Web App
          </CardTitle>
          <CardDescription>
            Install this app on your device for a native app experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isInstalled ? (
            <div className="text-center py-8 space-y-4">
              <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
              <div>
                <h3 className="text-xl font-semibold">App Installed!</h3>
                <p className="text-muted-foreground mt-2">
                  You can now use StockPail from your home screen
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <h3 className="font-semibold">Benefits of Installing:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                    <span>Works offline - access your inventory anytime</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                    <span>Faster performance with native app feel</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                    <span>Home screen icon for quick access</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                    <span>No app store required - install directly</span>
                  </li>
                </ul>
              </div>

              <Button 
                onClick={handleInstallClick} 
                size="lg" 
                className="w-full"
                disabled={!deferredPrompt}
              >
                <Download className="h-5 w-5 mr-2" />
                Install App on This Device
              </Button>

              {!deferredPrompt && (
                <div className="bg-muted p-4 rounded-lg text-sm">
                  <p className="font-semibold mb-2">Manual Installation:</p>
                  <div className="space-y-2 text-muted-foreground">
                    <p><strong>iOS/Safari:</strong> Tap the Share button, then "Add to Home Screen"</p>
                    <p><strong>Android/Chrome:</strong> Tap the menu (⋮), then "Install app" or "Add to Home screen"</p>
                    <p><strong>Desktop:</strong> Look for the install icon in your browser's address bar</p>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card className="bg-gradient-card shadow-professional-md">
        <CardHeader>
          <CardTitle className="text-base">How to Save Documents Locally</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• <strong>SQL Designer:</strong> Click "Save SQL Locally" to download database designs</p>
          <p>• <strong>Spreadsheets:</strong> Use "Save as CSV" or "Save as Excel" buttons</p>
          <p>• <strong>Documents:</strong> Edit and save as TXT, DOC, or HTML/PDF formats</p>
          <p>• All files are saved directly to your device's Downloads folder</p>
        </CardContent>
      </Card>
    </div>
  );
}
