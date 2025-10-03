import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = 'http://165.22.223.163:8000/api/v1/bookings';

  constructor(private http: HttpClient) {}

  createBooking(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }
}
