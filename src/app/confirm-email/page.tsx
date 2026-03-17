"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";

export default function ConfirmEmailPage() {
  const searchParams = useSearchParams();
  const hash = searchParams.get("hash");
  const [status, setStatus] = useState<"pending" | "success" | "error">("pending");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!hash) {
      setStatus("error");
      setMessage("Invalid confirmation link.");
      return;
    }

    const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT || "";
    axios
    .post(`${API_ENDPOINT}/v1/auth/email/confirm`, { hash })

      .then(() => {
        setStatus("success");
        setMessage("Your email has been confirmed! You can now log in.");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(
          err?.response?.data?.errors?.hash ||
            "Failed to confirm email. The link may be invalid or expired."
        );
      });
  }, [hash]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900">
      <div className="w-full max-w-md p-8 rounded-3xl shadow-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 flex flex-col items-center">
        <div className="mb-6 flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-700">
          {status === "success" ? (
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          ) : status === "error" ? (
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
            <svg className="w-10 h-10 text-primary-500 animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
          )}
        </div>
        <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-neutral-100 mb-2 tracking-tight">Email Confirmation</h1>
        <p className="text-neutral-600 dark:text-neutral-300 mb-6 text-center">
          {status === "pending" && "Confirming your email, please wait..."}
          {status !== "pending" && message}
        </p>
        {status === "success" && (
         <a
         href="/sign-in"
         className="inline-block mt-2 px-6 py-2 rounded-full bg-primary-6000 hover:bg-primary-700 text-black font-semibold shadow-lg border border-black transition-all duration-300 transform hover:scale-105"
       >
         Go to SignIn
       </a>       
        )}
      </div>
    </div>
  );
}