import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule, DatePipe, NgFor } from '@angular/common';
import { BannerService, Banner } from 'src/app/core/services/banner.service'; // ✅ import BannerService

interface Blog {
  id: number;
  title: string;
  excerpt: string;
  featured_image: string;
  slug: string;
  published_at: string;
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
      });
  }

  getImageUrl(path: string): string {
    return path ? this.baseUrl + path : 'assets/images/blog-img.png';
  }
}
