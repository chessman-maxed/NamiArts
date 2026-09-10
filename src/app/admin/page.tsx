"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { Loader2, LogIn, Lock, AlertTriangle } from "lucide-react";

export default function AdminLogin() {
  const { user, loading, isAdmin, loginWithGoogle, logout } = useAuth();
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState("");
  const [signingIn, setSigningIn] = useState(false);

  const handleSignIn = async () => {
    setErrorMsg("");
    setSigningIn(true);
    try {
      await loginWithGoogle();
      // On success, redirect will be handled or checked
    } catch (error) {
      console.error(error);
      setErrorMsg("Failed to sign in. Please try again.");
    } finally {
      setSigningIn(false);
    }
  };

  // When user signs in and is admin, automatically route to dashboard
  useEffect(() => {
    if (!loading && user && isAdmin) {
      router.push("/admin/dashboard");
    }
  }, [user, loading, isAdmin, router]);

  const handleSignOut = async () => {
    try {
      await logout();
      setErrorMsg("");
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-[#d4af37] animate-spin" />
          <p className="text-neutral-400 text-sm font-medium">Verifying access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6 relative">
      <div className="absolute inset-0 ambient-glow z-0" />
      
      <div className="max-w-md w-full bg-neutral-900 border border-neutral-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10">
        
        {/* Header Icon */}
        <div className="w-16 h-16 bg-neutral-850 rounded-2xl flex items-center justify-center border border-neutral-700/85 mx-auto mb-6">
          <Lock className="w-7 h-7 text-[#d4af37]" />
        </div>

        <h1 className="font-display text-2xl font-bold text-center text-white mb-2">
          NamiArts Admin Portal
        </h1>
        <p className="text-neutral-400 text-center text-sm mb-8 leading-relaxed">
          Access is restricted to authorized gallery administrators only.
        </p>

        {/* Unauthorized user feedback - Animated Big Red Cross */}
        {user && !isAdmin && (
          <div className="mb-8 p-6 bg-red-950/30 border border-red-900/60 rounded-2xl flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border-2 border-red-500/80 flex items-center justify-center mb-3 animate-bounce">
              <span className="text-3xl text-red-500 font-extrabold select-none">✕</span>
            </div>
            <h3 className="text-xl font-bold text-red-500 mb-1 font-display tracking-wide">
              Access Denied
            </h3>
            <p className="text-xs text-neutral-400 mb-5 max-w-xs leading-relaxed">
              Only authorized administrator accounts are granted access.
            </p>
            <button
              onClick={handleSignOut}
              className="py-2.5 px-5 rounded-xl bg-red-900/40 hover:bg-red-900/70 border border-red-700/50 text-red-200 text-xs font-semibold transition-all duration-200 focus:outline-none cursor-pointer"
            >
              Sign Out & Switch Account
            </button>
          </div>
        )}

        {/* General Error */}
        {errorMsg && (
          <div className="mb-6 p-3 bg-red-950/20 border border-red-900/30 text-red-400 text-xs rounded-lg text-center">
            {errorMsg}
          </div>
        )}

        {/* Always display Sign in with Google button when user is not logged in */}
        {!user && (
          <button
            onClick={handleSignIn}
            disabled={signingIn}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white hover:bg-neutral-100 text-neutral-950 font-bold transition-all duration-300 disabled:opacity-50 focus:outline-none cursor-pointer"
          >
            {signingIn ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Sign in with Google
              </>
            )}
          </button>
        )}

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            ← Back to Public Website
          </Link>
        </div>

      </div>
    </div>
  );
}
