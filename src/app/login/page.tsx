import Link from "next/link";
import { AuthTabs } from "./AuthTabs";
import Image from "next/image";
import { Coffee } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="h-[100dvh] overflow-hidden flex flex-col lg:flex-row">

      {/* Left: Hero Panel */}
      <div className="hidden lg:flex lg:w-[45%] h-full relative overflow-hidden">
        <Image
          src="/images/cafe_hero.png"
          alt="ICafe interior"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-foreground/55" />

        <div className="relative z-10 flex flex-col justify-between p-12 text-primary-foreground h-full">
          <Link href="/" className="flex items-center gap-2">
            <Coffee className="h-6 w-6" />
            <span className="font-heading text-2xl font-bold tracking-tight">ICafe</span>
          </Link>

          <div>
            <blockquote className="text-xl md:text-2xl font-heading italic leading-relaxed mb-4">
              &ldquo;Every cup tells a story.<br />Come find yours.&rdquo;
            </blockquote>
            <p className="text-primary-foreground/60 text-sm">— The ICafe Team</p>
          </div>
        </div>
      </div>

      {/* Right: Auth Panel */}
      <div className="flex-1 flex flex-col bg-background px-6 py-12 h-full overflow-y-auto">
        <div className="w-full max-w-sm m-auto">

          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
                <Coffee className="h-6 w-6" />
              </div>
              <span className="font-heading text-xl font-bold">ICafe</span>
            </Link>
          </div>

          <AuthTabs />

        </div>
      </div>

    </div>
  );
}
