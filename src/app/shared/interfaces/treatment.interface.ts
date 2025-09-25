export interface Treatment {
  id: number;
  name: string;
  short_description: string;
  long_description: string;
  treatment_type: string;
  price_min: number | null;
  price_max: number | null;
  price_exact: number | null;
  rating: number | null,
  hospital_id: number | null;
  other_hospital_name?: string | null;
  doctor_id: number | null;
  other_doctor_name?: string | null;
  location: string;
  created_at: string;
  images?: TreatmentImage[];   // <-- add this line
}
export interface TreatmentImage {
  id: number;
  owner_type?: string | null;
  owner_id?: number | null;
  url: string;
  is_primary: boolean;
  position: number;
  uploaded_at: string;
}


export interface TreatmentSearchParams {
  skip?: number;
  limit?: number;
  location?: string;
  treatment_type?: string;
}