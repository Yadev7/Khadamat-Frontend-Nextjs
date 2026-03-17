import { NextResponse } from 'next/server';

export async function GET() {
  const Services = {
   cleaning: "Cleaning",
   plumbing: "Plumbing",
   gardening: "Gardening",
   handyman: "Handyman",
   electrical: "Electrical",
   painting: "Painting",
   carpentry: "Carpentry",
    moving: "Moving",
    tutoring: "Tutoring",
    babysitting: "Babysitting",
    pet_care: "Pet Care",
    photography: "Photography",
    event_planning: "Event Planning",
    personal_training: "Personal Training",
    beauty_services: "Beauty Services",
    wellness: "Wellness",
    tech_support: "Tech Support",
    automotive: "Automotive",
    catering: "Catering",
    landscaping: "Landscaping",
  };
  return NextResponse.json(Services);
}