export default function MobileAppRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-stone-200 flex items-center justify-center sm:py-8">
      {/* Mobile Frame - Full width on mobile, constrained to phone size on desktop */}
      <div className="w-full sm:max-w-[400px] bg-stone-50 min-h-screen sm:min-h-[800px] sm:max-h-[850px] sm:h-[90vh] sm:rounded-[2.5rem] sm:shadow-2xl sm:border-[8px] sm:border-stone-800 relative flex flex-col overflow-hidden pb-[env(safe-area-inset-bottom)]">
        {children}
      </div>
    </div>
  );
}
