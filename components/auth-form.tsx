"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Activity, ArrowLeft, ArrowRight, Check, ShieldCheck, Sparkles, Trophy } from "lucide-react";

type AuthFormProps = { mode: "login" | "signup" };

export default function AuthForm({ mode }: AuthFormProps) {
  const isSignup = mode === "signup";
  const router = useRouter();
  const [notice, setNotice] = useState("");
  const [noticeIsError, setNoticeIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    setNoticeIsError(false);
    setIsSubmitting(true);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const endpoint = isSignup ? "/api/auth/signup" : "/api/auth/login";
    const payload = isSignup
      ? {
          email,
          password,
          fullName: [form.get("firstName"), form.get("lastName")]
            .map((value) => String(value ?? "").trim())
            .filter(Boolean)
            .join(" "),
          role: String(form.get("role") ?? "athlete")
        }
      : { email, password };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(typeof result.error === "string" ? result.error : "Authentication failed. Please try again.");
      }

      if (isSignup && result.emailConfirmationRequired) {
        setNotice("Your account was created. Check your email to confirm it, then sign in.");
        return;
      }

      router.replace("/");
      router.refresh();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Something went wrong. Please try again.");
      setNoticeIsError(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-promo">
        <Link className="brand auth-brand" href="/">
          <span className="brand-mark"><Activity size={21} strokeWidth={2.7} /></span>
          <span>sports<span className="brand-connect">connect</span></span>
        </Link>
        <div className="auth-promo-copy">
          <span className="banner-kicker"><Sparkles size={14} /> YOUR POTENTIAL, IN MOTION</span>
          <h1>More than a game.<br />A <em>whole community.</em></h1>
          <p>Build your sports identity, find opportunities, and connect with the people who help you move forward.</p>
          <div className="auth-benefits">
            <span><Check size={15} /> A profile that tells your story</span>
            <span><Check size={15} /> Trials, scholarships and teams</span>
            <span><Check size={15} /> Coaches and athletes in your network</span>
          </div>
        </div>
        <div className="auth-promo-footer"><ShieldCheck size={16} /> Built for athletes. Open to every ambition.</div>
        <div className="auth-orbit auth-orbit-one" /><div className="auth-orbit auth-orbit-two" />
        <div className="auth-trophy"><Trophy size={45} strokeWidth={1.25} /></div>
      </section>
      <section className="auth-content">
        <Link className="auth-back" href="/"><ArrowLeft size={15} /> Back to preview</Link>
        <div className="auth-card">
          <span className="auth-eyebrow">{isSignup ? "START YOUR JOURNEY" : "WELCOME BACK"}</span>
          <h2>{isSignup ? "Create your account" : "Good to see you again."}</h2>
          <p className="auth-description">{isSignup ? "Join a community built around your sporting future." : "Sign in to pick up where your sporting journey left off."}</p>
          <form className="auth-form" onSubmit={handleSubmit}>
            {isSignup && <div className="auth-name-row"><label>First name<input name="firstName" autoComplete="given-name" placeholder="First name" required /></label><label>Last name<input name="lastName" autoComplete="family-name" placeholder="Last name" required /></label></div>}
            <label>Email address<input type="email" name="email" autoComplete="email" placeholder="you@example.com" required /></label>
            <label>Password<input type="password" name="password" autoComplete={isSignup ? "new-password" : "current-password"} minLength={8} placeholder={isSignup ? "At least 8 characters" : "Enter your password"} required /></label>
            {isSignup && <label>I’m joining as<select name="role" defaultValue="athlete"><option value="athlete">Athlete / Player</option><option value="coach">Coach</option><option value="club">Club / Academy</option><option value="association">Sports association</option></select></label>}
            {!isSignup && <div className="auth-options"><label className="auth-remember"><input type="checkbox" name="remember" /> Remember me</label><button type="button" className="auth-inline-link" onClick={() => { setNotice("Password recovery will be added in the next auth step. Contact support if you are locked out."); setNoticeIsError(false); }}>Forgot password?</button></div>}
            <button className="button button-primary auth-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? "Please wait…" : isSignup ? "Create account" : "Sign in"} <ArrowRight size={16} /></button>
          </form>
          {notice && <p className={`auth-notice ${noticeIsError ? "auth-notice-error" : ""}`} role={noticeIsError ? "alert" : "status"}>{notice}</p>}
          <p className="auth-switch">{isSignup ? "Already part of the network?" : "New to SportsConnect?"} <Link href={isSignup ? "/login" : "/signup"}>{isSignup ? "Sign in" : "Create an account"}</Link></p>
          <div className="auth-legal">By continuing, you agree to our <a href="#terms">Terms</a> and <a href="#privacy">Privacy Policy</a>.</div>
        </div>
        <div className="auth-trust"><span><ShieldCheck size={14} /> Athlete-first community</span><span>Made for the next generation of sport</span></div>
      </section>
    </main>
  );
}
