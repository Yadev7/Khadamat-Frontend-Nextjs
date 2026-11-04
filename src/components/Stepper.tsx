"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Check, AlertCircle, Loader2 } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { STEP_FIELDS } from "@/app/dashboard/business/add/schema";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";

interface Step {
  step: number;
  label: string;
  content: React.ComponentType<any>;
}

interface StepperProps {
  steps: Step[];
  onSubmit: () => Promise<void>;
}

export default function Stepper({ steps, onSubmit }: StepperProps) {
  const [activeStep, setActiveStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- 1. Hook into real i18next ---
  const { t } = useTranslation();

  // Access form methods from FormProvider
  const { trigger, formState: { errors } } = useFormContext();

  const currentStepIndex = activeStep - 1;
  const CurrentStepComponent = steps[currentStepIndex]?.content;

  const handleNext = async () => {
    const fieldsToValidate = STEP_FIELDS[currentStepIndex as keyof typeof STEP_FIELDS];

    const isStepValid = await trigger(fieldsToValidate as any);

    if (!isStepValid) {
      console.log("Validation failed for step", activeStep);
      return; 
    }

    if (activeStep < steps.length) {
      setActiveStep((prev) => prev + 1);
    } else {
      setIsSubmitting(true);
      try {
        await onSubmit();
      } catch (error) {
        console.error(error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (activeStep > 1) {
      setActiveStep((prev) => prev - 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Indicators */}
      <div className="flex justify-between items-center mb-6 sm:mb-10 overflow-x-auto">
        {steps.map((step, index) => {
          const isCompleted = activeStep > step.step;
          const isActive = activeStep === step.step;

          return (
            <React.Fragment key={step.step}>
              <div className="flex flex-col items-center relative z-10">
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                    isCompleted ? "bg-emerald-500 text-white" : 
                    isActive ? "bg-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-900" : 
                    "bg-slate-100 text-slate-400 dark:bg-gray-800 dark:text-gray-500"
                  }`}
                >
                  {isCompleted ? <Check size={18} /> : step.step}
                </div>
                <span className={`text-[10px] sm:text-xs mt-2 font-bold uppercase tracking-wider ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-gray-500"}`}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 h-1 bg-slate-100 mx-1 sm:mx-4 -mt-6 min-w-2 dark:bg-gray-800">
                  <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: isCompleted ? "100%" : "0%" }} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="bg-white p-4 sm:p-8 rounded-[2.5rem] shadow-xl border border-slate-100 mb-6 min-h-[300px] dark:bg-gray-900 dark:border-gray-800">
        {CurrentStepComponent && <CurrentStepComponent />}
        
        {/* Error Feedback */}
        {Object.keys(errors).length > 0 && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-sm font-medium animate-in fade-in dark:bg-red-950 dark:text-red-400">
            <AlertCircle size={16} />
            {t("dashboard.business.validation_error")}
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={handleBack}
          disabled={activeStep === 1 || isSubmitting}
          className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-2xl font-bold transition-all ${
            activeStep === 1 ? "opacity-0 pointer-events-none" : "text-slate-600 hover:bg-slate-100 active:scale-95 dark:text-gray-300 dark:hover:bg-gray-800"
          }`}
        >
          <ChevronLeft size={20} /> {t("common.back", "Back")}
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={isSubmitting}
          className="bg-indigo-600 text-white px-4 sm:px-8 py-3 rounded-2xl flex items-center gap-2 font-bold shadow-lg hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 disabled:bg-slate-300 disabled:shadow-none dark:disabled:bg-slate-700"
        >
          {isSubmitting ? (
            <Loader2 className="animate-spin" size={20} />
          ) : activeStep === steps.length ? (
            t("business.complete_submit", "Complete & Submit")
          ) : (
            <>
              {t("dashboard.business.step1.next", "Next")} <ChevronRight size={20} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}