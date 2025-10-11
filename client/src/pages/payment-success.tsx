import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import confetti from 'canvas-confetti';

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();
  const [redirectCount, setRedirectCount] = useState(5);

  useEffect(() => {
    // Trigger confetti celebration
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#1e40af', '#059669', '#dc2626']
    });

    // Countdown and redirect
    const timer = setInterval(() => {
      setRedirectCount((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setLocation('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="max-w-md mx-auto px-4">
        <Card className="text-center">
          <CardHeader>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-2xl text-green-600 mb-2">
              Payment Successful!
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Thank you for your purchase! Your Life in UK test preparation package is now active.
            </p>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-700">
                You now have full access to all features in your selected plan. Start your preparation journey today!
              </p>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={() => setLocation('/dashboard')}
                className="w-full bg-uk-blue hover:bg-uk-blue/90"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              
              <p className="text-xs text-gray-500">
                Redirecting automatically in {redirectCount} seconds...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}