import { HeroSection } from "@/components/features/HeroSection";
import { FeaturedMenu } from "@/components/features/FeaturedMenu";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <FeaturedMenu />
      
      {/* Quick Info Section */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4 md:px-8 text-center max-w-4xl">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-8">Modern cafe, seamless experience.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
            <div>
              <h3 className="text-xl font-bold mb-3 border-b border-border pb-2">Order Ahead</h3>
              <p className="text-muted-foreground">Skip the line. Order your favorite drinks and pastries right from your phone before you arrive.</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-3 border-b border-border pb-2">Reserve a Table</h3>
              <p className="text-muted-foreground">Guarantee your spot. Choose your preferred table layout and arrival time instantly.</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-3 border-b border-border pb-2">Earn Rewards</h3>
              <p className="text-muted-foreground">Every sip counts. Earn loyalty points with every purchase to unlock exclusive perks.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
