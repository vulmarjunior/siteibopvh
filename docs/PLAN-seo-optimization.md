# PLAN: SEO Optimization - Portal IBO

Plan to improve search engine visibility and generative engine optimization (GEO) for the Portal IBO project.

## Overview

The goal is to optimize the landing page for both human searchers (Google) and AI engines (ChatGPT, Claude), focusing on the church's doctrinal identity and local presence in Porto Velho.

- **Project Type:** WEB
- **Primary Agent:** `seo-specialist`
- **Secondary Agent:** `frontend-specialist`

## Success Criteria

- [ ] Passing scores in Lighthouse SEO audit (>90).
- [ ] Presence of all critical meta tags (Title, Meta Description, Open Graph).
- [ ] Valid Schema.org (JSON-LD) for the Organization.
- [ ] Elimination of Tailwind CDN in production (moving to built CSS).

## Tech Stack

- **Vite:** For building and bundling.
- **Tailwind CSS:** For styling (optimized build).
- **JSON-LD:** For structured data.

## File Structure Changes

- [NEW] `public/robots.txt`
- [NEW] `public/sitemap.xml`
- [MODIFY] `index.html` (Meta tags and structure)
- [MODIFY] `vite.config.ts` (Build optimization)

## Task Breakdown

### Phase 1: Technical & Performance SEO

| Task ID | Name | Agent | Skills | Priority | Dependencies |
|---------|------|-------|--------|----------|--------------|
| T1 | Optimize Build Setup | `frontend-specialist` | `react-best-practices` | P0 | None |
| | **INPUT:** Current `vite.config.ts` and `index.html` | | | | |
| | **OUTPUT:** `vite.config.ts` configured for optimization | | | | |
| | **VERIFY:** `npm run build` produces optimized CSS and JS without CDN scripts | | | | |

### Phase 2: Content & Social SEO

| Task ID | Name | Agent | Skills | Priority | Dependencies |
|---------|------|-------|--------|----------|--------------|
| T2 | Implement Meta Tags & OG | `seo-specialist` | `seo-fundamentals` | P1 | None |
| | **INPUT:** `index.html` and User Keywords | | | | |
| | **OUTPUT:** Semantic head section with Meta, OG, and Twitter cards | | | | |
| | **VERIFY:** Check metadata via browser tools or social preview simulators | | | | |

### Phase 3: Structured Data & Indexing

| Task ID | Name | Agent | Skills | Priority | Dependencies |
|---------|------|-------|--------|----------|--------------|
| T3 | JSON-LD & Search Assets | `seo-specialist` | `seo-fundamentals` | P2 | T2 |
| | **INPUT:** `index.html`, Church address/socials | | | | |
| | **OUTPUT:** `public/robots.txt`, `public/sitemap.xml`, and JSON-LD in `index.html` | | | | |
| | **VERIFY:** Use Schema Markup Validator and verify file paths | | | | |

## Phase X: Final Verification

- [ ] Run `python .agent/skills/performance-profiling/scripts/lighthouse_audit.py`
- [ ] Verify `robots.txt` and `sitemap.xml` in `dist/` after build.
- [ ] Manual check of meta tag content and hierarchy (H1 only once).
