import api from './axios';

export interface KYCRequest {
  id: number;
  user_id: number;
  status: 'pending' | 'approved' | 'rejected';
  document_type: string;
  document_url: string;
  comment?: string;
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by?: number;
}

export const kycApi = {
  // Загрузить KYC-документ
  upload: async (documentType: string, file: File, comment?: string) => {
    const formData = new FormData();
    formData.append('document_type', documentType);
    formData.append('file', file);
    if (comment) formData.append('comment', comment);
    const response = await api.post('/kyc/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data as KYCRequest;
  },

  // Получить все заявки пользователя
  getStatus: async (): Promise<KYCRequest[]> => {
    const response = await api.get('/kyc/status');
    return response.data;
  },
}; 