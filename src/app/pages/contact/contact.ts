import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TreatmentService } from 'src/app/core/services/treatment.service'; // adjust path

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './contact.html',
  styleUrls: ['./contact.css']
})
export class ContactComponent implements OnInit {
  contactForm: FormGroup;
  treatmentTypes: string[] = []; // ✅ holds dropdown options
  isSubmitted: boolean = false; // Track form submission status

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private treatmentService: TreatmentService
  ) {
    this.contactForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mobile: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      department: ['', Validators.required],  // now dynamic from API
      query: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    // ✅ fetch treatment types on load
    this.treatmentService.getTreatmentTypes().subscribe({
      next: (types) => {
        this.treatmentTypes = types;
      },
      error: (err) => {
        console.error('Error loading treatment types ❌', err);
      }
    });
  }

  onSubmit() {
    if (this.contactForm.valid) {
      const payload = {
        first_name: this.contactForm.value.firstName,
        last_name: this.contactForm.value.lastName,
        email: this.contactForm.value.email,
        phone: String(this.contactForm.value.mobile),
        subject: 'Contact Form Submission',
        message: this.contactForm.value.query,
        service_type: this.contactForm.value.department
      };

      this.http.post('http://165.22.223.163:8000/api/v1/contact', payload)
        .subscribe({
          next: (res) => {
            console.log('Form Submitted ✅', res);
            this.isSubmitted = true;
            this.contactForm.reset();
          },
          error: (err) => {
            console.error('Form submission error ❌', err);
            alert('Something went wrong. Please try again.');
          }
        });
    } else {
      this.contactForm.markAllAsTouched();
    }
  }
}
