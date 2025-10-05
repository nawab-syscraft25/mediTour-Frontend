import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { BannerService, Banner } from 'src/app/core/services/banner.service'; // ✅ import BannerService

interface BlogDetail {
  id: number;
  title: string;
  subtitle: string;
  content: string;
  excerpt: string;
  featured_image: string;
  published_at: string;
  images: { id: number; url: string }[];
}

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './blog-detail.html',
  styleUrls: ['./blog-detail.css']
})
export class BlogDetailComponent implements OnInit {
  blog!: BlogDetail;
  baseUrl = 'http://165.22.223.163:8000';
  banner: Banner | null = null; // 🔹 Blog Detail banner

  constructor(private route: ActivatedRoute, private http: HttpClient, private bannerService: BannerService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id'); // from /blog/:id
    if (id) {
      this.http
        .get<BlogDetail>(`${this.baseUrl}/api/v1/blogs/${id}`)
        .subscribe((data) => {
          this.blog = data;
        });
    }

    // 🔹 Load Blog Detail Banner
    this.bannerService.getBannerByTitle('Blog Detail').subscribe({
      next: (banner) => {
        if (banner) {
          this.banner = banner;
          console.log('✅ Blog Detail banner loaded:', this.banner);
        }
      },
      error: (err) => console.error('❌ Error loading blog detail banner:', err)
    });
  }

  getImageUrl(path: string): string {
    return path ? this.baseUrl + path : 'assets/images/blog-img.png';
  }
}
