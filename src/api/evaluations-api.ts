import api from './api-client'; // Adjust relative path to your api-client file if needed

export interface CreateEvaluationDto {
  stars: number;
  textFr?: string;
  textAr?: string;
  isValid?: boolean;
  businessId: string;
}

export const createEvaluation = async (data: CreateEvaluationDto) => {
  const response = await api.post('/v1/evaluations', data);
  return response.data;
};

// Optional: If you implement a Reports module later
export const createReport = async (data: { reason: string; businessId: string }) => {
  const response = await api.post('/v1/reports', data);
  return response.data;
};