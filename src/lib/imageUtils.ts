import api from "@/store/baseApi";

/**
 * Converts a relative avatar URL to an absolute URL using the API base URL.
 * Handles both relative paths (starting with /uploads) and external URLs.
 * 
 * @param url - The avatar URL to process
 * @returns The full absolute URL or undefined if no URL provided
 */
export function getAvatarUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  
  // If it's a relative path from our backend, prepend the API base URL
  if (url.startsWith("/uploads")) {
    const base = (api.defaults.baseURL || "").replace(/\/$/, "");
    return `${base}${url}`;
  }
  
  // Return external URLs as-is
  return url;
}

/**
 * Converts a relative image URL to an absolute URL using the API base URL.
 * Generic version for any image paths.
 * 
 * @param url - The image URL to process  
 * @returns The full absolute URL or the original URL if not a relative path
 */
export function getImageUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  
  if (url.startsWith("/uploads")) {
    const base = (api.defaults.baseURL || "").replace(/\/$/, "");
    return `${base}${url}`;
  }
  
  return url;
}
