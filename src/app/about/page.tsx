import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="flex-1 pt-36 pb-12 bg-background">
      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl md:text-6xl font-heading font-bold mb-4 text-foreground">Our Story</h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            Welcome to ICafe. We started with a simple vision: to create a space where the warmth of community meets the perfection of artisanal coffee.
          </p>
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mb-16">
          <div className="md:col-span-8 relative h-[250px] md:h-[300px] rounded-[1.5rem] overflow-hidden shadow-xl">
            <Image 
              src="/images/cafe_hero.png" 
              alt="Cafe Interior" 
              fill 
              className="object-cover hover:scale-105 transition-transform duration-700"
            />
          </div>
          <div className="md:col-span-4 flex flex-col gap-5">
            <div className="relative h-[115px] md:h-[140px] rounded-[1.5rem] overflow-hidden shadow-lg">
              <Image 
                src="/images/latte_art.png" 
                alt="Latte Art" 
                fill 
                className="object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="relative h-[115px] md:h-[140px] rounded-[1.5rem] overflow-hidden shadow-lg">
              <Image 
                src="/images/croissant.png" 
                alt="Fresh Croissant" 
                fill 
                className="object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="glass-card p-8 rounded-[1.5rem] border-none text-center">
            <h3 className="text-2xl font-heading font-bold mb-3 leading-relaxed">Ethical Sourcing</h3>
            <p className="text-sm md:text-base text-muted-foreground">
              Every bean we roast is ethically sourced and carefully selected from sustainable farms around the world.
            </p>
          </div>
          <div className="glass-card p-8 rounded-[1.5rem] border-none text-center">
            <h3 className="text-2xl font-heading font-bold mb-3 leading-relaxed">Master Craft</h3>
            <p className="text-sm md:text-base text-muted-foreground">
              Our baristas are artisans. We believe in the power of a perfectly pulled shot to transform your day.
            </p>
          </div>
          <div className="glass-card p-8 rounded-[1.5rem] border-none text-center">
            <h3 className="text-2xl font-heading font-bold mb-3 leading-relaxed">Community</h3>
            <p className="text-sm md:text-base text-muted-foreground">
              More than a cafe, we are a hub for connection. A place to work, relax, and build relationships.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
