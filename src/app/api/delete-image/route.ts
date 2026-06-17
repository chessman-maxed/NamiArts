import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { extractPublicId } from "@/lib/image";

export async function POST(req: NextRequest) {
  try {
    // 1. Verify Authorization Header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid authorization token" }, { status: 401 });
    }
    
    const idToken = authHeader.split("Bearer ")[1];
    
    // 2. Validate Firebase Token via Google API
    const firebaseApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!firebaseApiKey) {
      return NextResponse.json({ error: "Server configuration missing Firebase API Key" }, { status: 500 });
    }
    
    const tokenCheckRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      }
    );
    
    if (!tokenCheckRes.ok) {
      return NextResponse.json({ error: "Unauthorized: Invalid Firebase session" }, { status: 401 });
    }
    
    const tokenCheckData = await tokenCheckRes.json();
    const userEmail = tokenCheckData.users?.[0]?.email?.toLowerCase();
    
    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized: User email not found" }, { status: 401 });
    }
    
    // 3. Verify admin whitelisting
    const adminEmailsStr = process.env.NEXT_PUBLIC_ADMIN_EMAILS || "";
    const adminEmails = adminEmailsStr.split(",").map((email) => email.trim().toLowerCase());
    
    if (!adminEmails.includes(userEmail)) {
      return NextResponse.json({ error: "Forbidden: You are not authorized as an admin" }, { status: 403 });
    }
    
    // 4. Parse request body for image URL
    const { imageUrl } = await req.json();
    if (!imageUrl) {
      return NextResponse.json({ error: "Missing imageUrl in request body" }, { status: 400 });
    }
    
    const publicId = extractPublicId(imageUrl);
    if (!publicId) {
      return NextResponse.json({ error: "Could not extract public ID from the image URL" }, { status: 400 });
    }
    
    // 5. Delete from Cloudinary
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    
    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({ error: "Server configuration missing Cloudinary credentials" }, { status: 500 });
    }
    
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signatureStr = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash("sha1").update(signatureStr).digest("hex");
    
    const formData = new FormData();
    formData.append("public_id", publicId);
    formData.append("api_key", apiKey);
    formData.append("timestamp", String(timestamp));
    formData.append("signature", signature);
    
    const cloudinaryRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
      {
        method: "POST",
        body: formData,
      }
    );
    
    if (!cloudinaryRes.ok) {
      const errorText = await cloudinaryRes.text();
      return NextResponse.json({ error: `Cloudinary error: ${errorText}` }, { status: 500 });
    }
    
    const cloudinaryData = await cloudinaryRes.json();
    
    if (cloudinaryData.result === "ok" || cloudinaryData.result === "not_found") {
      return NextResponse.json({ success: true, result: cloudinaryData.result });
    } else {
      return NextResponse.json({ error: `Cloudinary failed with result: ${cloudinaryData.result}` }, { status: 500 });
    }
    
  } catch (error) {
    console.error("API error in delete-image:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
