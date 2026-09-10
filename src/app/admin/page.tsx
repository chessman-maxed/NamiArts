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
      router.push("/admin/dashboard");
    } catch (error) {
      console.error(error);
      setErrorMsg("Failed to sign in. Please try again.");
      setSigningIn(false);
    }
  };

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

        {/* Login Action */}
        {!user ? (
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
        ) : !isAdmin ? null : (
          <div className="space-y-4">
            <button
              onClick={() => router.push("/admin/dashboard")}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-[#d4af37] hover:bg-[#c59e26] text-neutral-950 font-bold transition-all duration-300 focus:outline-none cursor-pointer shadow-lg shadow-[#d4af37]/20"
            >
              <LogIn className="w-5 h-5" />
              Proceed to Admin Dashboard
            </button>
            <button
              onClick={handleSignOut}
              className="w-full text-center text-xs text-neutral-400 hover:text-white transition-colors py-1"
            >
              Sign Out ({user.email})
            </button>
          </div>
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
