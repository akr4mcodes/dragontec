# Prompt Engineer: Laptop Ecommerce Website Generator

## Objective
Create a premium laptop ecommerce website with a consistent design system, multiple featured products with interactive detail modals, and responsive layout.

---

## Design System & Visual Foundation

### Typography
- **Primary Font Stack**: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif`
- **Font Weights**: 400 (regular), 700 (bold), 800 (extra-bold)
- **Font Sizes**: 
  - Hero title: 28px (clamp to 2vw on large screens)
  - Section heading (h2): Large, bold
  - Card text: 13-15px
  - Tag/label: 10-10.5px uppercase, letter-spaced

### Color Palette (CSS Variables)
```
Primary Colors:
--primary: #000000
--primary-dark: #333333
--accent: #0ea5e9

Neutrals:
--ink: #121826 (dark text)
--ink-soft: #5d6472 (medium text)
--ink-faint: #8b93a3 (light text)
--paper: #ffffff
--wash: #f4f7fb (light background)
--dark: #111827

Borders & Lines:
--line: #dfe3ea
--line-soft: #edf0f4

Placeholders:
--ph: #ecf0f4
--ph-strong: #dfe7ee

Layout:
--maxw: 1280px (max container width)
```

### Background Gradients
- Main body: `linear-gradient(180deg, #f8fafc 0%, #f4f7fb 100%)`
- Sale banner: `linear-gradient(135deg, #111827 0%, #1f2937 100%)`
- Modal image area: `#0b1120` (dark navy)

---

## Page Structure & Layout

### Header Section
- **Sticky positioning** (top: 0, z-index: 50)
- **Background**: Frosted glass effect `rgba(255, 255, 255, 0.9)` with `backdrop-filter: blur(10px)`
- **Border**: Bottom border 1px solid `--line-soft`
- **Contents**:
  - Tag/label span with text "Sticky on scroll"
  - Brand name: "DRAGON TEC" (bold, prominent)
  - Search box with placeholder text
  - Account links (Account, Wishlist, Cart with item count pill)
  - Navigation menu (Laptops, Consoles — Coming soon, Accessories — Coming soon)

### Trust Bar Section
- Background: `var(--wash)`
- Padding: 24px
- Grid layout: 4 columns (g4)
- Content: 4 trust badges (Free shipping, Warranty, Secure checkout, Returns)
- Each item: circular icon + text (12px, ink-soft color)

### Categories Section
- Background: `var(--paper)` (white)
- Heading: "Shop by laptop type"
- Grid layout: 6 columns (g6)
- Categories: Ultrabooks, Gaming, Business, Creator, 2-in-1, Workstations
- Each card: circular placeholder icon (60px) + label text

### Featured Laptops Section
- Background: `var(--wash)`
- Heading: "Featured laptops" with "View all" link
- **CRITICAL**: Grid layout with 3 product cards in numbered order (1, 2, 3)
- Each product card contains:
  - **Data attributes** (used for modal population):
    - `data-name`: Product name
    - `data-price`: Price (accepts currency symbols and international formats)
    - `data-specs`: Pipe-separated (|) list of laptop specifications
    - `data-description`: Short product description
    - `data-badge`: Label badge (e.g., "Best Seller", "Premium", "Featured")
    - `data-image`: Primary laptop image path
    - `data-carousel-images`: Comma-separated list of 3 alternative product images

### Product Card Layout
```
Product Card Structure:
├── Product Number (circle badge, top-left): 1, 2, or 3
├── Product Image (230px height, responsive)
├── Product Body
│   ├── Product Name (h3, bold)
│   ├── Quick specs (CPU • RAM • Storage)
│   └── Product Meta
│       ├── Price (bold, 15px)
│       └── "View details" button (secondary style)
```

### Deal Banner Section
- Background: Dark gradient `linear-gradient(135deg, #111827 0%, #1f2937 100%)`
- Text color: White
- Layout: Flex, space-between
- Contents:
  - Tag + Sale title ("Flash sale — up to 40% off")
  - Live countdown timer (HH:MM:SS format)
  - "Shop the sale" button (light style)

### Brand Strip Section
- Background: `var(--paper)`
- Grid: 6 columns showing brand logos/names (Dell, ASUS, Lenovo, HP, MSI, Apple)

### Newsletter Section
- Background: `var(--wash)`, centered text
- Max-width: 520px centered
- Content: Email subscription form with description and subscribe button

---

## Interactive Product Modal

### Trigger
- Clicking any product card in "Featured laptops" section opens modal
- Modal uses `data-*` attributes from the clicked card

### Modal Structure
```
Product Modal (fixed, full-screen overlay):
├── Modal Backdrop (dark overlay, rgba(15, 23, 42, 0.55))
└── Modal Panel (responsive container)
    ├── Left Column (Modal Visual, 1.1fr width)
    │   ├── Laptop image (full-size, object-fit: cover)
    │   └── Badge label (overlaid bottom, rgba dark background)
    │
    ├── Right Column (Modal Content Box, 1fr width, SCROLLABLE)
    │   ├── Close button (×, top-right, circular white background)
    │   ├── Tag/badge (inline-block, colored background)
    │   ├── Product name (h3, 32px)
    │   ├── Description (short paragraph)
    │   ├── Specifications (unordered list, scrollable)
    │   └── Footer
    │       ├── Price (28px, bold)
    │       └── "Command" button (primary style)
```

### Modal Behavior
- **Opening**: Click product card → modal opens with smooth transition
- **Scrolling**: Right column (content box) is scrollable when specs exceed viewport height
- **Max-height**: 90vh for modal panel
- **Content box height**: 100% with `overflow-y: auto` for scrolling
- **Closing**: 
  - Click × button
  - Click dark backdrop
  - Press Escape key
- **Accessibility**: 
  - `aria-modal="true"`
  - `aria-labelledby="modalTitle"`
  - Proper button labels
  - `aria-hidden` state management

---

## Button Styles

### Primary Button
- Background: Dark (var(--primary))
- Color: White text
- Padding: 12px 24px (adjust for size variants)
- Border-radius: 6-8px
- Cursor: pointer
- State: Click animation (scale + opacity change)

### Secondary Button
- Background: Light (var(--wash))
- Color: Dark text
- Border: 1px solid var(--line-soft)
- Padding: 7px 12px (small variant)
- Border-radius: 6px

### Light Button (banner)
- Background: White/light
- Text: Dark
- Used in sale banner CTA

---

## Grid & Spacing System

### Container
- `.inner` max-width: 1280px, centered, padding: 0 32px
- Responsive: 20px padding at 900px, 14px padding at 600px

### Grid Layouts
- `g4`: 4 columns on desktop, 2 on mobile
- `g6`: 6 columns on desktop, 3 at 900px, 2 on mobile
- Product showcase: 3 columns, responsive to 1 column on mobile

### Section Padding
- Default: 48px vertical
- Mobile: 28px vertical

---

## Responsive Breakpoints

### Tablet (max-width: 900px)
- Container padding: 20px
- Grid g6 → 3 columns
- Grid g4 → 2 columns
- Product showcase → 1 column
- Modal panel → single column layout

### Mobile (max-width: 600px)
- Container padding: 14px
- Grid g6, g4 → 2 columns
- Hero overlay repositioned
- Site nav: reduced gap, smaller font
- Modal panel → stacked layout (image full-width top, content below)
- Countdown box: 46px min-width

---

## Data Structure for Featured Products

Each product card should include ALL these attributes:

```html
<article class="product-card"
  data-name="[Laptop Model Name]"
  data-price="[Price with currency: $1,999 or 62000 DA]"
  data-specs="[Spec 1]|[Spec 2]|[Spec 3]|[Spec 4]|[Spec 5]|[Spec 6]|[Spec 7]"
  data-description="[2-3 sentence description in French or English]"
  data-badge="[Badge text: Best Seller, Premium, Featured, Top Rated, New Release]"
  data-image="[Primary image path: laptops/filename.png]"
  data-carousel-images="[image1.png],[image2.png],[image3.png]">
```

### Specification Format
Pipe-separated list with full details:
```
Processeur (CPU) : [CPU model and speed]|
Mémoire Vive (RAM) : [RAM amount]|
Stockage : [Storage capacity and type]|
Carte Graphique (GPU) : [GPU model]|
Écran : [Display specs]|
Système : [OS and architecture]|
Batterie : [Battery life description]|
Accessoires inclus : [Accessories list]
```

---

## CSS Architecture

### Key Classes
- `.site-header`: Sticky header container
- `.product-showcase`: Grid container for featured products (3-col)
- `.product-card`: Individual product card with hover effects
- `.product-image`: Image container (230px height)
- `.product-card:hover`: Lift effect `translateY(-4px)`
- `.product-modal`: Fixed overlay container
- `.product-modal.open`: Display flex when active
- `.modal-panel`: Main modal dialog
- `.modal-visual`: Left image column
- `.modal-content-box`: Right scrollable content column
- `.modal-footer`: Bottom price + button

### Responsive Classes
- `.g4`: 4-column grid
- `.g6`: 6-column grid
- Media queries: 900px, 600px breakpoints

---

## JavaScript Functionality

### Events
1. **Product Card Click**: Populate modal with card's data-* attributes
2. **Modal Open**: Add `.open` class, set `aria-hidden="false"`, disable body scroll
3. **Modal Close**: Remove `.open` class, set `aria-hidden="true"`, restore body scroll
4. **Close Triggers**: × button, backdrop click, Escape key
5. **Countdown Timer**: Update HH:MM:SS in sale banner every second

### Modal Population
- Read all `data-*` attributes from clicked card
- Inject product name, price, badge into modal heading
- Split `data-specs` by pipe (|) and render as list items
- Set modal image `src` to `data-image` value
- Display `data-description` text

### Accessibility Features
- Proper ARIA labels and states
- Keyboard support (Escape to close)
- Focus management
- Semantic HTML (dialog role)

---

## Current Featured Products

The website currently features 3 laptops (maintain this order and structure):

### 1. Tilted Blade Stealth
- **Price**: $1,999
- **Badge**: Best Seller
- **Specs**: Intel Core i7 8th Gen, 8GB RAM, 256GB SSD, Intel UHD 620, 13.3" display
- **Images**: blade-stealth-13-2019-2.png, blade-stealth3.png, blade_stealth-removebg-preview.png

### 2. Lenovo IdeaPad Slim 3
- **Price**: 62000 DA
- **Badge**: Premium
- **Specs**: Intel Core 5 120U, 16GB RAM, 256/512GB SSD, Intel Graphics, 14" Touchscreen
- **Images**: lonovoideapad-removebg-preview.png, lenovoideapadslim.png, Lenovo_Ideapad_Slim_3...png

### 3. MacBook Air 13
- **Price**: 33000 DA
- **Badge**: Featured
- **Specs**: Intel Core i5, 4GB RAM, 128GB SSD, Intel HD Graphics 4000, 13.3" LED HD
- **Images**: macbookair2012-removebg-preview.png, Apple-MacBook-Air-13-Mid-2012-Specs...png, macbook2012air-removebg-preview.png

---

## Output Requirements

1. **HTML File**: Single `index.html` with proper semantic structure
2. **CSS File**: External `styles.css` with all styling (no inline except where noted)
3. **JavaScript File**: External `script.js` with modal logic and countdown timer
4. **Images Folder**: `laptops/` directory with all product images
5. **Responsive**: Works on desktop (1280px+), tablet (600-900px), mobile (<600px)
6. **Accessible**: WCAG 2.1 AA compliant
7. **Performance**: Optimized images, minimal repaints, smooth animations

---

## Brand & Tone

- **Store Name**: DRAGON TEC
- **Style**: Premium, modern, clean ecommerce
- **Audience**: Tech-savvy laptop buyers globally
- **Language**: Bilingual support (English + French specs)
- **Tone**: Professional, trustworthy, innovative

---

## Additional Requirements

✅ Maintain exact visual consistency across all modals  
✅ Keep numbered product order (1, 2, 3)  
✅ Ensure modal scrolling works for long specification lists  
✅ Support international pricing ($ and local currency like DA)  
✅ No dependencies (vanilla HTML, CSS, JavaScript only)  
✅ SEO-friendly semantic markup  
✅ Smooth transitions and hover effects  
✅ Dark/light mode agnostic (follows system preference where applicable)  

---

## Testing Checklist

- [ ] Product cards render correctly with images
- [ ] Clicking each card opens modal with correct data
- [ ] Modal content scrolls on small viewport
- [ ] Close button (×) closes modal
- [ ] Backdrop click closes modal
- [ ] Escape key closes modal
- [ ] Countdown timer updates every second
- [ ] Responsive design works on all breakpoints
- [ ] All buttons are clickable and styled
- [ ] Images load correctly
- [ ] No console errors
- [ ] Keyboard navigation works

---

## Notes for AI Model

This prompt describes a production-ready laptop ecommerce storefront. The design emphasizes:
- Clean, minimal aesthetic with generous whitespace
- Product-focused image galleries
- Interactive detail modals with smooth interactions
- Fast, lightweight (no frameworks required)
- Professional trust signals throughout

Use this as the complete specification for building a fully functional laptop ecommerce site.
