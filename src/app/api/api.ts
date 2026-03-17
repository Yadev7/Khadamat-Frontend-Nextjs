// lib/api.ts
export const fetchWithAuth = async (url: string, options: any = {}) => {
  // Since we use HTTP-only cookies, we no longer pull from localStorage
  const response = await fetch(`http://localhost:3001${url}`, { 
    ...options, 
    credentials: "include" // Ensures cookies are sent with the request
  });
  
  if (response.status === 401) {
    // FIX: Change /login to /sign-in to match your Next.js route
    window.location.href = "/sign-in"; 
  }
  
  return response.json();
};