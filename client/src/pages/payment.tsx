import { useState, useEffect } from 'react';
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Star, Users, FileText, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const PaymentForm = ({ selectedPlan, onBack }: { selectedPlan: any, onBack: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    if (!stripe || !elements) {
      setIsProcessing(false);
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success`,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: `Welcome to ${selectedPlan.name}! You now have access to all features.`,
      });
    }
    setIsProcessing(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Plans
        </Button>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {selectedPlan.name}
              <Badge variant="secondary">£{selectedPlan.price}</Badge>
            </CardTitle>
            <CardDescription>{selectedPlan.description}</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Complete Your Payment</CardTitle>
          <CardDescription>
            Enter your payment details to get started with {selectedPlan.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement />
            <Button 
              type="submit" 
              className="w-full" 
              disabled={!stripe || isProcessing}
            >
              {isProcessing ? 'Processing...' : `Pay £${selectedPlan.price}`}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default function Payment() {
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [clientSecret, setClientSecret] = useState("");
  const { toast } = useToast();

  const plans = [
    {
      id: 'basic',
      name: 'Learning App Access',
      price: 60,
      description: 'One-off payment for 3 months complete access to all learning features',
      features: [
        '3 months full platform access',
        'One-time payment - no recurring charges',
        'Unlimited access to all video modules',
        'Interactive matching games with all difficulty levels',
        'Practice tests and mock exams',
        'Historical timeline explorer',
        'Downloadable study materials',
        'Progress tracking and statistics',
        'Mobile-friendly interface',
        'Perfect for 1-month intensive study preparation'
      ],
      icon: <Star className="w-6 h-6" />,
      color: 'from-blue-500 to-blue-600',
      isOneTime: true,
      duration: '3 months'
    },
    {
      id: 'group',
      name: 'Group Video Sessions',
      price: 80,
      description: 'Group video calls with specialist for test preparation and learning support',
      features: [
        'Everything in Learning App Access',
        'Live group video sessions with UK test specialist',
        'Interactive Q&A sessions',
        'Test-taking strategies and tips',
        'Group study coordination',
        'Weekly practice sessions',
        'Expert clarification on difficult topics'
      ],
      icon: <Users className="w-6 h-6" />,
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'guidance',
      name: 'Citizenship Application Guidance',
      price: 30,
      description: 'Step-by-step guidance for completing your UK citizenship application form',
      features: [
        'Complete application form walkthrough',
        'Document preparation checklist',
        'Form completion assistance',
        'Common mistakes prevention',
        'Application timeline guidance',
        'Required documents explanation',
        'Direct support for application questions'
      ],
      icon: <FileText className="w-6 h-6" />,
      color: 'from-purple-500 to-purple-600'
    }
  ];

  useEffect(() => {
    if (selectedPlan) {
      // Create payment intent when plan is selected
      apiRequest("POST", "/api/create-payment-intent", { 
        amount: selectedPlan.price,
        planType: selectedPlan.id 
      })
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: "Failed to initialize payment. Please try again.",
          variant: "destructive",
        });
        console.error('Payment initialization error:', error);
      });
    }
  }, [selectedPlan, toast]);

  if (selectedPlan && clientSecret) {
    return (
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <PaymentForm selectedPlan={selectedPlan} onBack={() => setSelectedPlan(null)} />
      </Elements>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Choose Your Life in UK Test Package
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
            Select the perfect package to help you succeed in your UK citizenship test preparation
          </p>
          <div className="inline-flex items-center bg-green-50 border border-green-200 rounded-lg px-4 py-2">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-sm text-green-700">
              <strong>Learning App Access:</strong> One-time payment gives you 3 months complete access - perfect timing for 1 month intensive study preparation
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className="relative overflow-hidden border-2 hover:border-uk-blue/50 transition-all duration-300 hover:shadow-lg"
            >
              <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${plan.color}`} />
              
              <CardHeader className="text-center pb-4">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center text-white`}>
                  {plan.icon}
                </div>
                <CardTitle className="text-xl mb-2">{plan.name}</CardTitle>
                <div className="text-3xl font-bold text-uk-blue mb-2">
                  {plan.isOneTime && (
                    <div className="text-sm font-normal text-green-600 mt-1">
                      One-time payment
                    </div>
                  )}
                  {plan.duration && (
                    <div className="text-sm font-normal text-gray-500 mt-1">
                      {plan.duration} access
                    </div>
                  )}
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  onClick={() => setSelectedPlan(plan)}
                  className="w-full bg-uk-blue hover:bg-uk-blue/90"
                >
                  Choose {plan.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <div className="inline-flex items-center space-x-2 text-sm text-gray-500">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Secure payment processing with Stripe</span>
          </div>
          <div className="mt-2">
            <Link href="/dashboard">
              <Button variant="ghost" className="text-uk-blue">
                Return to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}