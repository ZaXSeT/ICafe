import Link from "next/link";
import { RegisterForm } from "./RegisterForm";
import Image from "next/image";
import { Coffee } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* Left: Hero Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <Image
          src="/images/latte_art.png"
          alt="ICafe latte art"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-foreground/50" />

        <div className="relative z-10 flex flex-col justify-between p-12 text-primary-foreground">
          <Link href="/" className="flex items-center gap-2">
            <Coffee className="h-6 w-6" />
            <span className="font-heading text-2xl font-bold tracking-tight">ICafe</span>
          </Link>

          <div>
            <blockquote className="text-xl md:text-2xl font-heading font-medium italic leading-relaxed mb-4">
              &ldquo;Your first cup is just the beginning of something beautiful.&rdquo;
            </blockquote>
            <p className="text-primary-foreground/70 text-sm">— The ICafe Team</p>
          </div>
        </div>
      </div>

      {/* Right: Form Panel */}
      <div className="flex-1 flex items-center justify-center bg-background px-6 py-16 lg:py-0">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
                <Coffee className="h-6 w-6" />
              </div>
              <span className="font-heading text-xl font-bold">ICafe</span>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-heading font-bold text-foreground mb-1">Create an account</h1>
            <p className="text-muted-foreground text-sm">Join us and start earning rewards today</p>
          </div>

          <RegisterForm />

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>

    </div>
  );
}
