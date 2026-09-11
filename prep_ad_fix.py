with open("src/app/(dashboard)/employer/ads/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import re

# Add flutterwave import if not exists
if "import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';" not in content:
    content = content.replace('import { toast } from "react-hot-toast";', 'import { toast } from "react-hot-toast";\nimport { useFlutterwave, closePaymentModal } from "flutterwave-react-v3";')

# Replace handleSimulatePayment
old_handle = """  const handleSimulatePayment = async (ad: Advertisement) => {
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

new_handle = """  const config = (ad: Advertisement) => ({
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
  });

  const handleFlutterPaymentFn = useFlutterwave(config({} as any)); // We will call it dynamically below

  const handleSimulatePayment = async (ad: Advertisement) => {
    setPayingAdId(ad.id);
    
    // Have to bypass the hook limitation by calling useFlutterwave config at call time or using it directly.
    // Actually, useFlutterwave takes config at render, which is annoying for lists. Let's just create a dynamic wrapper.
    const dynamicConfig = config(ad);
    
    // We can't re-call useFlutterwave inside a callback, so we'll use a dynamic approach.
    // Because it's easier, let's just trigger the modal directly using the Flutterwave script if needed,
    // but react-v3 hook handles it. We can just use standard fetch if we want, or a separate component.
    // For now, let's just do a mock that calls the backend verify API directly with a fake transaction ID 
    // because we need a wrapper component to use the hook per item.
    // Actually, I will write a simple AdPaymentButton component and inject it.
  };"""

# Wait, `useFlutterwave` needs to be inside a component. I should extract `AdPaymentButton` or just use the hook and update its config in state.
