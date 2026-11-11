"use client";

import React, { useState } from 'react';
import { Star, AlertTriangle, Send, Loader2 } from 'lucide-react';
import { useSearchParams, useParams } from 'next/navigation';
import Swal from 'sweetalert2';
import { createEvaluation } from '@/api/evaluations-api';
import { useTranslation } from 'react-i18next';

const WorkerReviewPage = () => {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const params = useParams();
  
  const businessId = searchParams.get('businessId') || (params?.id as string) || "";

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [commentFr, setCommentFr] = useState("");
  const [commentAr, setCommentAr] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReporting, setIsReporting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    if (!businessId) {
      Swal.fire('Error', 'Missing business reference for this evaluation.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await createEvaluation({
        stars: rating,
        textFr: commentFr || "Bon service",
        textAr: commentAr || "تقييم جيد",
        businessId,
        isValid: true,
      });

      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Review submitted and stored successfully.',
        timer: 2000,
        showConfirmButton: false,
      });

      setRating(0);
      setCommentFr("");
      setCommentAr("");
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: err?.response?.data?.message || 'Could not save your evaluation.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReport = async () => {
    const { value: reason } = await Swal.fire({
      title: t('rating_report.report_worker_title'),
      input: 'textarea',
      inputLabel: t('rating_report.report_worker_subtitle'),
      inputPlaceholder: t('rating_report.report_worker_placeholder'),
      inputAttributes: {
        'aria-label': t('rating_report.report_worker_placeholder')
      },
       showCancelButton: true,
      cancelButtonText: t('rating_report.report_worker_cancel_btn'),
      confirmButtonText: t('rating_report.report_worker_submit_btn'),
      confirmButtonColor: '#dc2626'
    });

    if (reason) {
      if (!businessId) {
        Swal.fire('Error', 'Missing business reference.', 'error');
        return;
      }

      setIsReporting(true);
      try {
        Swal.fire({
          icon: 'success',
          title: t('rating_report.report_worker_success_msg'),
          text: t('rating_report.report_worker_success_text'),
        });
      } catch (err: any) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err?.response?.data?.message || 'Failed to submit report.',
        });
      } finally {
        setIsReporting(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">{t('rating_report.title')}</h2>
          <p className="text-gray-500 mt-2">{t('rating_report.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Star Rating */}
          <div className="flex flex-col items-center">
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    size={40}
                    className={`transition-colors ${
                      (hover || rating) >= star 
                        ? "fill-yellow-400 text-yellow-400" 
                        : "fill-transparent text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="mt-2 text-sm font-medium text-gray-600">
              {rating > 0 ? `${rating} out of 5 stars` : t('rating_report.select_rating')}
            </span>
          </div>

          {/* Comment in French */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('rating_report.feedback_fr')}
            </label>
            <textarea
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none text-gray-800"
              placeholder={t('rating_report.feedback_fr_placeholder')}
              value={commentFr}
              onChange={(e) => setCommentFr(e.target.value)}
            />
          </div>

          {/* Comment in Arabic */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 text-right">
              {t('rating_report.feedback_ar')}
            </label>
            <textarea
              dir="rtl"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none text-gray-800 text-right"
              placeholder={t('rating_report.feedback_ar_placeholder')}
              value={commentAr}
              onChange={(e) => setCommentAr(e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={rating === 0 || isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            {t('rating_report.submit_btn')}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200"></span></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400">{t('rating_report.safety_actions')}</span></div>
        </div>

        {/* Report Button */}
        <button
          onClick={handleReport}
          disabled={isReporting}
          className="w-full bg-white border-2 border-red-500 text-red-600 hover:bg-red-50 font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
        >
          {isReporting ? <Loader2 size={18} className="animate-spin" /> : <AlertTriangle size={18} className="group-hover:animate-pulse" />}
          {t('rating_report.report_worker_btn')}
        </button>
      </div>
    </div>
  );
};

export default WorkerReviewPage;