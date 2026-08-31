import os

with open('src/app/(dashboard)/premium/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add imports
imports = """import { Check, Crown, Star, Shield, Zap, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';"""

content = content.replace(
    'import { Check, Crown, Star, Shield, Zap, Loader2, Sparkles } from "lucide-react";\nimport { useState } from "react";\nimport { useAuthStore } from "@/store/useAuthStore";\nimport { useRouter } from "next/navigation";\nimport toast from "react-hot-toast";',
    imports
)

# Add PaymentButton component before PremiumPage
payment_btn_code = """
const PaymentButton = ({ tier, profile, currency, formatPrice, onSuccess, disabled, className, children }: any) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const baseUSD = tier === 'pro' ? 2 : 5;
  const curr = (useCurrencyStore.getState() as any).CURRENCIES[currency] || { rateFromUSD: 1 };
  const amount = baseUSD * curr.rateFromUSD;

  const config = {
    public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY || 'FLWPUBK_TEST-78ba9038855272bdb48441ac8989d5aa-X',
    tx_ref: `rhockstar_${tier}_${Date.now()}`,
    amount: amount,
    currency: currency,
    payment_options: 'card,mobilemoney,ussd',
    customer: {
      email: profile?.email || 'user@rhockstar.com',
      phone_number: profile?.phone || '',
      name: profile?.fullName || profile?.username || 'Rhockstar User',
    },
    customizations: {
      title: `Rhockstar Connect ${tier.toUpperCase()}`,
      description: `Payment for ${tier.toUpperCase()} membership`,
      logo: typeof window !== 'undefined' ? `${window.location.origin}/icon.png` : '',
    },
  };

  const handleFlutterPayment = useFlutterwave(config);

  const handleClick = () => {
    setIsProcessing(true);
    handleFlutterPayment({
      callback: (response) => {
        if (response.status === 'successful' || response.status === 'completed') {
          onSuccess(tier);
        } else {
          setIsProcessing(false);
          toast.error("Payment was not successful.");
        }
        closePaymentModal();
      },
      onClose: () => {
        setIsProcessing(false);
      },
    });
  };

  return (
    <button onClick={handleClick} disabled={disabled || isProcessing} className={className}>
      {isProcessing && <Loader2 className="w-5 h-5 animate-spin" />}
      {children}
    </button>
  );
};
"""

content = content.replace('export default function PremiumPage() {', payment_btn_code + '\nexport default function PremiumPage() {')

# Replace PRO button
pro_btn_old = """          <button 
            onClick={() => handleSubscribe('pro')}
            disabled={processingTier !== null || profile?.subscriptionTier === 'pro'}
            className="w-full neo-button-secondary py-4 text-white font-bold hover:bg-white/10 transition-colors mt-auto flex items-center justify-center gap-2"
          >
            {processingTier === 'pro' ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            {profile?.subscriptionTier === 'pro' ? 'Current Plan' : 'Choose Pro'}
          </button>"""

pro_btn_new = """          <PaymentButton 
            tier="pro"
            profile={profile}
            currency={currency}
            formatPrice={formatPrice}
            onSuccess={handleSubscribe}
            disabled={processingTier !== null || profile?.subscriptionTier === 'pro'}
            className="w-full neo-button-secondary py-4 text-white font-bold hover:bg-white/10 transition-colors mt-auto flex items-center justify-center gap-2"
          >
            {profile?.subscriptionTier === 'pro' ? 'Current Plan' : 'Choose Pro'}
          </PaymentButton>"""

content = content.replace(pro_btn_old, pro_btn_new)

# Replace ELITE button
elite_btn_old = """            <button 
              onClick={() => handleSubscribe('elite')}
              disabled={processingTier !== null || profile?.subscriptionTier === 'elite'}
              className="relative z-10 w-full flex items-center justify-center gap-2 bg-slate-900 px-6 py-4 rounded-xl group-hover:bg-opacity-0 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {processingTier === 'elite' ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              <span className="font-bold text-white tracking-wide">
                {profile?.subscriptionTier === 'elite' ? 'Current Plan' : 'Upgrade to Elite'}
              </span>
            </button>"""

elite_btn_new = """            <PaymentButton 
              tier="elite"
              profile={profile}
              currency={currency}
              formatPrice={formatPrice}
              onSuccess={handleSubscribe}
              disabled={processingTier !== null || profile?.subscriptionTier === 'elite'}
              className="relative z-10 w-full flex items-center justify-center gap-2 bg-slate-900 px-6 py-4 rounded-xl group-hover:bg-opacity-0 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <span className="font-bold text-white tracking-wide">
                {profile?.subscriptionTier === 'elite' ? 'Current Plan' : 'Upgrade to Elite'}
              </span>
            </PaymentButton>"""

content = content.replace(elite_btn_old, elite_btn_new)

# Change handleSubscribe to not use processingTier anymore since PaymentButton manages its own processing state, or just let it be.
# It sets processingTier inside handleSubscribe which is fine.

with open('src/app/(dashboard)/premium/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
