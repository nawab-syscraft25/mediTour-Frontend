import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BookingRequest {
  first_name: string;
  last_name: string;
  email: string;
  mobile_no: string;
  treatment_id: number | null;
  budget: string;
  medical_history_file: string;
  doctor_preference: string;
  hospital_preference: string;
  user_query: string;
  travel_assistant: boolean;
  stay_assistant: boolean;
  personal_assistant: boolean;
}

export interface BookingResponse extends BookingRequest {
  id: number;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private baseUrl = 'http://165.22.223.163:8000';
  private apiUrl = `${this.baseUrl}/api/v1/bookings`;

  constructor(private http: HttpClient) {}

  createBooking(data: BookingRequest): Observable<BookingResponse> {
    const headers = new HttpHeaders({
      'accept': 'application/json',
      'Content-Type': 'application/json'
    });

    return this.http.post<BookingResponse>(this.apiUrl, data, { headers });
  }

  // File upload method - you can implement this when you have the endpoint
  uploadFile(file: File): Observable<{file_url: string}> {
    const formData = new FormData();
    formData.append('file', file);

    // This endpoint needs to be implemented on your backend
    return this.http.post<{file_url: string}>(`${this.baseUrl}/api/v1/upload`, formData);
  }

  // Validate file before upload
  validateFile(file: File): {valid: boolean, error?: string} {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/jpg'
    ];

    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 5MB' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Please upload a valid file (PDF, DOC, DOCX, JPG, PNG)' };
    }

    return { valid: true };
  }
}
