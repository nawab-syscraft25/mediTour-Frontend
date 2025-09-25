// src/app/pages/doctors/doctors.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DoctorService, Doctor } from 'src/app/core/services/doctors.service';
import { HospitalService, Hospital } from 'src/app/core/services/hospital.service';

@Component({
  selector: 'app-doctors',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './doctors.html',
  styleUrls: ['./doctors.css']
})
export class Doctors implements OnInit {
  doctors: (Doctor & { hospitalName?: string })[] = [];
  hospitalCache: { [id: number]: string } = {}; // avoid duplicate hospital API calls
  loading = true;

  constructor(
    private doctorService: DoctorService,
    private hospitalService: HospitalService
  ) {}

  getStars(rating: number | null): ('full' | 'half' | 'empty')[] {
    if (rating === null) {
      return Array(5).fill('empty');
    }

    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;

    return [
      ...Array(fullStars).fill('full'),
      ...Array(halfStar).fill('half'),
      ...Array(emptyStars).fill('empty')
    ];
  }

  ngOnInit(): void {
    console.log('Doctors component initialized...');

    this.doctorService.getDoctors().subscribe({
      next: (data: Doctor[]) => {
        console.log('✅ Doctor API raw data:', data);

        // ✅ sort doctors by rating (high → low, null last)
        this.doctors = data.sort((a, b) => {
          const ratingA = a.rating ?? 0;
          const ratingB = b.rating ?? 0;
          return ratingB - ratingA;
        });

        // fetch hospital names
        this.doctors.forEach((doc, index) => {
          console.log(`👨‍⚕️ Doctor ${index + 1}:`, {
            id: doc.id,
            name: doc.name,
            profile_photo: doc.profile_photo,
            qualifications: doc.qualifications,
            experience_years: doc.experience_years,
            description: doc.description,
            hospital_id: doc.hospital_id,
          });

          const hospitalId = doc.hospital_id;

          if (this.hospitalCache[hospitalId]) {
            // already cached
            this.doctors[index].hospitalName = this.hospitalCache[hospitalId];
          } else {
            // fetch hospital name once
            this.hospitalService.getHospitalById(hospitalId).subscribe({
              next: (hospital: Hospital) => {
                this.hospitalCache[hospitalId] = hospital.name;
                this.doctors[index].hospitalName = hospital.name;
                console.log(`🏥 Hospital fetched for ID ${hospitalId}: ${hospital.name}`);
              },
              error: (err) => {
                console.error(`❌ Error fetching hospital with ID ${hospitalId}:`, err);
              }
            });
          }
        });

        this.loading = false;
      },
      error: (err: unknown) => {
        console.error('❌ Error loading doctors:', err);
        this.loading = false;
      }
    });
  }
}
