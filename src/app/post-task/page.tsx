"use client";

import { useState } from "react";
import {
  CheckCircleIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

// --- Main component with full state management ---
export default function ServibeForm() {
  const [step, setStep] = useState(1);
  const [highestStep, setHighestStep] = useState(1);

  // 1. EXPANDED STATE: Holds all data from every step
  const [formData, setFormData] = useState({
    title: "",
    dateType: "flexible", // 'on', 'before', 'flexible'
    onDate: "",
    beforeDate: "", // Added separate field for 'before' date
    needsTimeOfDay: false,
    timeOfDay: "", // e.g., 'Morning Before 10am'
    isHomeTask: true,
    location: "",
    cleanType: "Regular",
    bedrooms: "None",
    rooms: "None",
    bringSupplies: true,
    cleaningDetails: "",
    budget: "",
  });

  // 2. HANDLER FUNCTION: Updates the formData state from any child component
  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    const newStep = step + 1;
    setStep(newStep);
    if (newStep > highestStep) {
      setHighestStep(newStep);
    }
  };

  const prevStep = () => setStep((prev) => prev - 1);

  // CORRECTED: Allow navigation to any visited step
  const goToStep = (stepNumber: number) => {
    if (stepNumber <= highestStep) {
      setStep(stepNumber);
    }
  };
  
  
  const handleSubmit = () => {
    // In a real app, you would send the data to a server here
    alert("Task Submitted! Check the console for the form data.");
    console.log("FINAL FORM DATA:", formData);
  }

  const steps = [
    { id: 1, name: "Title & Date" },
    { id: 2, name: "Location" },
    { id: 3, name: "Details" },
    { id: 4, name: "Budget" },
  ];

  return (
    <div className="bg-slate-50 min-h-screen flex items-center justify-center font-sans">
      <div className="flex w-full max-w-4xl min-h-[600px] bg-white rounded-lg shadow-xl">
        <div className="w-1/4 p-8 border-r border-gray-100">
          <h1 className="text-2xl font-bold text-blue-600 mb-12">Servibe</h1>
          <nav>
            {/* ACCESSIBILITY: Changed to a list of buttons */}
            <ul className="space-y-6">
              {steps.map((s) => {
                const isCompleted = s.id < step;
                const isCurrent = s.id === step;
                const isClickable = s.id < highestStep;
                return (
                  <li key={s.id}>
                    <button
                      className={`flex items-center w-full text-left transition-opacity ${isClickable ? "cursor-pointer" : "cursor-default opacity-50"}`}
                      onClick={() => isClickable && goToStep(s.id)}
                      disabled={!isClickable}
                      aria-current={isCurrent ? 'step' : undefined}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 transition-colors duration-300 ${isCurrent || isCompleted ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}>
                        {isCompleted ? <CheckCircleIcon className="w-5 h-5" /> : s.id}
                      </div>
                      <span className={`font-medium transition-colors duration-300 ${isCurrent || isCompleted ? "text-blue-600" : "text-gray-500"}`}>
                        {s.name}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
        <div className="w-3/4 p-8 flex items-center bg-slate-50">
          {/* 3. PASSING PROPS: formData and handleInputChange are passed to every step */}
          {step === 1 && <Step1 nextStep={nextStep} handleInputChange={handleInputChange} formData={formData} />}
          {step === 2 && <Step2 nextStep={nextStep} prevStep={prevStep} handleInputChange={handleInputChange} formData={formData} />}
          {step === 3 && <Step3 nextStep={nextStep} prevStep={prevStep} handleInputChange={handleInputChange} formData={formData} />}
          {step === 4 && <Step4 prevStep={prevStep} handleSubmit={handleSubmit} handleInputChange={handleInputChange} formData={formData} />}
        </div>
      </div>
    </div>
  );
}


type Step1Props = {
  nextStep: () => void;
  handleInputChange: (field: string, value: string | number | boolean) => void;
  formData: {
    title: string;
    dateType: string;
    onDate: string;
    beforeDate: string;
    needsTimeOfDay: boolean;
    timeOfDay: string;
    isHomeTask: boolean;
    location: string;
    cleanType: string;
    bedrooms: string;
    rooms: string;
    bringSupplies: boolean;
    cleaningDetails: string;
    budget: string;
  };
};

function Step1({ nextStep, handleInputChange, formData }: Step1Props) {
  const timeSlots = ["Morning Before 10am", "Morning After 10am", "Evening Before 10pm", "Evening After 10pm"];
  
  // VALIDATION: Check for title before proceeding
  const handleNext = () => {
    if (formData.title.trim() === "") {
      alert("Please enter a title for your task.");
      return;
    }
    nextStep();
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full">
      <h2 className="text-xl font-semibold mb-4">Let&apos;s start with the basics</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">In a few words, what do you need done?</label>
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder="e.g. End of lease house clean"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">When do you need this done?</label>
        <div className="flex space-x-2">
          <button onClick={() => handleInputChange('dateType', 'on')} className={`p-2 rounded-md border w-1/3 ${formData.dateType === 'on' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white'}`}>On Date</button>
          <button onClick={() => handleInputChange('dateType', 'before')} className={`p-2 rounded-md border w-1/3 ${formData.dateType === 'before' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white'}`}>Before Date</button>
          <button onClick={() => handleInputChange('dateType', 'flexible')} className={`p-2 rounded-md border w-1/3 ${formData.dateType === 'flexible' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white'}`}>&apos;I&apos;m flexible&apos;</button>
        </div>
        {/* CORRECTED: Conditional date input logic */}
        {(formData.dateType === 'on' || formData.dateType === 'before') && (
        <div className="relative w-full mt-2">
           <input 
              type="date" 
              value={formData.dateType === 'on' ? formData.onDate : formData.beforeDate} 
              onChange={(e) => handleInputChange(formData.dateType === 'on' ? 'onDate' : 'beforeDate', e.target.value)} 
              className="w-full p-2 border border-gray-300 rounded-md" 
            />
        </div>
        )}
      </div>
      <div className="mb-4">
        <label className="flex items-center cursor-pointer">
          <input type="checkbox" className="mr-2 h-4 w-4" checked={formData.needsTimeOfDay} onChange={(e) => handleInputChange('needsTimeOfDay', e.target.checked)} />
          I need a certain time of day
        </label>
      </div>
      {formData.needsTimeOfDay && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          {timeSlots.map(slot => (
            <button key={slot} onClick={() => handleInputChange('timeOfDay', slot)} className={`p-2 rounded-md border ${formData.timeOfDay === slot ? 'bg-blue-600 text-white border-blue-600' : 'bg-white'}`}>{slot}</button>
          ))}
        </div>
      )}
      <button onClick={handleNext} className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-colors">Next</button>
    </div>
  );
}

type Step2Props = {
  nextStep: () => void;
  prevStep: () => void;
  handleInputChange: (field: string, value: string | number | boolean) => void;
  formData: {
    title: string;
    dateType: string;
    onDate: string;
    beforeDate: string;
    needsTimeOfDay: boolean;
    timeOfDay: string;
    isHomeTask: boolean;
    location: string;
    cleanType: string;
    bedrooms: string;
    rooms: string;
    bringSupplies: boolean;
    cleaningDetails: string;
    budget: string;
  };
};

function Step2({ nextStep, prevStep, handleInputChange, formData }: Step2Props) {

  // VALIDATION: Check for location before proceeding
  const handleNext = () => {
    if (formData.location.trim() === "") {
      alert("Please enter a location.");
      return;
    }
    nextStep();
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full">
      <h2 className="text-xl font-semibold mb-4">Tell us where</h2>
      <div className="mb-4">
        <p className="block text-sm font-medium text-gray-700 mb-2">Is this a home cleaning task?</p>
        <div className="flex space-x-2">
          <button onClick={() => handleInputChange('isHomeTask', true)} className={`w-1/2 p-2 rounded-md border ${formData.isHomeTask ? 'bg-blue-600 text-white border-blue-600' : 'bg-white'}`}>Yes</button>
          <button onClick={() => handleInputChange('isHomeTask', false)} className={`w-1/2 p-2 rounded-md border ${!formData.isHomeTask ? 'bg-blue-600 text-white border-blue-600' : 'bg-white'}`}>No</button>
        </div>
      </div>
      <div className="mb-4">
        <p className="block text-sm font-medium text-gray-700 mb-2">Where do you need this done?</p>
        <div className="relative">
          <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Enter suburb or postcode" value={formData.location} onChange={(e) => handleInputChange('location', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md pl-10" />
        </div>
      </div>
      <div className="flex justify-between mt-6">
        <button onClick={prevStep} className="bg-gray-200 p-2 rounded-md px-4 hover:bg-gray-300 transition-colors">Back</button>
        <button onClick={handleNext} className="bg-blue-600 text-white p-2 rounded-md px-4 hover:bg-blue-700 transition-colors">Next</button>
      </div>
    </div>
  );
}

type Step3Props = {
  nextStep: () => void;
  prevStep: () => void;
  handleInputChange: (field: string, value: string | number | boolean) => void;
  formData: {
    title: string;
    dateType: string;
    onDate: string;
    beforeDate: string;
    needsTimeOfDay: boolean;
    timeOfDay: string;
    isHomeTask: boolean;
    location: string;
    cleanType: string;
    bedrooms: string;
    rooms: string;
    bringSupplies: boolean;
    cleaningDetails: string;
    budget: string;
  };
};

function Step3({ nextStep, prevStep, handleInputChange, formData }: Step3Props) {
  const bedroomCounts = ["None", "1", "2", "3", "4", "5+"];
  const roomCounts = ["None", "1", "2", "3", "4", "5+"];

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full">
      <h2 className="text-xl font-semibold mb-4">Provide more details</h2>
      <div className="mb-4">
        <p className="block text-sm font-medium text-gray-700 mb-2">What type of clean do you need?</p>
        <div className="flex space-x-2">
            <button onClick={() => handleInputChange('cleanType', 'Regular')} className={`p-2 rounded-md border flex-grow ${formData.cleanType === 'Regular' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white'}`}>Regular</button>
            <button onClick={() => handleInputChange('cleanType', 'End of Lease')} className={`p-2 rounded-md border flex-grow ${formData.cleanType === 'End of Lease' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white'}`}>End of Lease</button>
        </div>
      </div>
      <div className="mb-4">
        <p className="block text-sm font-medium text-gray-700 mb-2">How many bedrooms?</p>
        <div className="grid grid-cols-6 gap-2">
            {bedroomCounts.map(count => (
                <button key={count} onClick={() => handleInputChange('bedrooms', count)} className={`p-2 rounded-md border ${formData.bedrooms === count ? 'bg-blue-600 text-white border-blue-600' : 'bg-white'}`}>{count}</button>
            ))}
        </div>
      </div>
      <div className="mb-4">
        <p className="block text-sm font-medium text-gray-700 mb-2">How many other rooms?</p>
        <div className="grid grid-cols-6 gap-2">
            {roomCounts.map(count => (
                <button key={count} onClick={() => handleInputChange('rooms', count)} className={`p-2 rounded-md border ${formData.rooms === count ? 'bg-blue-600 text-white border-blue-600' : 'bg-white'}`}>{count}</button>
            ))}
        </div>
      </div>
       <div className="mb-4">
        <p className="block text-sm font-medium text-gray-700 mb-2">Should the cleaner bring equipment and supplies?</p>
        <div className="flex space-x-2">
            <button onClick={() => handleInputChange('bringSupplies', true)} className={`w-1/2 p-2 rounded-md border ${formData.bringSupplies ? 'bg-blue-600 text-white border-blue-600' : 'bg-white'}`}>Yes, bring supplies</button>
            <button onClick={() => handleInputChange('bringSupplies', false)} className={`w-1/2 p-2 rounded-md border ${!formData.bringSupplies ? 'bg-blue-600 text-white border-blue-600' : 'bg-white'}`}>No, I will provide</button>
        </div>
      </div>
      <div className="mb-4">
        <p className="block text-sm font-medium text-gray-700 mb-2">What else needs cleaning?</p>
        <textarea placeholder="E.g. carpets vacuumed, oven cleaned" value={formData.cleaningDetails} onChange={(e) => handleInputChange('cleaningDetails', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md h-24"></textarea>
      </div>
      <div className="flex justify-between">
        <button onClick={prevStep} className="bg-gray-200 p-2 rounded-md px-4 hover:bg-gray-300 transition-colors">Back</button>
        <button onClick={nextStep} className="bg-blue-600 text-white p-2 rounded-md px-4 hover:bg-blue-700 transition-colors">Next</button>
      </div>
    </div>
  );
}

type Step4Props = {
  prevStep: () => void;
  handleSubmit: () => void;
  handleInputChange: (field: string, value: string | number | boolean) => void;
  formData: {
    title: string;
    dateType: string;
    onDate: string;
    beforeDate: string;
    needsTimeOfDay: boolean;
    timeOfDay: string;
    isHomeTask: boolean;
    location: string;
    cleanType: string;
    bedrooms: string;
    rooms: string;
    bringSupplies: boolean;
    cleaningDetails: string;
    budget: string;
  };
};

function Step4({ prevStep, handleSubmit, handleInputChange, formData }: Step4Props) {
  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full">
      <h2 className="text-xl font-semibold mb-4">Suggest your budget</h2>
      <p className="text-sm text-gray-500 mb-4">You can always negotiate the final price.</p>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
        <input
          type="number"
          placeholder="Enter budget"
          value={formData.budget}
          onChange={(e) => handleInputChange('budget', e.target.value)}
          className="w-full p-2 pl-6 border border-gray-300 rounded-md"
        />
      </div>
      <div className="flex justify-between mt-6">
        <button onClick={prevStep} className="bg-gray-200 p-2 rounded-md px-4 hover:bg-gray-300 transition-colors">Back</button>
        <button onClick={handleSubmit} className="bg-blue-600 text-white p-2 rounded-md px-4 hover:bg-blue-700 transition-colors">Post Task</button>
      </div>
    </div>
  );
}