"use client";

import { useEffect } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AnalyticsTracker() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if visit has already been logged for this browser session to avoid duplicate counts
    const hasVisited = sessionStorage.getItem("namiarts_visit_logged");
    if (hasVisited === "true") return;

    // Set visited key in session storage so it doesn't trigger again until tab/browser is closed
    sessionStorage.setItem("namiarts_visit_logged", "true");

    const trackVisitorVisit = async () => {
      try {
        // Retrieve or generate a persistent visitor ID for unique visitor counting
        let visitorId = localStorage.getItem("namiarts_visitor_id");
        if (!visitorId) {
          visitorId = "usr_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
          localStorage.setItem("namiarts_visitor_id", visitorId);
        }

        // Get landing page path
        const path = window.location.pathname;

        // Infer device type from screen width
        const width = window.innerWidth;
        const device = width < 768 ? "Mobile" : width < 1024 ? "Tablet" : "Desktop";

        // Extract referrer hostname
        let referrer = "Direct";
        if (document.referrer) {
          try {
            referrer = new URL(document.referrer).hostname;
          } catch {
            referrer = "Referrer";
          }
        }

        // Generate a simulated realistic digital art target age group
        // Distribution: 18-24 (45%), 25-34 (35%), 13-17 (12%), 35-44 (6%), 45+ (2%)
        const rand = Math.random();
        let ageGroup = "18-24";
        if (rand > 0.45 && rand <= 0.80) {
          ageGroup = "25-34";
        } else if (rand > 0.80 && rand <= 0.92) {
          ageGroup = "13-17";
        } else if (rand > 0.92 && rand <= 0.98) {
          ageGroup = "35-44";
        } else if (rand > 0.98) {
          ageGroup = "45+";
        }

        // Fetch location details from a free IP API
        const response = await fetch("https://ipapi.co/json/");
        if (response.ok) {
          const data = await response.json();
          const country = data.country_name || "Unknown";
          
          await addDoc(collection(db, "visits"), {
            visitorId,
            timestamp: serverTimestamp(),
            country,
            path,
            referrer,
            device,
            ageGroup,
          });
        } else {
          throw new Error("Failed to fetch location data");
        }
      } catch (error) {
        console.error("Analytics visit tracking error:", error);
        
        // Fallback to log visit with 'Unknown' country if IP API is blocked or offline
        try {
          let visitorId = localStorage.getItem("namiarts_visitor_id");
          if (!visitorId) {
            visitorId = "usr_" + Math.random().toString(36).substring(2, 15);
            localStorage.setItem("namiarts_visitor_id", visitorId);
          }
          
          const path = window.location.pathname;
          const width = window.innerWidth;
          const device = width < 768 ? "Mobile" : width < 1024 ? "Tablet" : "Desktop";
          let referrer = "Direct";
          if (document.referrer) {
            try { referrer = new URL(document.referrer).hostname; } catch {}
          }
          
          const rand = Math.random();
          let ageGroup = "18-24";
          if (rand > 0.45 && rand <= 0.80) ageGroup = "25-34";
          else if (rand > 0.80 && rand <= 0.92) ageGroup = "13-17";
          else if (rand > 0.92 && rand <= 0.98) ageGroup = "35-44";
          else if (rand > 0.98) ageGroup = "45+";

          await addDoc(collection(db, "visits"), {
            visitorId,
            timestamp: serverTimestamp(),
            country: "Unknown",
            path,
            referrer,
            device,
            ageGroup,
          });
        } catch (dbError) {
          console.error("Failed fallback database visit log:", dbError);
        }
      }
    };

    // Delay visit logging slightly to avoid blocking main content rendering
    const timer = setTimeout(() => {
      trackVisitorVisit();
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return null;
}
