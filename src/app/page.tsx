import Link from "next/link";
import { auth } from "@/lib/auth";
import Header from "@/components/layout/Header";
import { Skull, Calendar, CreditCard, Palette, Star, ArrowRight, Sparkles } from "lucide-react";

export default async function HomePage() {
  const session = await auth();
  const user = session?.user as typeof session.user & { role?: string; id?: string } | null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} />

      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-24 sm:py-40">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-center bg-cover bg-no-repeat"
          style={{ backgroundImage: "url('/hero-bg.jpg')" }}
        />

        {/* Layered gradient overlay: dark vignette + bottom fade into site bg */}
        <div className="absolute inset-0 bg-gradient-to-b from-obsidian-950/80 via-obsidian-950/60 to-obsidian-950" />
        {/* Left/right fade so text sits on a clean dark center */}
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian-950/70 via-transparent to-obsidian-950/70" />
        {/* Subtle red glow behind heading */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-ink-700/20 blur-3xl rounded-full pointer-events-none" />

        <div className="relative mx-auto max-w-4xl text-center space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-ink-700/50 bg-obsidian-950/60 backdrop-blur-sm px-4 py-1.5 text-sm text-ink-400">
            <Sparkles className="h-3.5 w-3.5" />
            The modern way to book tattoo appointments
          </div>

          <h1 className="text-5xl sm:text-7xl tracking-tight text-white leading-[1.1] drop-shadow-2xl">
            Find your next
            <span className="block text-gradient">tattoo artist</span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-obsidian-300 leading-relaxed drop-shadow-lg">
            Browse flash designs, submit custom concepts, and book directly with artists.
            Deposits held securely through Stripe. No back-and-forth DMs required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/artists" className="btn-primary text-base px-8 py-3 gap-2">
              Browse artists
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/register?role=artist" className="btn-secondary text-base px-8 py-3 bg-obsidian-950/70 backdrop-blur-sm">
              I&apos;m an artist
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-20 border-t border-obsidian-900">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl text-white">Everything you need</h2>
            <p className="mt-3 text-obsidian-400 text-lg font-sans">Built for artists, loved by clients</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Palette className="h-6 w-6" />}
              title="Flash & Custom Bookings"
              description="Clients can browse your flash designs with images, or submit custom requests with reference photos. You control what types of bookings you accept."
            />
            <FeatureCard
              icon={<Calendar className="h-6 w-6" />}
              title="Calendar Integration"
              description="Connect your Google Calendar and clients see your real availability. Confirmed bookings automatically appear in your calendar."
            />
            <FeatureCard
              icon={<CreditCard className="h-6 w-6" />}
              title="Stripe Deposit Collection"
              description="Automatically collect a deposit when clients book. Set a fixed amount or percentage. Deposits are released to you after the appointment."
            />
            <FeatureCard
              icon={<Skull className="h-6 w-6" />}
              title="Custom Booking Forms"
              description="Customize every aspect of your booking form — sizes, body placements, flash designs, and additional questions. Make it yours."
            />
            <FeatureCard
              icon={<Star className="h-6 w-6" />}
              title="Portfolio Showcase"
              description="Your public profile is your gallery. Upload portfolio images, add your bio, link your Instagram, and let your work speak for itself."
            />
            <FeatureCard
              icon={<Sparkles className="h-6 w-6" />}
              title="Streamlined Workflow"
              description="Manage all your bookings in one place. Confirm, cancel, or reschedule from your dashboard. No more lost DMs."
            />
          </div>
        </div>
      </section>

      {/* CTA for artists */}
      <section className="px-4 py-20 border-t border-obsidian-900">
        <div className="mx-auto max-w-3xl text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl text-white">
            Ready to streamline your bookings?
          </h2>
          <p className="text-obsidian-400 text-lg font-sans">
            Create your artist profile in minutes. Set up your flash gallery, customize your booking
            form, and start accepting appointments today.
          </p>
          <Link href="/register" className="btn-primary text-base px-10 py-3 inline-flex">
            Create your artist profile — it&apos;s free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-obsidian-900 px-4 py-8">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink-600">
              <Skull className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-display text-white">TatBook</span>
          </div>
          <p className="text-sm text-obsidian-500">
            © {new Date().getFullYear()} TatBook. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-obsidian-500">
            <Link href="/privacy" className="hover:text-obsidian-300">Privacy</Link>
            <Link href="/terms" className="hover:text-obsidian-300">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="card p-6 space-y-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-ink-900/50 text-ink-400 ring-1 ring-ink-700/30">
        {icon}
      </div>
      <h3 className="text-lg text-white">{title}</h3>
      <p className="text-sm font-sans text-obsidian-400 leading-relaxed">{description}</p>
    </div>
  );
}
