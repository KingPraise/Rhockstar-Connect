with open("src/app/(dashboard)/employer/ads/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import re

if "useFlutterwave" not in content:
    content = content.replace('import { toast } from "react-hot-toast";', 'import { toast } from "react-hot-toast";\nimport { useFlutterwave, closePaymentModal } from "flutterwave-react-v3";')

# Inject AdPaymentButton before EmployerAdsPage
ad_button = """
const AdPaymentButton = ({ ad, profile, onComplete }: any) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const config = {
    public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY || 'FLWPUBK_TEST-78ba9038855272bdb48441ac8989d5aa-X',
    tx_ref: `rhockstar_ad_${ad.id}_${Date.now()}`,
    amount: ad.price || 15000,
    currency: 'NGN',
    payment_options: 'card,mobilemoney,ussd',
    customer: {
      email: profile?.email || 'user@rhockstar.com',
      phone_number: profile?.phone || '',
      name: profile?.fullName || profile?.username || 'Rhockstar User',
    },
    customizations: {
      title: `Rhockstar Ad Payment`,
      description: `Payment for Ad "${ad.title}"`,
      logo: typeof window !== 'undefined' ? `${window.location.origin}/icon.png` : '',
    },
  };

  const handleFlutterPayment = useFlutterwave(config);

  const handlePayment = () => {
    setIsProcessing(true);
    handleFlutterPayment({
      callback: async (response) => {
        if (response.status === 'successful' || response.status === 'completed') {
          try {
            const { auth } = await import('@/lib/firebase');
            const token = await auth.currentUser?.getIdToken();
            const res = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ transaction_id: response.transaction_id, type: 'ad', adId: ad.id })
            });
            const data = await res.json();
            if (data.success) {
              toast.success(`Payment confirmed! Advert "${ad.title}" is now LIVE!`);
              onComplete();
            } else {
              toast.error(data.error || "Payment verification failed.");
            }
          } catch (err) {
            toast.error("Error verifying payment.");
          }
        } else {
          toast.error("Payment failed or was cancelled.");
        }
        setIsProcessing(false);
        closePaymentModal();
      },
      onClose: () => {
        setIsProcessing(false);
      },
    });
  };

  return (
    <button
      onClick={handlePayment}
      disabled={isProcessing}
      className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 border border-blue-500/30 disabled:opacity-50"
    >
      {isProcessing ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          <CreditCard className="w-4 h-4" />
          Pay ₦{(ad.price || 15000).toLocaleString()} to Activate
        </>
      )}
    </button>
  );
};
"""

content = content.replace("export default function EmployerAdsPage() {", ad_button + "\nexport default function EmployerAdsPage() {")

# Remove old handleSimulatePayment
old_sim = """  const handleSimulatePayment = async (ad: Advertisement) => {
    try {
      setPayingAdId(ad.id);
      // Simulate Paystack / Flutterwave success callback
      const res = await confirmAdPayment(ad.id);
      if (res.success) {
        toast.success(`Payment confirmed! Advert "${ad.title}" is now LIVE in the Feed! dYs?`);
      } else {
        toast.error("Failed to confirm payment");
      }
    } catch (err) {
      toast.error("Payment confirmation error");
    } finally {
      setPayingAdId(null);
    }
  };"""
content = content.replace(old_sim, "")

# Find the button JSX and replace
old_button = """                    {/* Status specific actions */}
                    {ad.status === 'approved' && (
                      <button
                        onClick={() => handleSimulatePayment(ad)}
                        disabled={payingAdId === ad.id}
                        className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 border border-blue-500/30 disabled:opacity-50"
                      >
                        {payingAdId === ad.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4" />
                            Pay ,{(ad.price || 15000).toLocaleString()} to Activate
                          </>
                        )}
                      </button>
                    )}"""

new_button = """                    {/* Status specific actions */}
                    {ad.status === 'approved' && (
                      <AdPaymentButton ad={ad} profile={profile} onComplete={() => setPayingAdId(null)} />
                    )}"""

# We might have encoding issues with the Naira symbol, so we'll use a regex for the button replacement
import re
pattern = re.compile(r'\{/\*\s*Status specific actions\s*\*/\}.*?\{ad\.status === \'approved\' && \(\s*<button.*?Pay.*?to Activate.*?</>\s*\)\}\s*</button>\s*\)\}', re.DOTALL)
content = pattern.sub(new_button, content)

with open("src/app/(dashboard)/employer/ads/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
