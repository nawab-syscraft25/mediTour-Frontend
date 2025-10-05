import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OfferService {
  private baseUrl = 'http://165.22.223.163:8000/api/v1/api/v1/offers';

  constructor(private http: HttpClient) {}

  // Fetch single offer by ID
  getOfferById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  // Optionally: fetch all offers
  getAllOffers(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }
}
