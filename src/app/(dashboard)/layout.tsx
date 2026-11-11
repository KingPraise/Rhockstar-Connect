import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";
import MobileHeader from "@/components/layout/MobileHeader";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ImageLightbox from "@/components/ui/ImageLightbox";
import GlobalSearchModal from "@/components/ui/GlobalSearchModal";
import PresenceHeartbeat from "@/components/layout/PresenceHeartbeat";
import OnboardingTour from "@/components/onboarding/OnboardingTour";
import DashboardThemeContainer from "@/components/layout/DashboardThemeContainer";
import InAppNotificationBanner from "@/components/notifications/InAppNotificationBanner";
import SubscriptionLifecycleManager from "@/components/subscriptions/SubscriptionLifecycleManager";
import SubscriptionBanner from "@/components/subscriptions/SubscriptionBanner";
import SubscriptionExpiredModal from "@/components/subscriptions/SubscriptionExpiredModal";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardThemeContainer>
      <PresenceHeartbeat />
      <InAppNotificationBanner />
      <SubscriptionLifecycleManager />
      <SubscriptionExpiredModal />
      
      {/* Mobile Top Navigation Header */}
      <MobileHeader />

      {/* Sidebar Layout for Desktop (Stationary) */}
      <Sidebar />

      {/* Main Content Area (Independently Scrollable with Native Momentum) */}
      <main 
        id="main-scroll-container" 
        className="flex-1 h-full overflow-y-auto w-full p-0 pt-16 md:p-8 md:pt-8 pb-24 md:pb-8 relative z-10 custom-scrollbar"
      >
        <ProtectedRoute>
          <SubscriptionBanner />
          {children}
        </ProtectedRoute>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Global Image Lightbox */}
      <ImageLightbox />

      {/* Global Search Modal */}
      <GlobalSearchModal />
      
      {/* Onboarding Tour */}
      <OnboardingTour />
    </DashboardThemeContainer>
  );
}
