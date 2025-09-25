// src/app/core/services/doctor.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface DoctorImage {
  id: number;
  url: string;
  is_primary: boolean;
}

export interface Doctor {
  id: number;
  name: string;
  profile_photo: string;
  description: string;
  designation: string;
  experience_years: number | null;
  rating : number | null;
  hospital_id: number;
  gender: string;
  skills: string;
  qualifications: string;
  highlights: string;
  awards: string;
  images: DoctorImage[];
}

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  constructor(private apiService: ApiService) {}

  getDoctors(skip = 0, limit = 100): Observable<Doctor[]> {
    return this.apiService.get<Doctor[]>(
      `/api/v1/doctors?skip=${skip}&limit=${limit}`
    );
  }

  getDoctorById(id: number): Observable<Doctor> {
    return this.apiService.get<Doctor>(`/api/v1/doctors/${id}`);
  }
}
