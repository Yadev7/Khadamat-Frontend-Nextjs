"use client";

import React, { useState } from 'react';
import { Star, AlertTriangle, Send } from 'lucide-react';

const WorkerReviewPage = () => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ rating, comment });
    alert("Review submitted successfully!");
  };

  const handleReport = () => {
    const confirmReport = confirm("Are you sure you want to report this worker for a policy violation?");
    if (confirmReport) {
      console.log("Worker reported");
      // Add your API logic here
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Rate Worker</h2>
          <p className="text-gray-500 mt-2">How was your experience with John Doe?</p>
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
              {rating > 0 ? `${rating} out of 5 stars` : "Select a rating"}
            </span>
          </div>

          {/* Comment Box */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Your Feedback
            </label>
            <textarea
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
              placeholder="Tell us what went well or what could be improved..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={rating === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Send size={18} />
            Submit Review
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200"></span></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400">Safety Actions</span></div>
        </div>

        {/* Report Button */}
        <button
          onClick={handleReport}
          className="w-full bg-white border-2 border-red-500 text-red-600 hover:bg-red-50 font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 group"
        >
          <AlertTriangle size={18} className="group-hover:animate-pulse" />
          Report Worker
        </button>
      </div>
    </div>
  );
};

export default WorkerReviewPage;