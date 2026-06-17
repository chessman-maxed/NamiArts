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

  // Automatically redirect if already admin
  useEffect(() => {
    if (!loading && user && isAdmin) {
      router.push("/admin/dashboard");
    }
  }, [user, loading, isAdmin, router]);

  const handleSignIn = async () => {
    setErrorMsg("");
    setSigningIn(true);
    try {
      await loginWithGoogle();
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

  if (loading || (user && isAdmin)) {
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

        {/* Unauthorized user feedback */}
        {user && !isAdmin && (
          <div className="mb-8 p-4 bg-red-950/20 border border-red-900/50 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-white mb-1">Access Denied</h4>
              <p className="text-xs text-neutral-450 mb-3 leading-relaxed">
                The account <strong>{user.email}</strong> is not whitelisted for administrator permissions.
              </p>
              <button
                onClick={handleSignOut}
                className="text-xs font-semibold text-[#d4af37] hover:text-white transition-colors underline focus:outline-none"
              >
                Sign out & use another account
              </button>
            </div>
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
          <div className="text-center text-sm text-[#d4af37]">
            Authorized. Redirecting to dashboard...
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
