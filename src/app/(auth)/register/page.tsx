"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Skull, Eye, EyeOff, User, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    role: z.enum(["CLIENT", "ARTIST"]),
    displayName: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "CLIENT" },
  });

  const role = watch("role");

  const onSubmit = async (data: RegisterForm) => {
    setServerError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        setServerError(json.error ?? "Registration failed. Please try again.");
        return;
      }

      await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      router.push(data.role === "ARTIST" ? "/artist/dashboard" : "/artists");
    } catch {
      setServerError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-obsidian-950">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <Skull className="h-10 w-10 text-white" />
            <span className="text-2xl font-display text-white">TatBook</span>
          </Link>
          <h1 className="text-3xl font-bold text-white">Create your account</h1>
          <p className="mt-2 text-obsidian-400">Join TatBook today — it&apos;s free</p>
        </div>

        <div className="card p-8 space-y-6">
          {/* Role selector */}
          <div>
            <label className="label">I am a…</label>
            <div className="grid grid-cols-2 gap-3">
              <RoleCard
                icon={<User className="h-5 w-5" />}
                label="Client"
                description="Book tattoo appointments"
                selected={role === "CLIENT"}
                onClick={() => setValue("role", "CLIENT")}
              />
              <RoleCard
                icon={<Palette className="h-5 w-5" />}
                label="Artist"
                description="Manage your bookings"
                selected={role === "ARTIST"}
                onClick={() => setValue("role", "ARTIST")}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {serverError && (
              <div className="rounded-lg bg-red-900/30 border border-red-700/50 px-4 py-3 text-sm text-red-400">
                {serverError}
              </div>
            )}

            <div>
              <label className="label">Full name</label>
              <input
                type="text"
                autoComplete="name"
                className="input-field"
                placeholder="Alex Johnson"
                {...register("name")}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>
              )}
            </div>

            {role === "ARTIST" && (
              <div>
                <label className="label">Artist / Studio name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Shown on your public profile"
                  {...register("displayName")}
                />
              </div>
            )}

            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                autoComplete="email"
                className="input-field"
                placeholder="you@example.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className="input-field pr-10"
                  placeholder="Min. 8 characters"
                  {...register("password")}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-3 flex items-center text-obsidian-500 hover:text-obsidian-300"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="label">Confirm password</label>
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                className="input-field"
                placeholder="••••••••"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-400">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
              {isSubmitting ? "Creating account…" : "Create account"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-obsidian-400">
          Already have an account?{" "}
          <Link href="/login" className="text-ink-400 hover:text-ink-300 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

function RoleCard({
  icon,
  label,
  description,
  selected,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all",
        selected
          ? "border-ink-500 bg-ink-900/30 text-white"
          : "border-obsidian-700 bg-obsidian-900 text-obsidian-400 hover:border-obsidian-600 hover:text-obsidian-200"
      )}
    >
      <div className={cn("rounded-lg p-2", selected ? "bg-ink-600 text-white" : "bg-obsidian-800")}>
        {icon}
      </div>
      <div>
        <div className="text-sm font-semibold">{label}</div>
        <div className="text-xs text-obsidian-500 mt-0.5">{description}</div>
      </div>
    </button>
  );
}
