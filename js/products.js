/* =============================================
   CLASSIC AURA — Product Catalog
   ============================================= */

const PRODUCTS = [

  // ─── Maroon Embroidered Kurti Set ───
  {
    id: 'maroon-embroidered-kurti-set',
    name: 'Maroon Embroidered Kurti Set',
    category: 'fashion',
    price: 1550,
    stock: 7,
    imageSeed: 'maroon-kurti-set',
    image: 'images/kurti.jpg',
    shortDescription: 'A gorgeous maroon kurti set with intricate floral embroidery, flowy bell sleeves, and delicate pom-pom trim detailing. Paired with a matching straight-cut trouser — perfect for festive occasions, office wear, or everyday elegance.',
    variants: [
      { label: 'L', value: 'L' },
      { label: 'XL', value: 'XL' },
      { label: 'XXL', value: 'XXL' },
    ],
  },

  // ─── Pleated Top & Tiered Skirt Set ───
  {
    id: 'pleated-top-tiered-skirt-set',
    name: 'Pleated Top & Tiered Skirt Set',
    category: 'fashion',
    price: 1490,
    originalPrice: 2000,
    stock: 20,
    variantType: 'color',
    image: 'images/top-skirt-set-maroon.jpg',
    images: [
      'images/top-skirt-set-maroon.jpg',
      'images/top-skirt-set-black.jpg',
      'images/top-skirt-set-purple.jpg',
      'images/top-skirt-set-red.jpg',
      'images/top-skirt-set-mustard.jpg',
    ],
    shortDescription: 'A perfect blend of style and comfort for the season — this premium top and tiered skirt set features a pintucked top in flowing georgette paired with a flared, lace-trimmed tiered skirt. Elegant enough for outings, gatherings, or a polished everyday look.',
    fullDescription: [
      '<strong>Pleated Top &amp; Tiered Skirt Set</strong> is a versatile two-piece that combines effortless elegance with everyday comfort. The pintucked top in flowing georgette drapes beautifully, while the flared, lace-trimmed tiered skirt adds a feminine, polished finish.',
      'Free size design fits comfortably and flatters a range of body types, making it an easy choice for outings, gatherings, or a refined everyday look.',
    ],
    specs: [
      'Top fabric: premium cherry georgette (soft, skin-friendly drape)',
      'Skirt fabric: premium Indian georgette',
      'Fit: Free size (up to 42" bust for the top)',
      'Skirt length: 38-40 inches',
    ],
    variants: [
      { label: 'Maroon', value: 'maroon', image: 'images/top-skirt-set-maroon.jpg' },
      { label: 'Black', value: 'black', image: 'images/top-skirt-set-black.jpg' },
      { label: 'Purple', value: 'purple', image: 'images/top-skirt-set-purple.jpg' },
      { label: 'Red', value: 'red', image: 'images/top-skirt-set-red.jpg' },
      { label: 'Mustard', value: 'mustard', image: 'images/top-skirt-set-mustard.jpg' },
    ],
  },

  // ─── Fashion Herbs Mango Nourishing Bleach ───
  {
    id: 'mango-nourishing-bleach',
    name: 'Fashion Herbs Mango Nourishing Bleach',
    category: 'cosmetics',
    price: 180,
    stock: 3,
    originalPrice: 250,
    image: 'images/mengo.jpg',
    rating: 4.5,
    reviewCount: 128,
    shortDescription: 'Premium herbal bleaching solution enriched with the natural goodness of mango extracts and therapeutic herbal essences. Delivers a radiant, golden-toned glow while gently nourishing your skin.',
    fullDescription: [
      '<strong>Fashion Herbs Therapy Mango Nourishing Bleach</strong> is a premium herbal bleaching solution enriched with the natural goodness of mango extracts and therapeutic herbal essences. Designed for the modern woman who values both beauty and skin safety, this bleach delivers a radiant, golden-toned glow while gently nourishing your skin.',
      'Unlike harsh chemical bleaches, this formula includes a dedicated <strong>Pre-Bleach Therapy Cream</strong> that prepares and protects your skin before the bleaching process. The pre-bleach cream deeply moisturises and creates a protective barrier, preventing irritation, redness, and sensitivity &mdash; making it suitable even for delicate facial skin.',
      'Whether you want to reduce sun tan, even out skin tone, or simply achieve a brighter complexion, this mango-infused blend works gently yet effectively. The herbal essences ensure your skin stays soft, supple, and nourished long after application.',
      '<strong>Key Ingredients:</strong> Mango Extracts, Herbal Essences, Pre-Bleach Therapy Cream. Country of Origin: India. Suitable for all skin types.',
    ],
    benefits: [
      { icon: 'smile', text: '<strong>Natural Radiance &amp; Glow:</strong> Instantly brightens skin with a healthy, golden-toned glow.' },
      { icon: 'sun', text: '<strong>Sun Tan &amp; Dark Spot Removal:</strong> Reduces sun tan, uneven skin tone, and dark spots.' },
      { icon: 'zap', text: '<strong>Facial Hair Blending:</strong> Bleaches facial hair to match natural skin tone smoothly.' },
      { icon: 'shield', text: '<strong>Pre-Bleach Therapy Protection:</strong> Special pre-bleach cream that deeply nourishes skin and prevents irritation.' },
    ],
    badges: [
      { icon: 'globe', text: 'Country: India' },
      { icon: 'droplet', text: 'All Skin Types' },
      { icon: 'leaf', text: 'Mango + Herbal' },
    ],
    ingredients: [
      { icon: 'leaf', name: 'Mango Extracts', description: 'Rich in vitamins A &amp; C for natural radiance and skin nourishment.' },
      { icon: 'leaf', name: 'Herbal Essences', description: 'Gentle botanical blend that soothes and protects the skin barrier.' },
      { icon: 'shield', name: 'Pre-Bleach Cream', description: 'Deep-nourishing formula that prevents irritation during bleaching.' },
    ],
    usageSteps: [
      { title: 'Cleanse', description: 'Wash your face thoroughly and pat dry before application.' },
      { title: 'Apply Pre-Bleach Cream', description: 'Spread the pre-bleach therapy cream evenly across the area. Leave for 2-3 minutes.' },
      { title: 'Mix &amp; Apply Bleach', description: 'Mix the bleach cream and activator as directed. Apply evenly over the pre-bleach layer.' },
      { title: 'Wait 10-15 Minutes', description: 'Do not exceed the recommended time. Rinse off with lukewarm water.' },
      { title: 'Moisturise', description: 'Apply a gentle moisturiser after rinsing for best results.' },
    ],
    variants: [
      { label: 'With Pre-Bleach', value: 'with-pre-bleach' },
    ],
    whatsapp: { enabled: true, phone: '8801924904441' },
  },
];
