# Tenkasi Strapi API — Integration Knowledge Base

> Generated from OpenAPI documentation v1.0.0 (2026-03-14)  
> Base URL: `http://localhost:1337/api`  
> Authentication: Bearer token (JWT)

---

## Table of Contents

1. [Setup & Configuration](#1-setup--configuration)
2. [Common Query Parameters](#2-common-query-parameters)
3. [TypeScript Interfaces](#3-typescript-interfaces)
4. [API Client Utility](#4-api-client-utility)
5. [Endpoints Reference](#5-endpoints-reference)
   - [Elected Representatives](#51-elected-representatives)
   - [Galleries](#52-galleries)
   - [Hero Images](#53-hero-images)
   - [Leadership](#54-leadership)
   - [Party Wings](#55-party-wings)
   - [Recent Updates](#56-recent-updates)
   - [Tenkasi Union & Town Secretaries](#57-tenkasi-union--town-secretaries)
   - [Test Union Achievements](#58-test-union-achievements)
  - [Wing Members](#59-wing-members)
  - [Media / Upload Files](#510-media--upload-files)
6. [Response Shape Reference](#6-response-shape-reference)
7. [Next.js Usage Examples](#7-nextjs-usage-examples)
8. [Error Handling](#8-error-handling)

---

## 1. Setup & Configuration

### Environment Variables

```env
# .env.local
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
NEXT_PUBLIC_STRAPI_API_URL=http://localhost:1337/api
STRAPI_API_TOKEN=your_api_token_here
```

### Base API Config (`lib/strapi.ts`)

```typescript
export const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337';
export const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL ?? 'http://localhost:1337/api';
export const API_TOKEN = process.env.STRAPI_API_TOKEN ?? '';

export const defaultHeaders: HeadersInit = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${API_TOKEN}`,
};

/**
 * Converts a Strapi relative media URL to an absolute URL.
 * Usage: getMediaUrl(item.image?.url)
 */
export function getMediaUrl(url?: string | null): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${STRAPI_URL}${url}`;
}
```

---

## 2. Common Query Parameters

All collection `GET` endpoints accept the following query parameters:

| Parameter | Type | Description | Example |
|---|---|---|---|
| `sort` | `string` | Sort by field(s), asc/desc | `sort=name:asc` |
| `pagination[page]` | `integer` | Page number (default: 0) | `pagination[page]=1` |
| `pagination[pageSize]` | `integer` | Items per page (default: 25) | `pagination[pageSize]=10` |
| `pagination[start]` | `integer` | Offset (alternative to page) | `pagination[start]=0` |
| `pagination[limit]` | `integer` | Limit (alternative to pageSize) | `pagination[limit]=10` |
| `pagination[withCount]` | `boolean` | Include total count (default: true) | `pagination[withCount]=true` |
| `fields` | `string` | Comma-separated fields to return | `fields=name,title` |
| `populate` | `string` | Relations/media to populate | `populate=image,photos` |
| `filters` | `object` | Filter conditions (deepObject) | `filters[name][$eq]=John` |
| `locale` | `string` | Locale for i18n content | `locale=en` |

### Populate Deep

```
populate=*                          — populate all first-level relations
populate=image                      — populate a specific media field
populate[0]=image&populate[1]=photos — populate multiple relations
populate[wing_memebers][populate]=profile — nested populate
```

---

## 3. TypeScript Interfaces

```typescript
// ─── Shared Types ─────────────────────────────────────────────────────────────

export interface StrapiMeta {
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
}

export interface StrapiListResponse<T> {
  data: T[];
  meta: StrapiMeta;
}

export interface StrapiSingleResponse<T> {
  data: T;
  meta: Record<string, unknown>;
}

export interface StrapiError {
  data: null;
  error: {
    status: number;
    name: string;
    message: string;
    details: Record<string, unknown>;
  };
}

// ─── Media / UploadFile ────────────────────────────────────────────────────────

export interface StrapiMedia {
  id: string | number;
  documentId: string;
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: number;
  height: number;
  formats: {
    thumbnail?: MediaFormat;
    small?: MediaFormat;
    medium?: MediaFormat;
    large?: MediaFormat;
  };
  hash: string;
  ext: string;
  mime: string;
  size: number;           // in KB
  url: string;            // relative path — use getMediaUrl(url) for absolute
  previewUrl: string | null;
  provider: string;
  createdAt: string;      // ISO date-time
  updatedAt: string;
}

export interface MediaFormat {
  name: string;
  hash: string;
  ext: string;
  mime: string;
  width: number;
  height: number;
  size: number;
  url: string;
}

// ─── Elected Representative ────────────────────────────────────────────────────

export interface ElectedRepresentative {
  id: string | number;
  documentId: string;
  title: string;          // e.g. "MLA", "MP"
  name: string;
  achievements: string;   // rich text / plain text
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

// ─── Gallery ──────────────────────────────────────────────────────────────────

export interface Gallery {
  id: string | number;
  documentId: string;
  event: string;          // event name / description
  images: StrapiMedia[];  // requires populate=images
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

// ─── Hero Image ───────────────────────────────────────────────────────────────

export interface HeroImage {
  id: string | number;
  documentId: string;
  heroImage: StrapiMedia | null; // requires populate=heroImage
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

// ─── Leadership ───────────────────────────────────────────────────────────────

export interface Leadership {
  id: string | number;
  documentId: string;
  designation: string;    // job title / role
  name: string;
  image: StrapiMedia | null; // requires populate=image
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

// ─── Party Wing ───────────────────────────────────────────────────────────────

export interface WingMember {
  id: string | number;
  documentId: string;
  name: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface PartyWing {
  id: string | number;
  documentId: string;
  wingName: string;
  wing_memebers: WingMember[]; // requires populate=wing_memebers
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

// ─── Recent Update ────────────────────────────────────────────────────────────

export interface RecentUpdate {
  id: string | number;
  documentId: string;
  title: string;
  description: string;    // rich text / plain text
  data: string;           // ISO date (date only, not datetime)
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

// ─── Tenkasi Union & Town Secretary ───────────────────────────────────────────

export interface TenkasiUnionAndTownSecretary {
  id: string | number;
  documentId: string;
  name: string;           // area / unit name
  representative: string; // representative name
  type: string;           // union or town
  bio: string;
  image: StrapiMedia | null; // requires populate=image
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

// ─── Test Union Achievement ───────────────────────────────────────────────────

export interface TestUnionAchivement {
  id: string | number;
  documentId: string;
  title: string;
  serviceType: string;
  slogans: string;
  photos: StrapiMedia[];  // requires populate=photos
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}
```

---

## 4. API Client Utility

```typescript
// lib/api.ts
import { API_URL, defaultHeaders } from './strapi';
import type {
  StrapiListResponse,
  StrapiSingleResponse,
  StrapiError,
} from './types';

type QueryParams = Record<string, string | number | boolean | undefined>;

function buildQueryString(params: QueryParams): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    }
  }
  return parts.length ? `?${parts.join('&')}` : '';
}

export async function fetchList<T>(
  endpoint: string,
  params: QueryParams = {}
): Promise<StrapiListResponse<T>> {
  const qs = buildQueryString(params);
  const res = await fetch(`${API_URL}${endpoint}${qs}`, {
    headers: defaultHeaders,
    next: { revalidate: 60 }, // ISR: revalidate every 60 seconds
  });
  if (!res.ok) {
    const err: StrapiError = await res.json();
    throw new Error(err.error?.message ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

export async function fetchSingle<T>(
  endpoint: string,
  id: string | number,
  params: QueryParams = {}
): Promise<StrapiSingleResponse<T>> {
  const qs = buildQueryString(params);
  const res = await fetch(`${API_URL}${endpoint}/${id}${qs}`, {
    headers: defaultHeaders,
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    const err: StrapiError = await res.json();
    throw new Error(err.error?.message ?? `Request failed: ${res.status}`);
  }
  return res.json();
}
```

---

## 5. Endpoints Reference

### 5.1 Elected Representatives

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/elected-representatives` | List all elected representatives |
| `GET` | `/elected-representatives/{id}` | Get a single elected representative by ID |

**Fields:** `id`, `documentId`, `title`, `name`, `achievements`  
**Media:** none  
**Populate needed:** none

#### List Response
```json
{
  "data": [
    {
      "id": 1,
      "documentId": "abc123",
      "title": "MLA",
      "name": "K. Rajasekar",
      "achievements": "Built 50 schools...",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "publishedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "pagination": { "page": 1, "pageSize": 25, "pageCount": 1, "total": 1 }
  }
}
```

#### Next.js Fetch
```typescript
import { fetchList } from '@/lib/api';
import type { ElectedRepresentative } from '@/lib/types';

const { data } = await fetchList<ElectedRepresentative>('/elected-representatives');
```

---

### 5.2 Galleries

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/galleries` | List all gallery entries |
| `GET` | `/galleries/{id}` | Get a single gallery entry by ID |

**Fields:** `id`, `documentId`, `event`, `images`  
**Media:** `images` (array of media objects)  
**Populate needed:** `populate=images`

#### List Response
```json
{
  "data": [
    {
      "id": 1,
      "documentId": "abc123",
      "event": "Party Annual Meet 2024",
      "images": [
        {
          "id": 10,
          "documentId": "img001",
          "name": "meet-photo.jpg",
          "url": "/uploads/meet-photo_abc123.jpg",
          "width": 1920,
          "height": 1080,
          "mime": "image/jpeg",
          "size": 245.6,
          "formats": {
            "thumbnail": { "url": "/uploads/thumbnail_meet-photo_abc123.jpg", "width": 245, "height": 156 },
            "small":     { "url": "/uploads/small_meet-photo_abc123.jpg",     "width": 500, "height": 281 },
            "medium":    { "url": "/uploads/medium_meet-photo_abc123.jpg",    "width": 750, "height": 422 },
            "large":     { "url": "/uploads/large_meet-photo_abc123.jpg",     "width": 1000,"height": 563 }
          }
        }
      ],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "publishedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "pagination": { "page": 1, "pageSize": 25, "pageCount": 1, "total": 1 }
  }
}
```

#### Next.js Fetch
```typescript
import { fetchList } from '@/lib/api';
import type { Gallery } from '@/lib/types';

const { data } = await fetchList<Gallery>('/galleries', { populate: 'images' });
```

---

### 5.3 Hero Images

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/hero-images` | List all hero image entries |
| `GET` | `/hero-images/{id}` | Get a single hero image entry by ID |

**Fields:** `id`, `documentId`, `heroImage`  
**Media:** `heroImage` (single media object)  
**Populate needed:** `populate=heroImage`

#### List Response
```json
{
  "data": [
    {
      "id": 1,
      "documentId": "abc123",
      "heroImage": {
        "id": 5,
        "documentId": "img005",
        "name": "hero-banner.jpg",
        "url": "/uploads/hero-banner_abc123.jpg",
        "width": 1920,
        "height": 600,
        "mime": "image/jpeg",
        "size": 320.4,
        "alternativeText": "Tenkasi hero banner",
        "formats": {
          "large": { "url": "/uploads/large_hero-banner_abc123.jpg", "width": 1000, "height": 313 }
        }
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "publishedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "pagination": { "page": 1, "pageSize": 25, "pageCount": 1, "total": 1 }
  }
}
```

#### Next.js Fetch
```typescript
import { fetchList } from '@/lib/api';
import type { HeroImage } from '@/lib/types';

// Usually only one hero image entry will exist
const { data } = await fetchList<HeroImage>('/hero-images', { populate: 'heroImage' });
const hero = data[0]; // use the first entry
```

---

### 5.4 Leadership

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/leaderships` | List all leadership entries |
| `GET` | `/leaderships/{id}` | Get a single leadership entry by ID |

**Fields:** `id`, `documentId`, `designation`, `name`, `image`  
**Media:** `image` (single media object)  
**Populate needed:** `populate=image`

#### List Response
```json
{
  "data": [
    {
      "id": 1,
      "documentId": "abc123",
      "designation": "District Secretary",
      "name": "M. Ganesan",
      "image": {
        "id": 7,
        "documentId": "img007",
        "name": "ganesan.jpg",
        "url": "/uploads/ganesan_abc123.jpg",
        "width": 400,
        "height": 400,
        "mime": "image/jpeg",
        "alternativeText": "M. Ganesan",
        "formats": {
          "thumbnail": { "url": "/uploads/thumbnail_ganesan_abc123.jpg", "width": 245, "height": 245 }
        }
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "publishedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "pagination": { "page": 1, "pageSize": 25, "pageCount": 1, "total": 5 }
  }
}
```

#### Next.js Fetch
```typescript
import { fetchList } from '@/lib/api';
import type { Leadership } from '@/lib/types';

const { data, meta } = await fetchList<Leadership>('/leaderships', {
  populate: 'image',
  sort: 'designation:asc',
});
```

---

### 5.5 Party Wings

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/party-wings` | List all party wings |
| `GET` | `/party-wings/{id}` | Get a single party wing by ID |

**Fields:** `id`, `documentId`, `wingName`, `wing_memebers`  
**Relations:** `wing_memebers` (array of `WingMember` objects)  
**Populate needed:** `populate=wing_memebers`

> **Note:** Field uses the spelling `wing_memebers` (not `wing_members`) — match exactly in populate and filters.

#### List Response
```json
{
  "data": [
    {
      "id": 1,
      "documentId": "abc123",
      "wingName": "Youth Wing",
      "wing_memebers": [
        {
          "id": 2,
          "documentId": "wm001",
          "name": "R. Suresh",
          "title": "Wing Secretary"
        }
      ],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "publishedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "pagination": { "page": 1, "pageSize": 25, "pageCount": 1, "total": 4 }
  }
}
```

#### Next.js Fetch
```typescript
import { fetchList } from '@/lib/api';
import type { PartyWing } from '@/lib/types';

const { data } = await fetchList<PartyWing>('/party-wings', {
  populate: 'wing_memebers',
});
```

---

### 5.6 Recent Updates

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/recent-updates` | List all recent updates |
| `GET` | `/recent-updates/{id}` | Get a single recent update by ID |

**Fields:** `id`, `documentId`, `title`, `description`, `data` (date field)  
**Media:** none  
**Populate needed:** none

> **Note:** The date field is named `data` (not `date`). It returns an ISO date string (`YYYY-MM-DD`).

#### List Response
```json
{
  "data": [
    {
      "id": 1,
      "documentId": "abc123",
      "title": "New Road Inauguration",
      "description": "The new bypass road was inaugurated today...",
      "data": "2024-03-15",
      "createdAt": "2024-03-15T10:00:00.000Z",
      "updatedAt": "2024-03-15T10:00:00.000Z",
      "publishedAt": "2024-03-15T10:00:00.000Z"
    }
  ],
  "meta": {
    "pagination": { "page": 1, "pageSize": 25, "pageCount": 1, "total": 10 }
  }
}
```

#### Next.js Fetch
```typescript
import { fetchList } from '@/lib/api';
import type { RecentUpdate } from '@/lib/types';

const { data } = await fetchList<RecentUpdate>('/recent-updates', {
  sort: 'data:desc', // newest first
  'pagination[pageSize]': 5,
});
```

---

### 5.7 Tenkasi Union & Town Secretaries

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/tenkasi-union-and-town-secretaries` | List all union/town secretaries |
| `GET` | `/tenkasi-union-and-town-secretaries/{id}` | Get single entry by ID |

**Fields:** `id`, `documentId`, `name`, `representative`, `type`, `bio`, `image`  
**Media:** `image` (single media object)  
**Populate needed:** `populate=image`

#### List Response
```json
{
  "data": [
    {
      "id": 1,
      "documentId": "abc123",
      "name": "Tenkasi Municipality",
      "representative": "A. Pandian",
      "type": "Town",
      "bio": "Experienced administrator with 15 years of service...",
      "image": {
        "id": 12,
        "documentId": "img012",
        "name": "pandian.jpg",
        "url": "/uploads/pandian_abc.jpg",
        "width": 300,
        "height": 300,
        "mime": "image/jpeg"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "publishedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "pagination": { "page": 1, "pageSize": 25, "pageCount": 1, "total": 3 }
  }
}
```

#### Next.js Fetch
```typescript
import { fetchList } from '@/lib/api';
import type { TenkasiUnionAndTownSecretary } from '@/lib/types';

const { data } = await fetchList<TenkasiUnionAndTownSecretary>(
  '/tenkasi-union-and-town-secretaries',
  {
    populate: 'image',
  }
);
```

---

### 5.8 Test Union Achievements

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/test-union-acivements` | List all union achievements |
| `GET` | `/test-union-acivements/{id}` | Get a single achievement by ID |

**Fields:** `id`, `documentId`, `title`, `serviceType`, `slogans`, `photos`  
**Media:** `photos` (array of media objects)  
**Populate needed:** `populate=photos`

> **Note:** The endpoint uses the spelling `/test-union-acivements` (not `achievements`).

#### List Response
```json
{
  "data": [
    {
      "id": 1,
      "documentId": "abc123",
      "title": "Road Development 2024",
      "serviceType": "Infrastructure",
      "slogans": "Roads for all!",
      "photos": [
        {
          "id": 20,
          "documentId": "img020",
          "name": "road-work.jpg",
          "url": "/uploads/road-work_abc123.jpg",
          "width": 1280,
          "height": 720,
          "mime": "image/jpeg"
        }
      ],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "publishedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "pagination": { "page": 1, "pageSize": 25, "pageCount": 1, "total": 8 }
  }
}
```

#### Next.js Fetch
```typescript
import { fetchList } from '@/lib/api';
import type { TestUnionAchivement } from '@/lib/types';

const { data } = await fetchList<TestUnionAchivement>('/test-union-acivements', {
  populate: 'photos',
  sort: 'createdAt:desc',
});
```

---

### 5.9 Wing Members

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/wing-memebers` | List all wing members |
| `GET` | `/wing-memebers/{id}` | Get a single wing member by ID |

**Fields:** `id`, `documentId`, `name`, `title`  
**Media:** none  
**Populate needed:** none

> **Note:** Endpoint uses the spelling `/wing-memebers` (not `wing-members`).

#### List Response
```json
{
  "data": [
    {
      "id": 1,
      "documentId": "abc123",
      "name": "P. Selvam",
      "title": "Youth Wing Leader",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "publishedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "pagination": { "page": 1, "pageSize": 25, "pageCount": 1, "total": 15 }
  }
}
```

#### Next.js Fetch
```typescript
import { fetchList } from '@/lib/api';
import type { WingMember } from '@/lib/types';

const { data } = await fetchList<WingMember>('/wing-memebers', {
  sort: 'name:asc',
});
```

---

### 5.10 Media / Upload Files

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/upload/files` | List all uploaded media files |
| `GET` | `/upload/files/{id}` | Get a single media file by ID |

**Fields:** `id`, `documentId`, `name`, `alternativeText`, `caption`, `width`, `height`, `formats`, `hash`, `ext`, `mime`, `size`, `url`, `previewUrl`, `provider`

#### List Response
```json
{
  "data": [
    {
      "id": 1,
      "documentId": "abc123",
      "name": "example.jpg",
      "alternativeText": null,
      "caption": null,
      "width": 800,
      "height": 600,
      "formats": {
        "thumbnail": { "url": "/uploads/thumbnail_example_abc.jpg", "width": 245, "height": 184 },
        "small":     { "url": "/uploads/small_example_abc.jpg",     "width": 500, "height": 375 }
      },
      "hash": "example_abc123",
      "ext": ".jpg",
      "mime": "image/jpeg",
      "size": 150.25,
      "url": "/uploads/example_abc123.jpg",
      "previewUrl": null,
      "provider": "local",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## 6. Response Shape Reference

### Standard List Response Wrapper
```
{
  data: T[],           ← array of content items
  meta: {
    pagination: {
      page: number,    ← current page (1-based)
      pageSize: number,
      pageCount: number,
      total: number    ← total number of records
    }
  }
}
```

### Standard Single Item Response Wrapper
```
{
  data: T,             ← single content item
  meta: {}
}
```

### Error Response
```json
{
  "data": null,
  "error": {
    "status": 404,
    "name": "NotFoundError",
    "message": "Not Found",
    "details": {}
  }
}
```

### Media Object (populated)
```
{
  id: number,
  documentId: string,
  name: string,
  alternativeText: string | null,
  caption: string | null,
  width: number,
  height: number,
  formats: {
    thumbnail?: { url, width, height, ... },
    small?:     { url, width, height, ... },
    medium?:    { url, width, height, ... },
    large?:     { url, width, height, ... }
  },
  hash: string,
  ext: string,       ← e.g. ".jpg"
  mime: string,      ← e.g. "image/jpeg"
  size: number,      ← in KB
  url: string,       ← relative path — prepend STRAPI_URL
  previewUrl: string | null,
  provider: string   ← "local" by default
}
```

---

## 7. Next.js Usage Examples

### App Router — Server Component (RSC)

```typescript
// app/leadership/page.tsx
import { fetchList } from '@/lib/api';
import { getMediaUrl } from '@/lib/strapi';
import type { Leadership } from '@/lib/types';
import Image from 'next/image';

export default async function LeadershipPage() {
  const { data: leaders } = await fetchList<Leadership>('/leaderships', {
    populate: 'image',
    sort: 'designation:asc',
  });

  return (
    <section>
      <h1>Leadership</h1>
      <ul>
        {leaders.map((leader) => (
          <li key={leader.documentId}>
            {leader.image && (
              <Image
                src={getMediaUrl(leader.image.url)}
                alt={leader.image.alternativeText ?? leader.name}
                width={leader.image.width}
                height={leader.image.height}
              />
            )}
            <h2>{leader.name}</h2>
            <p>{leader.designation}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

### Dynamic Route — Single Item

```typescript
// app/recent-updates/[id]/page.tsx
import { fetchList, fetchSingle } from '@/lib/api';
import type { RecentUpdate } from '@/lib/types';

export async function generateStaticParams() {
  const { data } = await fetchList<RecentUpdate>('/recent-updates', {
    'pagination[limit]': 100,
    fields: 'id',
  });
  return data.map((item) => ({ id: String(item.id) }));
}

export default async function UpdatePage({ params }: { params: { id: string } }) {
  const { data: update } = await fetchSingle<RecentUpdate>(
    '/recent-updates',
    params.id
  );

  return (
    <article>
      <h1>{update.title}</h1>
      <time dateTime={update.data}>{new Date(update.data).toLocaleDateString()}</time>
      <p>{update.description}</p>
    </article>
  );
}
```

### Gallery with Responsive Images

```typescript
// app/gallery/page.tsx
import { fetchList } from '@/lib/api';
import { getMediaUrl } from '@/lib/strapi';
import type { Gallery } from '@/lib/types';
import Image from 'next/image';

export default async function GalleryPage() {
  const { data: galleries } = await fetchList<Gallery>('/galleries', {
    populate: 'images',
    sort: 'createdAt:desc',
  });

  return (
    <div>
      {galleries.map((gallery) => (
        <section key={gallery.documentId}>
          <h2>{gallery.event}</h2>
          <div className="grid">
            {gallery.images.map((img) => (
              <Image
                key={img.id}
                src={getMediaUrl(img.formats?.medium?.url ?? img.url)}
                alt={img.alternativeText ?? gallery.event}
                width={img.formats?.medium?.width ?? img.width}
                height={img.formats?.medium?.height ?? img.height}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
```

### Party Wings with Nested Members

```typescript
// app/party-wings/page.tsx
import { fetchList } from '@/lib/api';
import type { PartyWing } from '@/lib/types';

export default async function PartyWingsPage() {
  const { data: wings } = await fetchList<PartyWing>('/party-wings', {
    populate: 'wing_memebers',
  });

  return (
    <div>
      {wings.map((wing) => (
        <section key={wing.documentId}>
          <h2>{wing.wingName}</h2>
          <ul>
            {wing.wing_memebers.map((member) => (
              <li key={member.documentId}>
                <strong>{member.name}</strong> — {member.title}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
```

### Pagination Hook (Client Component)

```typescript
// hooks/usePaginatedFetch.ts
'use client';
import { useState, useEffect } from 'react';
import type { StrapiListResponse, StrapiMeta } from '@/lib/types';

export function usePaginatedFetch<T>(endpoint: string, populate?: string) {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<T[]>([]);
  const [meta, setMeta] = useState<StrapiMeta | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const qs = new URLSearchParams({
      'pagination[page]': String(page),
      'pagination[pageSize]': '10',
      ...(populate ? { populate } : {}),
    });
    fetch(`/api/strapi-proxy/${endpoint}?${qs}`)
      .then((r) => r.json() as Promise<StrapiListResponse<T>>)
      .then(({ data, meta }) => {
        setData(data);
        setMeta(meta);
      })
      .finally(() => setLoading(false));
  }, [endpoint, page, populate]);

  return { data, meta, page, setPage, loading };
}
```

---

## 8. Error Handling

```typescript
// lib/api.ts — enhanced error handler
export class StrapiApiError extends Error {
  constructor(
    public status: number,
    public name: string,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
  }
}

export async function fetchList<T>(
  endpoint: string,
  params: QueryParams = {}
): Promise<StrapiListResponse<T>> {
  const qs = buildQueryString(params);
  const res = await fetch(`${API_URL}${endpoint}${qs}`, {
    headers: defaultHeaders,
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    const body = await res.json();
    throw new StrapiApiError(
      body.error?.status ?? res.status,
      body.error?.name ?? 'UnknownError',
      body.error?.message ?? `HTTP ${res.status}`,
      body.error?.details
    );
  }

  return res.json();
}
```

### HTTP Status Codes

| Status | Meaning | Action |
|---|---|---|
| `200` | OK | Success — consume `data` |
| `400` | Bad Request | Check query parameters / filters |
| `401` | Unauthorized | Check / refresh the Bearer token |
| `403` | Forbidden | Endpoint requires different permissions |
| `404` | Not Found | The `{id}` does not exist |
| `500` | Server Error | Retry or contact backend team |

---

## Quick Reference: Endpoint → Populate Map

| Endpoint | Required `populate` for full data |
|---|---|
| `/elected-representatives` | none |
| `/galleries` | `populate=images` |
| `/hero-images` | `populate=heroImage` |
| `/leaderships` | `populate=image` |
| `/party-wings` | `populate=wing_memebers` |
| `/recent-updates` | none |
| `/tenkasi-union-and-town-secretaries` | `populate=image` |
| `/test-union-acivements` | `populate=photos` |
| `/wing-memebers` | none |
| `/upload/files` | none (media metadata is always included) |

---

## Spelling Gotchas

These field/endpoint names contain typos that are baked into the schema — use them exactly as shown:

| Intended | Actual (use this) |
|---|---|
| `wing-members` | `wing-memebers` |
| `wing_members` | `wing_memebers` |
| `test-union-achievements` | `test-union-acivements` |
| `date` (RecentUpdate) | `data` |
