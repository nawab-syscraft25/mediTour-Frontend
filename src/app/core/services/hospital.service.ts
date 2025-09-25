import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface HospitalImage {
  id: number;
  url: string;
  is_primary: boolean;
}

export interface Hospital {
  id: number;
  name: string;
  description: string;
  location: string;
  phone: string;
  features: string;
  facilities: string;
  images: HospitalImage[];
}

@Injectable({
  providedIn: 'root'
})
export class HospitalService {
  constructor(private apiService: ApiService) {}

  getHospitals(skip = 0, limit = 100): Observable<Hospital[]> {
    return this.apiService.get<Hospital[]>(
      `/api/v1/hospitals?skip=${skip}&limit=${limit}`
    );
  }

  getHospitalById(id: number): Observable<Hospital> {
    return this.apiService.get<Hospital>(`/api/v1/hospitals/${id}`);
  }
}