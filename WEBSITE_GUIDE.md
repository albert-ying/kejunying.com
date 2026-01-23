# Kejun Ying Website - Technical Guide

This guide provides comprehensive documentation for maintaining and updating kejunying.com.

## Overview

- **Framework**: Hugo static site generator
- **Theme**: Custom (based on typography theme)
- **Hosting**: Netlify (auto-deploys from GitHub)
- **Domain**: kejunying.com

## Project Structure

```
kejunying.com/
├── assets/
│   └── custom_style.css      # Main custom CSS (primary styling file)
├── content/
│   ├── about/                # About page content
│   ├── cv/                   # CV page and files
│   │   ├── index.md          # CV page (embeds PDF)
│   │   ├── Ying_cv.pdf       # Latest CV PDF
│   │   └── Ying_cv.qmd       # Quarto source for CV
│   ├── research/             # Publications page
│   ├── talks/                # Talks page
│   └── poetry/               # Poetry page
├── layouts/
│   ├── index.html            # Homepage template
│   └── partials/             # Reusable template components
├── static/
│   ├── animations.js         # JavaScript for interactions
│   ├── images/               # Static images and SVGs
│   │   └── pub-*.svg         # Publication carousel images
│   └── cv/                   # Served CV files
└── config.toml               # Hugo configuration
```

## Key Files

### `assets/custom_style.css`
Primary stylesheet containing:
- CSS custom properties (colors, fonts, spacing)
- Typography system using Inter font
- Publications carousel styles
- Sidenote/section label styles
- Dark mode support
- Responsive breakpoints

**CSS Variables** (defined at `:root`):
```css
--font-sans: 'Inter', -apple-system, ...
--color-gold: #c9a959
--color-bronze: #8b7355
--color-text: #3a3a3a
--text-xs through --text-3xl: Font sizes
```

### `static/animations.js`
JavaScript functionality:
- Particle canvas background
- Cursor glow effect
- Publications carousel
- Scroll-triggered animations
- Page transitions

### `layouts/index.html`
Homepage template containing:
- Navigation menu
- Hero section with avatar
- Job market banner
- Introduction text
- **Publications carousel** (featured work)
- News section
- Social links

## Common Update Tasks

### 1. Update News Items

Edit `config.toml` in the `[params]` section:

```toml
[[params.news]]
  name = "Your news item text"
  url = "https://link.com"
  date = "Jan 2026"
```

News items are displayed in order listed.

### 2. Update CV

The CV is displayed as an embedded PDF:

1. Update `content/cv/Ying_cv.pdf` with the new version
2. Commit and push
3. Netlify auto-deploys

**Alternative**: If you need HTML CV (for Docker users):
```bash
./render_html_cv.sh  # Requires Docker
```

### 3. Update Publications Carousel

Edit `layouts/index.html` in the `pub-carousel` section:

```html
<div class="pub-card">
    <div class="pub-card-inner">
        <span class="pub-year">2025</span>
        <div class="pub-figure">
            <img src="/images/pub-NAME.svg" alt="Description">
        </div>
        <span class="pub-journal">Journal Name</span>
        <h3 class="pub-title"><a href="DOI_LINK">Paper Title</a></h3>
        <p class="pub-authors"><span class="highlight">K Ying</span>, Coauthors...</p>
        <p class="pub-tldr">One-sentence summary.</p>
    </div>
</div>
```

### 4. Create Publication SVG Images

SVGs should be:
- **Dimensions**: 400x180 viewBox
- **Style**: Minimalist, gold/bronze color scheme
- **Location**: `static/images/pub-PAPERID.svg`

Example SVG structure:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 180">
  <defs>
    <linearGradient id="gold" ...>
      <stop offset="0%" stop-color="#c9a959"/>
      <stop offset="100%" stop-color="#8b7355"/>
    </linearGradient>
  </defs>
  <rect fill="#faf8f5" width="400" height="180" rx="8"/>
  <!-- Content here -->
</svg>
```

### 5. Update Research/Publications Page

Edit `content/research/index.md`:
- Each publication uses `{{<sidenote>}}` for Altmetric badges
- Format: `#### [Title](DOI_LINK)` for paper title
- Authors with `<ins>**K Ying**</ins>` for highlighted name
- Optional `tldr:` for summary

### 6. Update Talks Page

Edit `content/talks/index.md`:
- Use `# **YEAR**` for year headings (styled as badges)
- Use `#### Title` for talk titles

## Styling Guidelines

### Color Palette
- **Primary Gold**: #c9a959
- **Bronze**: #8b7355
- **Background**: #faf8f5 (light), #141414 (dark)
- **Text**: #3a3a3a (light), #ece8e0 (dark)
- **Accent Red**: #b13f54 (for DamAge)
- **Accent Blue**: #51a1c4 (for AdaptAge)

### Typography
- **Body**: Inter, system fonts fallback
- **Serif** (quotes): source-serif-4
- **Weights**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)
- **Letter spacing**: -0.02em for headings

### Sidenote Labels
Small uppercase labels on the left margin:
- pages, news, featured work, socials
- Styled with `--text-xs`, `--color-bronze`, 50% opacity

## Deployment

### Automatic (Netlify)
1. Make changes
2. `git add . && git commit -m "message"`
3. `git push`
4. Netlify auto-builds and deploys (~1-2 min)

### Local Development
```bash
hugo server -D  # Starts dev server at localhost:1313
```

## Dark Mode

Dark mode is toggled via JavaScript and uses:
- `body.dark-mode` class
- CSS variables override in `body.dark-mode { ... }`
- Persisted in localStorage

## Responsive Design

Breakpoints:
- Mobile: < 768px
- Tablet: 768px - 1200px
- Desktop: > 1200px

Sidenotes move inline on mobile (< 1200px).

## Troubleshooting

### Changes Not Appearing
1. Restart Hugo server: `pkill -f "hugo server" && hugo server -D`
2. Hard refresh browser: Cmd+Shift+R
3. Check for Hugo build errors in terminal

### Fonts Not Loading
- Inter is loaded from Google Fonts via `@import`
- Fallback to system fonts if blocked

### CV Not Updating
- Ensure PDF is committed to `content/cv/`
- Check that `index.md` points to correct file
- Clear browser cache

## File Backups

Important files to backup:
- `config.toml` (site configuration)
- `content/` (all content)
- `assets/custom_style.css` (styling)
- `static/animations.js` (interactions)
- `layouts/index.html` (homepage)

---

*Last updated: January 2026*
