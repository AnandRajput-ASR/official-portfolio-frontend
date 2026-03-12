import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { ContentService } from '../../../core/services/content.service';
import { BlogPost, PortfolioContent } from '../../../core/models/portfolio.model';

@Component({
  selector: 'app-blog-view',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="bv-page" *ngIf="post; else loading">
      <!-- Back nav -->
      <div class="bv-topbar">
        <button class="bv-back" (click)="goBack()">← Back to Portfolio</button>
        <span class="bv-reading-time">{{ post.readingTime }} min read</span>
      </div>

      <!-- Hero -->
      <header class="bv-header">
        <div class="bv-tags">
          <span class="bv-tag" *ngFor="let tag of post.tags">{{ tag }}</span>
        </div>
        <h1 class="bv-title">{{ post.title }}</h1>
        <p class="bv-excerpt">{{ post.excerpt }}</p>
        <div class="bv-meta">
          <span class="bv-author">{{ authorName }}</span>
          <span class="bv-sep">·</span>
          <span class="bv-date">{{ post.publishedAt | date:'MMMM d, yyyy' }}</span>
        </div>
      </header>

      <!-- Content -->
      <article class="bv-content">
        <div class="bv-markdown" [innerHTML]="renderContent(post.content)"></div>
      </article>

      <!-- Footer -->
      <footer class="bv-footer">
        <button class="bv-back-footer" (click)="goBack()">← Back to Portfolio</button>
        <p class="bv-footer-note">Written by {{ authorName }} · {{ authorTitle }}</p>
      </footer>
    </div>

    <ng-template #loading>
      <div class="bv-loading">
        <div class="bv-loader"></div>
        <p>Loading article...</p>
      </div>
    </ng-template>

    <div class="bv-404" *ngIf="notFound">
      <span class="bv-404-icon">✍️</span>
      <h2>Article not found</h2>
      <p class="bv-404-sub">This article may have been removed or the link is incorrect.</p>
      <button class="bv-back" (click)="goBack()">← Back to Portfolio</button>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .bv-page {
      min-height: 100vh; background: var(--bg, #0d0d0d); color: var(--text, #f0ede8);
      font-family: 'Syne', sans-serif;
    }
    .bv-topbar {
      display: flex; justify-content: space-between; align-items: center;
      padding: 1.25rem 4rem; border-bottom: 1px solid var(--border, #222);
      position: sticky; top: 0; background: var(--bg, #0d0d0d); z-index: 100;
    }
    .bv-back {
      background: none; border: 1px solid var(--border, #222); color: var(--muted, #888);
      font-family: 'Space Mono', monospace; font-size: .7rem; letter-spacing: .1em;
      text-transform: uppercase; padding: .5rem 1rem; cursor: pointer;
      transition: all .2s;
      &:hover { border-color: var(--amber, #f5a623); color: var(--amber, #f5a623); }
    }
    .bv-reading-time {
      font-family: 'Space Mono', monospace; font-size: .65rem; color: var(--muted, #888);
      letter-spacing: .1em;
    }
    .bv-header {
      max-width: 740px; margin: 0 auto; padding: 4rem 2rem 2.5rem;
    }
    .bv-tags { display: flex; gap: .5rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
    .bv-tag {
      font-family: 'Space Mono', monospace; font-size: .6rem; letter-spacing: .1em;
      text-transform: uppercase; padding: .2rem .6rem; border: 1px solid var(--border, #222);
      color: var(--muted, #888);
    }
    .bv-title { font-size: clamp(1.75rem, 4vw, 2.75rem); font-weight: 800; line-height: 1.2; margin-bottom: 1rem; }
    .bv-excerpt { font-size: 1.05rem; color: var(--muted, #888); line-height: 1.7; margin-bottom: 1.5rem; }
    .bv-meta { display: flex; gap: .75rem; align-items: center; font-family: 'Space Mono', monospace; font-size: .7rem; color: var(--muted, #888); }
    .bv-sep { opacity: .4; }
    .bv-author { color: var(--amber, #f5a623); font-weight: 700; }

    .bv-content {
      max-width: 740px; margin: 0 auto; padding: 2.5rem 2rem 5rem;
      border-top: 1px solid var(--border, #222);
    }
    .bv-markdown {
        font-size: .95rem; line-height: 1.85; color: var(--text);

        h1,h2,h3,h4 { font-family: 'Syne', sans-serif; font-weight: 800;
          margin: 2rem 0 .75rem; line-height: 1.2; color: var(--text); }
        h1 { font-size: 1.8rem; }
        h2 { font-size: 1.4rem; border-bottom: 1px solid var(--border); padding-bottom: .4rem; }
        h3 { font-size: 1.15rem; }
        h4 { font-size: 1rem; color: var(--muted); }

        p  { margin: .9rem 0; color: var(--muted); }
        strong { color: var(--text); font-weight: 700; }
        em { color: var(--text); font-style: italic; }
        a  { color: var(--amber); text-decoration: underline; text-underline-offset: 3px;
             &:hover { opacity: .8; } }
        hr { border: none; border-top: 1px solid var(--border); margin: 2rem 0; }

        blockquote {
          border-left: 3px solid var(--amber); padding: .75rem 1.25rem;
          margin: 1.25rem 0; background: var(--amber-dim); color: var(--muted);
          font-style: italic;
        }

        ul, ol { padding-left: 1.5rem; margin: .9rem 0; color: var(--muted);
          li { margin: .35rem 0; line-height: 1.7; } }
        ul li { list-style: disc; }
        ol li { list-style: decimal; }

        .bv-inline-code {
          font-family: 'Space Mono', monospace; font-size: .82em;
          background: var(--surface2); border: 1px solid var(--border);
          padding: .1rem .35rem; color: var(--amber);
        }

        .bv-code-block {
          background: var(--surface2); border: 1px solid var(--border);
          border-left: 3px solid var(--amber);
          padding: 1.25rem 1.5rem; margin: 1.25rem 0;
          overflow-x: auto; font-family: 'Space Mono', monospace;
          font-size: .82rem; line-height: 1.65; color: #e0ddd8;
          code { background: none; border: none; padding: 0; color: inherit; }
        }
      }

    .bv-footer {
      border-top: 1px solid var(--border, #222); padding: 2rem 4rem;
      display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;
      .bv-back-footer { background: none; border: 1px solid var(--border, #222); color: var(--muted, #888); font-family: 'Space Mono', monospace; font-size: .65rem; letter-spacing: .1em; text-transform: uppercase; padding: .5rem 1.1rem; cursor: pointer; transition: all .2s;
        &:hover { border-color: var(--amber, #f5a623); color: var(--amber, #f5a623); } }
      .bv-footer-note { font-family: 'Space Mono', monospace; font-size: .65rem; color: var(--muted, #888); }
    }

    .bv-loading {
      display: flex; flex-direction: column; align-items: center; gap: 1rem;
      min-height: 100vh; justify-content: center;
      .bv-loader { width: 36px; height: 36px; border-radius: 50%; border: 3px solid var(--border, #222); border-top-color: var(--amber, #f5a623); animation: bv-spin .8s linear infinite; }
      p { font-family: 'Space Mono', monospace; font-size: .75rem; color: var(--muted, #888); }
    }
    .bv-404 { display: flex; flex-direction: column; align-items: center; gap: 1rem; min-height: 100vh; justify-content: center; text-align: center; padding: 2rem; }
    .bv-404-icon { font-size: 3rem; opacity: .4; }
    .bv-404-sub { color: var(--muted, #888); font-size: .9rem; max-width: 300px; }
    @keyframes bv-spin { to { transform: rotate(360deg); } }
    @media (max-width: 640px) { .bv-topbar, .bv-footer { padding-left: 1.25rem; padding-right: 1.25rem; } }
  `]
})
export class BlogViewComponent implements OnInit {
  post: BlogPost | null = null;
  notFound = false;
  authorName = 'Anand Rajput';
  authorTitle = 'Angular Developer & Azure Engineer';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private contentService: ContentService,
    private titleService: Title
  ) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    this.contentService.getAll().subscribe({
      next: (content) => {
        const found = content.blogPosts?.find(p => p.slug === slug && p.published);
        if (found) {
          this.post = found;
          // Fix #15: update browser tab title to article title
          this.titleService.setTitle(found.title + ' · ' + (content.hero?.name || 'Portfolio'));
        } else {
          this.notFound = true;
        }
        // Use dynamic author name from content
        if (content.hero?.name) this.authorName = content.hero.name;
        if (content.hero?.title) this.authorTitle = content.hero.title;
      },
      error: () => { this.notFound = true; }
    });
  }

  renderContent(raw: string): string {
    if (!raw) return '';
    let html = raw;

    // Escape HTML entities first (prevent XSS in content field)
    html = html.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

    // Fenced code blocks  ```lang\ncode\n```
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) =>
      `<pre class="bv-code-block${lang ? ' lang-'+lang : ''}"><code>${code.trimEnd()}</code></pre>`
    );

    // Headings
    html = html
      .replace(/^#{4} (.+)$/gm, '<h4>$1</h4>')
      .replace(/^#{3} (.+)$/gm, '<h3>$1</h3>')
      .replace(/^#{2} (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // Blockquote
    html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');

    // Horizontal rule
    html = html.replace(/^---$/gm, '<hr>');

    // Unordered list (- item)
    html = html.replace(/^(- .+\n?)+/gm, match => {
      const items = match.trim().split('\n').map(l => `<li>${l.slice(2).trim()}</li>`).join('');
      return `<ul>${items}</ul>`;
    });

    // Ordered list (1. item)
    html = html.replace(/^(\d+\. .+\n?)+/gm, match => {
      const items = match.trim().split('\n').map(l => `<li>${l.replace(/^\d+\.\s*/,'').trim()}</li>`).join('');
      return `<ol>${items}</ol>`;
    });

    // Inline: bold, italic, inline code, links
    html = html
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="bv-inline-code">$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

    // Paragraphs: wrap sequences of plain lines in <p>
    html = html.replace(/^(?!<[a-z]).+$/gm, match => `<p>${match}</p>`);

    // Clean up empty paragraphs
    html = html.replace(/<p><\/p>/g, '').replace(/<p>\s*<\/p>/g, '');

    return html;
  }

  goBack(): void { this.router.navigate(['/']); }
}
