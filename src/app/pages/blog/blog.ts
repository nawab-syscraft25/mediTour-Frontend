import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule, DatePipe, NgFor } from '@angular/common';
import { BannerService, Banner } from 'src/app/core/services/banner.service'; // ✅ import BannerService

interface BlogImage {
  id: number;
  owner_type: string | null;
  owner_id: number | null;
  url: string;
  is_primary: boolean;
  position: number | null;
  uploaded_at: string;
}

interface Blog {
  id: number;
  title: string;
  subtitle: string;
  content: string;
  excerpt: string;
  featured_image: string;
  meta_description: string | null;
  tags: string | null;
  category: string | null;
  author_name: string | null;
  reading_time: number | null;
  is_published: boolean;
  is_featured: boolean;
  published_at: string | null;
  slug: string;
  view_count: number;
  created_at: string;
  updated_at: string;
  images: BlogImage[];
}

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, NgFor, DatePipe],
  templateUrl: './blog.html',
  styleUrls: ['./blog.css']
})
export class BlogComponent implements OnInit {
  blogs: Blog[] = [];
  categories: string[] = [];
  baseUrl = 'http://165.22.223.163:8000'; // API base URL
  banner: Banner | null = null;           // 🔹 Blog banner

  constructor(private http: HttpClient, private bannerService: BannerService) {}

  ngOnInit(): void {
    // 🔹 Load Blog Banner
    this.bannerService.getBannerByTitle('Blog').subscribe({
      next: (banner) => {
        if (banner) {
          this.banner = banner;
          console.log('✅ Blog banner loaded:', this.banner);
        }
      },
      error: (err) => console.error('❌ Error loading blog banner:', err)
    });

    // 🔹 Load blogs
    this.http
      .get<Blog[]>(`${this.baseUrl}/api/v1/blogs?skip=0&limit=100&published_only=false&featured_only=false`)
      .subscribe((data) => {
        this.blogs = data || [];
        this.extractCategories();
      });
  }

  getImageUrl(path: string): string {
    return path ? this.baseUrl + path : 'assets/images/blog-img.png';
  }

  // Extract unique categories from blogs
  private extractCategories(): void {
    const allCategories = this.blogs
      .map(blog => blog.category)
      .filter(category => category !== null && category !== undefined && category.trim() !== '')
      .map(category => category!.trim().toUpperCase());
    
    // Get unique categories and sort them
    this.categories = [...new Set(allCategories)].sort();
  }

  // Method to filter blogs by category (for future use)
  filterByCategory(category: string): void {
    // Implementation for category filtering can be added later
    console.log('Filter by category:', category);
  }
}
