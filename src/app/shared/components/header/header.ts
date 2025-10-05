import { Component, OnInit, OnDestroy, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TreatmentService } from 'src/app/core/services/treatment.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, Subscription } from 'rxjs';
import { User } from 'src/app/shared/interfaces/api.interface';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  isMenuOpen = false;
  showSearchBox = false;
  showUserDropdown = false;

  searchQuery: string = '';
  searchResults: any = null; // stores doctors, treatments, hospitals
  private searchSubject = new Subject<string>();
  private subscription = new Subscription();

  // Authentication state
  currentUser: User | null = null;
  isAuthenticated = false;

  @ViewChild('searchContainer') searchContainer!: ElementRef;

  constructor(
    private treatmentService: TreatmentService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to authentication state
    const authSub = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isAuthenticated = !!user;
    });
    this.subscription.add(authSub);

    // Check initial authentication state
    this.isAuthenticated = this.authService.isAuthenticated();

    // Debounce search input
    const searchSub = this.searchSubject
      .pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe((query) => {
        if (query && query.length > 2) {
          this.treatmentService.searchAll(query, 10).subscribe({
            next: (data) => {
              // API returns { query, total_results, results: { doctors, treatments, hospitals } }
              this.searchResults = data.results;
            },
            error: (err) => {
              console.error('Search error:', err);
              this.searchResults = null;
            }
          });
        } else {
          this.searchResults = null;
        }
      });
    this.subscription.add(searchSub);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleSearchBox() {
    this.showSearchBox = !this.showSearchBox;
    this.searchResults = null;
    this.searchQuery = '';
  }

  toggleUserDropdown() {
    this.showUserDropdown = !this.showUserDropdown;
  }

  logout() {
    this.authService.logout();
    this.showUserDropdown = false;
    this.router.navigate(['/']);
  }

  navigateToProfile() {
    this.showUserDropdown = false;
    this.router.navigate(['/dashboard']);
  }

  onSearchChange(query: string) {
    this.searchSubject.next(query);
  }

  toSlug(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '-');
  }

  onSearchSubmit(): void {
    if (this.searchQuery && this.searchQuery.trim().length > 0) {
      this.router.navigate(['/search'], { 
        queryParams: { q: this.searchQuery.trim() } 
      });
      this.showSearchBox = false;
      this.searchResults = null;
    }
  }

  navigateToSearchResults(): void {
    this.onSearchSubmit();
  }

  selectSearchResult(type: string, id: number): void {
    this.showSearchBox = false;
    this.searchResults = null;
    
    switch (type) {
      case 'doctor':
        this.router.navigate(['/doctor-details', id]);
        break;
      case 'treatment':
        this.router.navigate(['/treatment-detail', id]);
        break;
      case 'hospital':
        this.router.navigate(['/hospital-detail', id]);
        break;
    }
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    
    // Handle search box click outside
    if (
      this.showSearchBox &&
      this.searchContainer &&
      !this.searchContainer.nativeElement.contains(target)
    ) {
      this.showSearchBox = false;
      this.searchResults = null;
    }

    // Handle user dropdown click outside
    if (this.showUserDropdown && !target.closest('.user-dropdown-container')) {
      this.showUserDropdown = false;
    }
  }
}
