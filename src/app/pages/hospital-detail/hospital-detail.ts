import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HospitalService, Hospital } from 'src/app/core/services/hospital.service';

@Component({
  selector: 'app-hospital-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hospital-detail.html',
  styleUrls: ['./hospital-detail.css']
})
export class HospitalDetail implements OnInit {
  hospital: Hospital | null = null;
  baseUrl = 'http://192.168.29.93:8000';

  constructor(
    private route: ActivatedRoute,
    private hospitalService: HospitalService
  ) { }

  facilityIcons: string[] = [
    'assets/images/dtl-bed.svg',     // 1st
    'assets/images/dtl-shield.svg',  // 2nd
    'assets/images/dtl-specialities.svg',       // 3rd
    'assets/images/dtl-facilities.svg',  // 4th
  ];

  featureIcon: string = 'assets/images/features-check.svg';
  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = +idParam;
      this.hospitalService.getHospitalById(id).subscribe({
        next: (data: Hospital) => {
          console.log('✅ Full hospital details:', data); // 👈 logs everything
          this.hospital = data;
        },
        error: (err: unknown) => {
          console.error('❌ Error fetching hospital detail:', err);
        }
      });
    }
  }
}
