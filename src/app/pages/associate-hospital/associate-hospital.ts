import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HospitalService, Hospital } from 'src/app/core/services/hospital.service';

@Component({
  selector: 'app-associate-hospital',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './associate-hospital.html',
  styleUrls: ['./associate-hospital.css']
})
export class AssociateHospital implements OnInit {
  hospitals: Hospital[] = [];
  loading = true;

  constructor(private hospitalService: HospitalService) {}

  ngOnInit(): void {
    this.hospitalService.getHospitals().subscribe({
      next: (data) => {
        this.hospitals = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading hospitals:', err);
        this.loading = false;
      }
    });
  }
}