/**
 * Dynamic image protection and optimization utilities for NamiArts.
 */

/**
 * Transforms a raw Cloudinary URL to a highly optimized and protected preview.
 * 
 * This protects the artwork in three ways:
 * 1. Restricts the image dimensions (max 800px width/height) so it is too low-resolution for print or resale.
 * 2. Compresses the quality (q_50) to make it look good on screens but pixelated when zoomed or printed.
 * 3. Burns a permanent text watermark overlay ("NamiArts") directly into the image pixels on the CDN side.
 *    Because the watermark is embedded in the image bytes, downloader extensions and inspect-element downloaders
 *    can only fetch the watermarked version.
 * 
 * @param url The original Cloudinary image URL
 * @returns The transformed, secure preview URL
 */
export function getPreviewImageUrl(url: string): string {
  if (!url) return "";

  // Only apply transformations to Cloudinary URLs
  if (url.includes("cloudinary.com") && url.includes("/image/upload/")) {
    // Cloudinary transformation parameters:
    // - w_800,h_800,c_limit: limit size to fit within an 800x800 bounding box
    // - q_55: moderate quality compression to limit file fidelity
    // - f_auto: serve in next-gen formats (webp/avif) automatically
    // - l_text:Arial_70_bold:NamiArts: overlay the watermark text "NamiArts" in standard Arial font
    // - co_rgb:ffffff,o_15: white text color with 15% opacity (subtle but un-removable)
    // - fl_layer_apply: apply the watermark layer over the base image in a separate step (separated by /)
    const transform = "w_800,h_800,c_limit,q_55,f_auto/l_text:Arial_70_bold:NamiArts,co_rgb:ffffff,o_15/fl_layer_apply";
    
    return url.replace("/image/upload/", `/image/upload/${transform}/`);
  }

  return url;
}

/**
 * Extracts the Cloudinary public ID from a full Cloudinary URL.
 * Supports both clean and transformed URLs.
 * 
 * Example: "https://res.cloudinary.com/dp2lils72/image/upload/v1717887711/namiarts/xyz123.jpg"
 * Returns: "namiarts/xyz123"
 * 
 * @param url The Cloudinary image URL
 * @returns The extracted public ID or null
 */
export function extractPublicId(url: string): string | null {
  if (!url || !url.includes("cloudinary.com")) return null;
  
  try {
    const parts = url.split("/image/upload/");
    if (parts.length < 2) return null;
    
    // Split the remaining path to examine each segment
    const subParts = parts[1].split("/");
    
    // Filter out version numbers (e.g. v1717887711) and transformation segments
    const pathParts = subParts.filter(part => {
      // Exclude version (starts with 'v' followed by digits)
      if (/^v\d+$/.test(part)) return false;
      // Exclude transformation segments (contain comma or equal sign, or are common keywords)
      if (part.includes(",") || part.includes("=") || part === "fl_layer_apply") return false;
      return true;
    });
    
    const remainingPath = pathParts.join("/");
    
    // Remove file extension
    const lastDotIndex = remainingPath.lastIndexOf(".");
    if (lastDotIndex !== -1) {
      return remainingPath.substring(0, lastDotIndex);
    }
    return remainingPath;
  } catch (error) {
    console.error("Error extracting public ID:", error);
    return null;
  }
}

