"use client";

import React, { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Navbar from "@/components/navbar";
import { AnimatedSection } from "@/components/animated-section";
import { REFERRAL_FORM_CONFIG } from "@/lib/referral-config";
import { User, Calendar, MapPin, Phone, Users, CheckCircle2, Gift, TrendingUp, Sparkles, HelpCircle, ArrowRight, X } from "lucide-react";
import Link from "next/link";

export default function ReferralPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    city: "",
    gender: "Male",
    phoneNumber: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full Name is required";
    }

    if (!formData.age || isNaN(Number(formData.age)) || Number(formData.age) <= 0 || Number(formData.age) > 120) {
      newErrors.age = "Please enter a valid age";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.gender) {
      newErrors.gender = "Gender is required";
    }

    // Indian Phone Number validation (10 digits, optionally starting with +91 or 0)
    const phoneRegex = /^(?:(?:\+|0{0,2})91[\s-]*)?[6-9]\d{9}$/;
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone Number is required";
    } else if (!phoneRegex.test(formData.phoneNumber.replace(/\s+/g, ""))) {
      newErrors.phoneNumber = "Enter a valid 10-digit Indian phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // 1. Save data to Firebase Firestore (Optional backup)
    try {
      await addDoc(collection(db, "referrals"), {
        fullName: formData.fullName,
        age: Number(formData.age),
        city: formData.city,
        gender: formData.gender,
        phoneNumber: formData.phoneNumber,
        createdAt: serverTimestamp(),
      });
    } catch (dbErr) {
      // Catch permission error silently without crashing UI
      console.warn("Firestore save skipped:", dbErr);
    }

    // 2. Direct Form Submission to Google Forms via Hidden HTML Form & Iframe
    const { formUrl, entries } = REFERRAL_FORM_CONFIG;

    if (formUrl && formUrl.trim().length > 0) {
      try {
        // Construct pre-filled Google Form URL
        const formViewUrl = formUrl.replace("formResponse", "viewform");
        const gUrl = new URL(formViewUrl);
        gUrl.searchParams.append(entries.fullName, formData.fullName);
        gUrl.searchParams.append(entries.age, formData.age);
        gUrl.searchParams.append(entries.city, formData.city);
        gUrl.searchParams.append(entries.gender, formData.gender);
        gUrl.searchParams.append(entries.phoneNumber, formData.phoneNumber);

        // Open pre-filled Google Form tab so user can submit with 1 click to Google Sheet
        window.open(gUrl.toString(), "_blank");
      } catch (err) {
        console.error("Google form submission error:", err);
      }
    }

    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 selection:bg-[#d4af37] selection:text-black">
      <Navbar />

      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header Hero Section */}
        <AnimatedSection className="text-center max-w-3xl mx-auto pt-6 pb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] text-xs font-extrabold uppercase tracking-widest mb-6">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            Partner Program
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-4">
            Refer & <span className="text-[#d4af37]">Earn</span>
          </h1>
          <p className="text-neutral-400 text-lg sm:text-xl leading-relaxed">
            Love our artworks? Help someone discover them and earn while doing it.
          </p>
        </AnimatedSection>

        {/* 3 Step Visual Flow */}
        <AnimatedSection className="mb-20">
          <h2 className="text-center text-xs font-bold uppercase tracking-widest text-[#d4af37] mb-8">
            Referral Process
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Step 1 */}
            <div className="relative p-6 sm:p-8 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 hover:border-[#d4af37]/50 transition-all duration-300 group hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37] font-bold text-lg mb-6 group-hover:scale-110 transition-transform">
                1
              </div>
              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                Register
              </h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Fill in the referral registration form with your Full Name, Age, City, Gender, and Phone Number.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative p-6 sm:p-8 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 hover:border-[#d4af37]/50 transition-all duration-300 group hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37] font-bold text-lg mb-6 group-hover:scale-110 transition-transform">
                2
              </div>
              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                Get Your Referral Code
              </h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                After submitting the form, NamiArts will personally contact you on your registered phone/WhatsApp number and send you your unique referral code.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative p-6 sm:p-8 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 hover:border-[#d4af37]/50 transition-all duration-300 group hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37] font-bold text-lg mb-6 group-hover:scale-110 transition-transform">
                3
              </div>
              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                Share & Earn
              </h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Share your referral code with friends, family, or other customers interested in NamiArts artworks/photo frames. When someone purchases: <span className="text-white font-semibold">Customer gets 10% OFF</span> <span className="text-[#d4af37] font-bold">&</span> <span className="text-white font-semibold">You receive 10% on total purchase (excluding courier/shipment) through your referral code.</span>
              </p>
            </div>
          </div>
        </AnimatedSection>

        {/* Benefits & Example Breakdown Card */}
        <AnimatedSection className="mb-20">
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-neutral-900/90 to-neutral-950 border border-neutral-800 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#d4af37] mb-3">
                  <Gift className="w-4 h-4" />
                  Dual-Reward Structure
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                  A Win-Win for Everyone
                </h3>
                <div className="space-y-4 text-neutral-300 text-sm sm:text-base">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#d4af37] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white">Customer Benefit:</strong> 10% discount on their purchase when buying with a valid referral code.
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#d4af37] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white">Referral Partner Benefit:</strong> 10% on total purchase(excluding courier/shipment charges) through your referral code.
                    </div>
                  </div>
                </div>
              </div>

              {/* Profit Calculation Example Box */}
              <div className="p-6 rounded-2xl bg-neutral-955/80 border border-neutral-800/80">
                <div className="flex items-center gap-2 text-[#d4af37] text-xs font-bold uppercase tracking-widest mb-3">
                  <TrendingUp className="w-4 h-4" />
                  Earnings Example
                </div>
                <div className="bg-neutral-900/80 p-4 rounded-xl border border-neutral-800 space-y-2 font-mono text-sm">
                  <div className="flex justify-between text-neutral-400">
                    <span>Total Order Value:</span>
                    <span className="text-white font-semibold">₹500</span>
                  </div>
                  <div className="flex justify-between text-[#d4af37] pt-2 border-t border-neutral-800">
                    <span>Your Earnings (10%):</span>
                    <span className="font-bold">₹50</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Registration Form Section */}
        <AnimatedSection className="max-w-2xl mx-auto">
          <div id="register" className="p-8 sm:p-10 rounded-3xl bg-neutral-900/80 border border-neutral-800 shadow-2xl relative">
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-white mb-2">
              Join Referral Program
            </h2>
            <p className="text-center text-neutral-400 text-sm mb-4">
              Fill in your basic details below to register as an official referral partner.
            </p>
            
            {/* Prominent Personal Outreach Notice */}
            <div className="p-3.5 mb-8 rounded-2xl bg-[#d4af37]/10 border border-[#d4af37]/30 text-center">
              <p className="text-xs sm:text-sm text-[#d4af37] font-semibold flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0 animate-pulse" />
                <span>After filling your details, our team will reach out to you personally via Phone/WhatsApp and share your unique referral code.</span>
              </p>
            </div>

            {submitted ? (
              <div className="py-10 px-4 text-center space-y-5 animate-in fade-in zoom-in duration-300 relative">
                {/* Top Right Close (Cross) Button */}
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ fullName: "", age: "", city: "", gender: "Male", phoneNumber: "" });
                  }}
                  className="absolute top-0 right-0 p-2 text-neutral-400 hover:text-white transition-colors focus:outline-none rounded-full hover:bg-neutral-800/60"
                  aria-label="Close message and reset form"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Glowing Green Checkmark Icon Badge */}
                <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping blur-sm" />
                  <div className="relative w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                    <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Registration Submitted Successfully!
                  </h3>
                  <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest">
                    ✓ Received by NamiArts Team
                  </p>
                </div>

                <p className="text-neutral-300 text-sm sm:text-base leading-relaxed max-w-lg mx-auto">
                  Thank you for joining the NamiArts Referral Program. We have received your details. Our team will contact you soon on your registered phone number and provide your unique referral code.
                </p>

                <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
                  Once you receive your code, simply share it with customers who are interested in NamiArts.
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ fullName: "", age: "", city: "", gender: "Male", phoneNumber: "" });
                    }}
                    className="px-8 py-3 rounded-xl bg-[#d4af37] hover:bg-[#b59228] text-black font-extrabold tracking-wide uppercase text-xs transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] cursor-pointer"
                  >
                    Submit Another Registration
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                {/* Full Name */}
                <div>
                  <label htmlFor="fullName" className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2 flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-[#d4af37]" />
                    Full Name <span className="text-[#d4af37]">*</span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className={`w-full px-4 py-3 rounded-xl bg-neutral-950 border ${
                      errors.fullName ? "border-red-500" : "border-neutral-800 focus:border-[#d4af37]"
                    } text-white placeholder-neutral-600 focus:outline-none transition-colors text-sm`}
                  />
                  {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName}</p>}
                </div>

                {/* Age & City Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Age */}
                  <div>
                    <label htmlFor="age" className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#d4af37]" />
                      Age <span className="text-[#d4af37]">*</span>
                    </label>
                    <input
                      type="number"
                      id="age"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      placeholder="e.g. 25"
                      min="1"
                      max="120"
                      className={`w-full px-4 py-3 rounded-xl bg-neutral-950 border ${
                        errors.age ? "border-red-500" : "border-neutral-800 focus:border-[#d4af37]"
                      } text-white placeholder-neutral-600 focus:outline-none transition-colors text-sm`}
                    />
                    {errors.age && <p className="text-red-400 text-xs mt-1">{errors.age}</p>}
                  </div>

                  {/* City */}
                  <div>
                    <label htmlFor="city" className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2 flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#d4af37]" />
                      City <span className="text-[#d4af37]">*</span>
                    </label>
                    <input
                      type="text"
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="e.g. Mumbai"
                      className={`w-full px-4 py-3 rounded-xl bg-neutral-950 border ${
                        errors.city ? "border-red-500" : "border-neutral-800 focus:border-[#d4af37]"
                      } text-white placeholder-neutral-600 focus:outline-none transition-colors text-sm`}
                    />
                    {errors.city && <p className="text-red-400 text-xs mt-1">{errors.city}</p>}
                  </div>
                </div>

                {/* Gender & Phone Number Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Gender */}
                  <div>
                    <label htmlFor="gender" className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2 flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-[#d4af37]" />
                      Gender <span className="text-[#d4af37]">*</span>
                    </label>
                    <select
                      id="gender"
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-[#d4af37] text-white focus:outline-none transition-colors text-sm cursor-pointer"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                    {errors.gender && <p className="text-red-400 text-xs mt-1">{errors.gender}</p>}
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label htmlFor="phoneNumber" className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2 flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-[#d4af37]" />
                      Phone Number <span className="text-[#d4af37]">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      placeholder="e.g. 9876543210"
                      className={`w-full px-4 py-3 rounded-xl bg-neutral-950 border ${
                        errors.phoneNumber ? "border-red-500" : "border-neutral-800 focus:border-[#d4af37]"
                      } text-white placeholder-neutral-600 focus:outline-none transition-colors text-sm`}
                    />
                    {errors.phoneNumber && <p className="text-red-400 text-xs mt-1">{errors.phoneNumber}</p>}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-4 rounded-xl bg-[#d4af37] hover:bg-[#b59228] text-black font-extrabold tracking-wide uppercase text-sm transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] cursor-pointer flex items-center justify-center gap-2 mt-4"
                >
                  Join Referral Program
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </AnimatedSection>
      </main>

      {/* Footer minimal signature */}
      <footer className="border-t border-neutral-900 py-8 text-center text-xs text-neutral-500">
        <p>© {new Date().getFullYear()} NamiArts. All rights reserved.</p>
      </footer>
    </div>
  );
}
