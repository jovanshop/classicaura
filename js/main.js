/* =============================================
   CLASSIC AURA — Global Site JavaScript
   ============================================= */

'use strict';

/* ─── DOM Ready ─── */
document.addEventListener('DOMContentLoaded', () => {
  initHamburgerMenu();
  initStickyHeader();
  updateCartBadge();
  renderBestSellers();
  initScrollFade();
  initNewsletterForms();
  initShopPage();
  initProductPage();
  initCartPage();
  initCheckoutPage();
  initContactPage();
  initAccordions();
});

/* ─── Persistent state keys ─── */
const STORAGE_KEYS = {
  cart: 'classicAura_cart',
  wishlist: 'classicAura_wishlist',
};

/* ─── Hamburger Menu ─── */
function initHamburgerMenu() {
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const body = document.body;

  if (!hamburger || !mobileMenu) return;

  const openMenu = () => {
    hamburger.classList.add('active');
    mobileMenu.classList.add('open');
    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.width = '100%';
  };

  const closeMenu = () => {
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('open');
    body.style.overflow = '';
    body.style.position = '';
    body.style.width = '';
  };

  hamburger.addEventListener('click', () => {
    if (mobileMenu.classList.contains('open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
      closeMenu();
    }
  });
}

/* ─── Sticky Header with Blur on Scroll ─── */
function initStickyHeader() {
  const header = document.querySelector('.header');
  if (!header) return;

  let ticking = false;

  const updateHeader = () => {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    ticking = false;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        window.requestAnimationFrame(updateHeader);
        ticking = true;
      }
    },
    { passive: true }
  );

  updateHeader();
}

/* ─── Cart ─── */
function getCart() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.cart)) || [];
  } catch {
    return [];
  }
}

function getCartCount() {
  const cart = getCart();
  return cart.reduce((total, item) => total + (Number(item.quantity) || 1), 0);
}

function updateCartBadge() {
  const badge = document.getElementById('cart-count');
  if (!badge) return;

  const count = getCartCount();

  if (count > 0) {
    badge.textContent = count >= 100 ? '99+' : count;
    badge.classList.add('visible');
  } else {
    badge.classList.remove('visible');
  }
}

function addToCart(product) {
  if (!product || !product.id) return;

  const cart = getCart();
  const existingIndex = cart.findIndex((item) => item.id === product.id);

  if (existingIndex > -1) {
    cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || '',
      quantity: 1,
    });
  }

  localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cart));
  updateCartBadge();
  showToast(`${product.name} added to your bag`);

  // Meta Pixel: AddToCart
  if (typeof fbq === 'function') {
    fbq('track', 'AddToCart', {
      content_name: product.name,
      content_category: product.category || '',
      value: product.price * (product.quantity || 1),
      currency: 'BDT',
    });
  }
}

/* ─── Wishlist ─── */
function getWishlist() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.wishlist)) || [];
  } catch {
    return [];
  }
}

function toggleWishlist(productId) {
  const wishlist = getWishlist();
  const index = wishlist.indexOf(productId);

  if (index > -1) {
    wishlist.splice(index, 1);
    localStorage.setItem(STORAGE_KEYS.wishlist, JSON.stringify(wishlist));
    return false;
  } else {
    wishlist.push(productId);
    localStorage.setItem(STORAGE_KEYS.wishlist, JSON.stringify(wishlist));
    return true;
  }
}

function isInWishlist(productId) {
  return getWishlist().includes(productId);
}

/* ─── Scroll Fade-in ─── */
function initScrollFade() {
  const sections = document.querySelectorAll('.fade-in-section');
  if (!sections.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  sections.forEach((section) => observer.observe(section));
}

/* ─── Render Best Sellers (Homepage) ─── */
function renderBestSellers() {
  const container = document.getElementById('best-sellers-grid');
  if (!container || typeof PRODUCTS === 'undefined') return;

  const products = PRODUCTS.slice(0, 4);

  container.innerHTML = products
    .map((product) => {
      const inWishlist = isInWishlist(product.id);
      return `
      <div class="product-card fade-in-section" data-product-id="${product.id}">
        <div class="product-card-image">
          <img
            src="${product.image}"
            alt="${product.name} — Classic Aura"
            loading="lazy"
          >
        </div>
        <div class="product-card-body">
          <h3 class="product-card-name">${escapeHtml(product.name)}</h3>
          <p class="product-card-price">৳ ${Number(product.price).toLocaleString('en-BN')}</p>
          <div class="product-card-actions">
            <button
              class="btn btn-sm btn-primary add-to-cart-btn"
              data-product-id="${product.id}"
            >
              Add to Cart
            </button>
            <button
              class="wishlist-btn-card ${inWishlist ? 'active' : ''}"
              data-product-id="${product.id}"
              aria-label="${inWishlist ? 'Remove from' : 'Add to'} wishlist"
            >
              <svg width="18" height="18" viewBox="0 0 24 24"
                fill="${inWishlist ? 'currentColor' : 'none'}"
                stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;
    })
    .join('');

  container.querySelectorAll('.add-to-cart-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.productId;
      const product = PRODUCTS.find((p) => p.id === id);
      if (product) addToCart(product);
    });
  });

  container.querySelectorAll('.wishlist-btn-card').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.productId;
      const added = toggleWishlist(id);
      const svg = btn.querySelector('svg');

      if (added) {
        btn.classList.add('active');
        svg.setAttribute('fill', 'currentColor');
        btn.setAttribute('aria-label', 'Remove from wishlist');
        showToast('Added to wishlist');
      } else {
        btn.classList.remove('active');
        svg.setAttribute('fill', 'none');
        btn.setAttribute('aria-label', 'Add to wishlist');
        showToast('Removed from wishlist');
      }
    });
  });
}

/* ─── Newsletter Forms ─── */
function initNewsletterForms() {
  document.querySelectorAll('.newsletter-form').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const input = form.querySelector('input[type="email"]');
      const email = input.value.trim();

      const container =
        form.closest('.newsletter-band') ||
        form.closest('.footer-col') ||
        form.parentElement;

      let successEl = container.querySelector('.newsletter-success');
      if (!successEl) {
        successEl = document.createElement('p');
        successEl.className = 'newsletter-success';
        container.appendChild(successEl);
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        input.classList.add('error');
        let errorEl = form.querySelector('.form-error');
        if (!errorEl) {
          errorEl = document.createElement('div');
          errorEl.className = 'form-error';
          form.appendChild(errorEl);
        }
        errorEl.textContent = 'Please enter a valid email address.';
        errorEl.classList.add('visible');
        successEl.classList.remove('visible');
        return;
      }

      input.classList.remove('error');
      const errorEl = form.querySelector('.form-error');
      if (errorEl) errorEl.classList.remove('visible');

      // If form has Web3Forms access_key, POST via fetch
      const accessKeyInput = form.querySelector('input[name="access_key"]');
      if (accessKeyInput) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';

        const payload = {
          access_key: accessKeyInput.value,
          email: email,
          subject: 'Newsletter signup',
        };

        fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              successEl.textContent = 'Thank you! You\'re now subscribed.';
              successEl.classList.add('visible');
              input.value = '';
            } else {
              successEl.textContent = 'Something went wrong. Please try again later.';
              successEl.classList.add('visible');
            }
          })
          .catch(() => {
            successEl.textContent = 'Something went wrong. Please try again later.';
            successEl.classList.add('visible');
          })
          .finally(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
          });
      } else {
        // Old client-side-only behavior (footer forms without access_key)
        successEl.textContent = 'Thank you! You\'re now subscribed.';
        successEl.classList.add('visible');
        input.value = '';
      }
    });
  });
}

/* ════════════════════════════════════════════
   SHOP — Filtering, Search & Sort
   ════════════════════════════════════════════ */

let shopSearchTimeout = null;

function initShopPage() {
  const grid = document.getElementById('shop-grid');
  if (!grid || typeof PRODUCTS === 'undefined') return;

  const searchInput = document.getElementById('search-input');
  const priceMin = document.getElementById('price-min');
  const priceMax = document.getElementById('price-max');
  const sortSelect = document.getElementById('sort-select');
  const clearBtn = document.getElementById('clear-filters');
  const clearBtnEmpty = document.getElementById('clear-filters-empty');

  // ── Read ?category= from URL and pre-check pill ──
  const urlParams = new URLSearchParams(window.location.search);
  const categoryParam = urlParams.get('category');
  if (categoryParam && ['fashion', 'cosmetics'].includes(categoryParam)) {
    const checkbox = document.querySelector(
      `.filter-checkbox[value="${categoryParam}"]`
    );
    if (checkbox) {
      checkbox.checked = true;
      checkbox.closest('.filter-pill')?.classList.add('active');
    }
  }

  // ── Read ?sort= from URL and set select ──
  const sortParam = urlParams.get('sort');
  if (sortParam && ['featured', 'newest', 'price-asc', 'price-desc', 'name'].includes(sortParam)) {
    if (sortSelect) sortSelect.value = sortParam;
  }

  // ── Apply pill active state on load ──
  document.querySelectorAll('.filter-checkbox').forEach((cb) => {
    if (cb.checked) {
      cb.closest('.filter-pill')?.classList.add('active');
    }
  });

  // ── Event listeners ──

  // Category checkboxes
  document.querySelectorAll('.filter-checkbox').forEach((cb) => {
    cb.addEventListener('change', () => {
      cb.closest('.filter-pill')?.classList.toggle('active', cb.checked);
      renderShopProducts();
    });
  });

  // Search (debounced)
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      clearTimeout(shopSearchTimeout);
      shopSearchTimeout = setTimeout(renderShopProducts, 200);
    });
  }

  // Price range
  if (priceMin) priceMin.addEventListener('input', renderShopProducts);
  if (priceMax) priceMax.addEventListener('input', renderShopProducts);

  // Sort
  if (sortSelect) sortSelect.addEventListener('change', renderShopProducts);

  // Clear buttons
  const clearFilters = () => {
    document.querySelectorAll('.filter-checkbox').forEach((cb) => {
      cb.checked = false;
      cb.closest('.filter-pill')?.classList.remove('active');
    });
    if (searchInput) searchInput.value = '';
    if (priceMin) priceMin.value = '';
    if (priceMax) priceMax.value = '';
    if (sortSelect) sortSelect.value = 'featured';
    renderShopProducts();
    // Focus back on search for convenience
    if (searchInput) searchInput.focus();
  };

  if (clearBtn) clearBtn.addEventListener('click', clearFilters);
  if (clearBtnEmpty) clearBtnEmpty.addEventListener('click', clearFilters);

  // Card click → product detail page (delegated)
  grid.addEventListener('click', (e) => {
    const card = e.target.closest('.product-card');
    if (!card) return;
    if (e.target.closest('button') || e.target.closest('a')) return;
    const id = card.dataset.id;
    if (id) window.location.href = `product.html?id=${id}`;
  });

  // ── Initial render ──
  renderShopProducts();
}

function renderShopProducts() {
  const grid = document.getElementById('shop-grid');
  const emptyState = document.getElementById('shop-empty');
  const resultsCount = document.getElementById('results-count');
  if (!grid) return;

  // Gather filter state
  const selectedCategories = Array.from(
    document.querySelectorAll('.filter-checkbox:checked')
  ).map((cb) => cb.value);

  const searchTerm = (
    document.getElementById('search-input')?.value || ''
  ).toLowerCase().trim();

  const priceMin = parseFloat(
    document.getElementById('price-min')?.value
  ) || 0;
  const priceMax = parseFloat(
    document.getElementById('price-max')?.value
  ) || Infinity;

  const sortBy = document.getElementById('sort-select')?.value || 'featured';

  // Filter
  let filtered = PRODUCTS.filter((p) => {
    if (selectedCategories.length > 0 && !selectedCategories.includes(p.category)) return false;
    if (
      searchTerm &&
      !p.name.toLowerCase().includes(searchTerm) &&
      !p.shortDescription.toLowerCase().includes(searchTerm)
    ) return false;
    if (p.price < priceMin || p.price > priceMax) return false;
    return true;
  });

  // Sort
  switch (sortBy) {
    case 'price-asc':
      filtered.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      filtered.sort((a, b) => b.price - a.price);
      break;
    case 'name':
      filtered.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'newest':
      // Reverse PRODUCTS order so last-added products appear first
      filtered.sort((a, b) => PRODUCTS.indexOf(a) < PRODUCTS.indexOf(b) ? 1 : -1);
      break;
    // 'featured' — keep original PRODUCTS order
  }

  // Update results count
  if (resultsCount) {
    const total = PRODUCTS.length;
    resultsCount.textContent =
      filtered.length === total
        ? `Showing all ${total} products`
        : `Showing ${filtered.length} of ${total} products`;
  }

  // Empty state
  if (filtered.length === 0) {
    grid.innerHTML = '';
    if (emptyState) emptyState.classList.add('visible');
    return;
  }

  if (emptyState) emptyState.classList.remove('visible');

  // Render grid
  grid.innerHTML = filtered
    .map((product) => buildShopProductCard(product))
    .join('');

  // Wire up Add to Cart
  grid.querySelectorAll('.add-to-cart-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const product = PRODUCTS.find((p) => p.id === btn.dataset.id);
      if (product) addToCart(product);
    });
  });

  // Wire up Wishlist
  grid.querySelectorAll('.wishlist-btn-card').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const added = toggleWishlist(id);
      const svg = btn.querySelector('svg');

      if (added) {
        btn.classList.add('active');
        svg.setAttribute('fill', 'currentColor');
        btn.setAttribute('aria-label', 'Remove from wishlist');
        showToast('Added to wishlist');
      } else {
        btn.classList.remove('active');
        svg.setAttribute('fill', 'none');
        btn.setAttribute('aria-label', 'Add to wishlist');
        showToast('Removed from wishlist');
      }
    });
  });
}

function buildShopProductCard(product) {
  const inWishlist = isInWishlist(product.id);
  const price = Number(product.price).toLocaleString('en-BN');

  return `
  <div class="product-card" data-id="${escapeHtml(product.id)}">
    <a href="product.html?id=${encodeURIComponent(product.id)}" class="product-card-image-link">
      <div class="product-card-image">
        <img
          src="${product.image}"
          alt="${escapeHtml(product.name)} — Classic Aura"
          loading="lazy"
        >
      </div>
    </a>
    <div class="product-card-body">
      <a href="product.html?id=${encodeURIComponent(product.id)}" class="product-card-name-link">
        <h3 class="product-card-name">${escapeHtml(product.name)}</h3>
      </a>
      <p class="product-card-price">৳ ${price}</p>
      <div class="product-card-actions">
        <button
          class="wishlist-btn-card ${inWishlist ? 'active' : ''}"
          data-id="${escapeHtml(product.id)}"
          aria-label="${inWishlist ? 'Remove from' : 'Add to'} wishlist"
        >
          <svg width="18" height="18" viewBox="0 0 24 24"
            fill="${inWishlist ? 'currentColor' : 'none'}"
            stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
        <button class="btn btn-sm btn-primary add-to-cart-btn" data-id="${escapeHtml(product.id)}">
          Add to Cart
        </button>
      </div>
    </div>
  </div>`;
}

/* ─── Toast ─── */
function showToast(message, duration = 3000) {
  const existing = document.querySelector('.toast-notification');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.textContent = message;
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');

  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '24px',
    left: '50%',
    transform: 'translateX(-50%) translateY(20px)',
    backgroundColor: '#1B1B1B',
    color: '#FFFFFF',
    padding: '14px 28px',
    borderRadius: '9999px',
    fontSize: '14px',
    fontWeight: '500',
    fontFamily: "'Inter', -apple-system, sans-serif",
    boxShadow: '0 4px 20px rgba(27,27,27,0.15)',
    zIndex: '9999',
    opacity: '0',
    transition: 'opacity 300ms ease, transform 300ms ease',
    maxWidth: '90vw',
    textAlign: 'center',
    pointerEvents: 'none',
  });

  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/* ─── HTML escaper ─── */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/* ─── Product icon map for benefits/ingredients/badges ─── */
function getProductIconSVG(key) {
  const icons = {
    smile: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
    zap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
    droplet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>',
    leaf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 17 3.5s1 7.5-3.5 11.5C11 18 11 20 11 20z"/><path d="M11 20c0-4 0-8-4-11"/></svg>',
  };
  return icons[key] || '';
}

/* ════════════════════════════════════════════
   PRODUCT PAGE
   ════════════════════════════════════════════ */

function initProductPage() {
  const container = document.getElementById('product-container');
  if (!container || typeof PRODUCTS === 'undefined') return;

  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  // Scroll to top on page load
  window.scrollTo(0, 0);

  if (!productId) {
    showProductNotFound(container);
    return;
  }

  const product = PRODUCTS.find((p) => p.id === productId);
  if (!product) {
    showProductNotFound(container);
    return;
  }

  // Update page title and meta
  document.title = `${product.name} — Classic Aura`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute(
      'content',
      `${product.name} — ${product.shortDescription}`
    );
  }

  renderProductPage(product, container);
}

function showProductNotFound(container) {
  container.innerHTML = `
    <div class="empty-state" style="padding-top: var(--space-5xl);">
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="color: var(--color-gray-300); margin-bottom: var(--space-lg);">
        <circle cx="12" cy="12" r="10"/>
        <line x1="15" y1="9" x2="9" y2="15"/>
        <line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
      <h2>Product not found</h2>
      <p>The product you&rsquo;re looking for doesn&rsquo;t exist or may have been removed. Browse our full collection.</p>
      <a href="shop.html" class="btn btn-primary">Browse the Shop</a>
    </div>
  `;
}

function getProductImages(product) {
  const seed = product.imageSeed;
  if (!seed) return [product.image];
  return [
    product.image,
    `https://picsum.photos/seed/${seed}-2/400/500`,
    `https://picsum.photos/seed/${seed}-3/400/500`,
    `https://picsum.photos/seed/${seed}-4/400/500`,
  ];
}

function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.25 && rating - full <= 0.75;
  const empty = 5 - full - (half ? 1 : 0);
  let html = '';
  for (let i = 0; i < full; i++) html += '<span class="star-full">★</span>';
  if (half) html += '<span class="star-half">½</span>';
  for (let i = 0; i < empty; i++) html += '<span class="star-empty">☆</span>';
  return html;
}

/* ─── Generate deterministic sample reviews ─── */
function generateReviews(product) {
  const hash = product.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);

  const reviewerPool = [
    { name: 'Nusrat Jahan', city: 'Dhaka' },
    { name: 'Tahmina Ali', city: 'Chittagong' },
    { name: 'Sadia Rahman', city: 'Sylhet' },
    { name: 'Farzana Haque', city: 'Dhaka' },
    { name: 'Mehrin Islam', city: 'Khulna' },
    { name: 'Rafiqul Hasan', city: 'Rajshahi' },
  ];

  const reviewTexts = [
    `Absolutely in love with this ${product.name.toLowerCase()}! The quality is exceptional and it looks even better in person. True to size and beautifully packaged. Worth every taka.`,
    `I&rsquo;ve been a loyal Classic Aura customer for over a year, and this ${product.name.toLowerCase()} is one of my favourite purchases yet. The attention to detail is remarkable. Will definitely buy again.`,
    `Bought this as a gift and ended up keeping one for myself. The fabric feels divine and the stitching is flawless. Shipping was prompt and packaging was elegant. Highly recommend!`,
    `Stunning piece! I&rsquo;ve received so many compliments. The colour is exactly as pictured and the fit is perfect. My new wardrobe staple.`,
    `This is my third purchase from Classic Aura and they never disappoint. The ${product.name.toLowerCase()} exceeded my expectations &mdash; premium quality at a fair price.`,
  ];

  const r1 = hash % reviewerPool.length;
  const r2 = (hash + 2) % reviewerPool.length;
  const r3 = (hash + 5) % reviewerPool.length;
  const t1 = hash % reviewTexts.length;
  const t2 = (hash + 1) % reviewTexts.length;
  const t3 = (hash + 3) % reviewTexts.length;

  return [
    {
      name: reviewerPool[r1].name,
      city: reviewerPool[r1].city,
      rating: 5,
      text: reviewTexts[t1],
      date: '2 weeks ago',
    },
    {
      name: reviewerPool[r2].name,
      city: reviewerPool[r2].city,
      rating: 4,
      text: reviewTexts[t2],
      date: '1 month ago',
    },
    {
      name: reviewerPool[r3].name,
      city: reviewerPool[r3].city,
      rating: 5,
      text: reviewTexts[t3],
      date: '3 months ago',
    },
  ];
}

/* ─── Render full product page ─── */
function renderProductPage(product, container) {
  const images = getProductImages(product);
  const categoryCap =
    product.category.charAt(0).toUpperCase() + product.category.slice(1);
  const rating = product.rating || 4.5;
  const reviewCount = product.reviewCount || 0;
  const reviews = generateReviews(product);
  const inWishlist = isInWishlist(product.id);
  const priceFormatted = Number(product.price).toLocaleString('en-BN');

  const variantLabel =
    product.category === 'fashion' ? 'Size' : 'Shade';
  const selectedLabel =
    product.category === 'fashion' ? '— select a size' : '— select a shade';

  // Meta Pixel: ViewContent
  if (typeof fbq === 'function') {
    fbq('track', 'ViewContent', {
      content_name: product.name,
      content_category: categoryCap,
      content_ids: [product.id],
      content_type: 'product',
      value: product.price,
      currency: 'BDT',
    });
  }

  // JSON-LD Product schema
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: images[0],
    description: product.shortDescription,
    sku: product.id,
    brand: { '@type': 'Brand', name: 'Classic Aura' },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'BDT',
      availability: product.availability || 'https://schema.org/InStock',
      url: window.location.href,
    },
  };
  if (product.originalPrice) {
    schema.offers.highPrice = product.originalPrice;
    schema.offers.priceType = 'https://schema.org/ListPrice';
  }
  const schemaTag = document.createElement('script');
  schemaTag.type = 'application/ld+json';
  schemaTag.textContent = JSON.stringify(schema);
  document.head.appendChild(schemaTag);

  container.innerHTML = `
    <!-- Breadcrumb -->
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="shop.html">Shop</a> /
      <a href="shop.html?category=${product.category}">${categoryCap}</a> /
      <span class="current" aria-current="page">${escapeHtml(product.name)}</span>
    </nav>

    <div class="product-layout">
      <!-- ─── Gallery ─── -->
      <div class="product-gallery">
        <div class="main-image">
          <img id="main-product-image"
            src="${images[0]}"
            alt="${escapeHtml(product.name)} — Classic Aura"
          >
        </div>
        <div class="thumbnail-row" id="thumbnail-row" role="tablist" aria-label="Product image thumbnails">
          ${images
            .map(
              (img, i) => `
            <button class="thumbnail-btn ${i === 0 ? 'active' : ''}"
              data-index="${i}"
              role="tab"
              aria-selected="${i === 0 ? 'true' : 'false'}"
              aria-label="View image ${i + 1} of ${images.length}"
            >
              <img src="${img}" alt="" loading="lazy">
            </button>
          `
            )
            .join('')}
        </div>
      </div>

      <!-- ─── Info ─── -->
      <div class="product-info">
        <span class="section-eyebrow">${categoryCap}</span>
        <h1>${escapeHtml(product.name)}</h1>

        <div class="product-rating">
          <span class="stars" aria-label="${rating} out of 5 stars">${renderStars(rating)}</span>
          <span class="review-count">${reviewCount > 0 ? `(${reviewCount} reviews)` : ''}</span>
        </div>

        <p class="product-price">৳ ${priceFormatted}${product.originalPrice ? ' <span class="original">৳' + Number(product.originalPrice).toLocaleString('en-BN') + '</span> <span class="discount">' + Math.round((1 - product.price / product.originalPrice) * 100) + '% OFF</span>' : ''}</p>
        <p class="product-desc">${escapeHtml(product.shortDescription)}</p>

        ${product.benefits ? `
        <ul class="benefits-list">
          ${product.benefits.map(b => `
            <li>
              ${getProductIconSVG(b.icon)}
              <span>${b.text}</span>
            </li>
          `).join('')}
        </ul>` : ''}

        ${product.badges ? `
        <div class="info-badges">
          ${product.badges.map(b => `
            <span class="info-badge">
              ${getProductIconSVG(b.icon)}
              ${b.text}
            </span>
          `).join('')}
        </div>` : ''}

        <!-- Variant selector -->
        <div class="variant-group">
          <span class="variant-label">
            ${variantLabel}
            <span class="selected-variant" id="selected-variant">${selectedLabel}</span>
          </span>
          <div class="variant-buttons" id="variant-buttons" role="radiogroup" aria-label="${variantLabel}">
            ${product.variants
              .map(
                (v, i) => `
              <button class="variant-btn"
                data-value="${escapeHtml(v.value)}"
                role="radio"
                aria-checked="false"
                aria-label="${escapeHtml(v.label)}"
              >${escapeHtml(v.label)}</button>
            `
              )
              .join('')}
          </div>
        </div>

        <!-- Stock indicator -->
        <div id="stock-indicator" class="stock-indicator"></div>

        <!-- Quantity stepper -->
        <div class="qty-group">
          <span class="qty-label">Quantity</span>
          <div class="qty-stepper">
            <button id="qty-minus" aria-label="Decrease quantity">&minus;</button>
            <input type="number" id="qty-input" value="1" min="1" max="99" aria-label="Quantity">
            <button id="qty-plus" aria-label="Increase quantity">+</button>
          </div>
        </div>

        <!-- Action buttons -->
        <div class="product-actions">
          <button class="btn btn-primary btn-lg btn-block" id="add-to-cart-btn" disabled>
            Add to Cart
          </button>
          <button class="btn btn-secondary btn-lg btn-block" id="buy-now-btn" disabled>
            Buy Now
          </button>
          <button class="wishlist-btn ${inWishlist ? 'active' : ''}" id="product-wishlist-btn">
            <svg width="18" height="18" viewBox="0 0 24 24"
              fill="${inWishlist ? 'currentColor' : 'none'}"
              stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            ${inWishlist ? 'Saved to Wishlist' : 'Add to Wishlist'}
          </button>
          ${product.whatsapp?.enabled ? `
          <a href="#" id="whatsapp-btn" target="_blank" rel="noopener" class="btn-whatsapp">
            Order on WhatsApp
          </a>` : ''}
        </div>

        <p class="variant-error" id="variant-error">Please select a ${product.category === 'fashion' ? 'size' : 'shade'} before adding to cart.</p>
      </div>
    </div>

    <!-- ─── Tabs ─── -->
    <div class="product-tabs">
      <div class="tab-nav" role="tablist" aria-label="Product details">
        <button class="tab-btn active" role="tab" aria-selected="true" data-tab="description">Description</button>
        <button class="tab-btn" role="tab" aria-selected="false" data-tab="care">${product.category === 'fashion' ? 'Care Instructions' : 'How to Use'}</button>
        <button class="tab-btn" role="tab" aria-selected="false" data-tab="reviews">Reviews (${reviews.length})</button>
      </div>

      <div class="tab-panel active" id="tab-description" role="tabpanel">
        ${product.fullDescription ? product.fullDescription.map(p => `<p>${p}</p>`).join('') : `
          <p>${escapeHtml(product.shortDescription)}</p>
          <p>Every Classic Aura piece is crafted with care using premium materials and time-honoured techniques. Our ${product.category === 'fashion' ? 'garments are designed for the modern woman who values both comfort and sophistication, ensuring you look and feel your best from morning to evening.' : 'formulations are developed with dermatologists and beauty experts, using ingredients that nurture your skin while delivering stunning results.'}</p>
          <p>${product.category === 'fashion'
            ? 'Available in a range of sizes to ensure the perfect fit. Each piece undergoes rigorous quality control before reaching your door.'
            : 'Free from parabens and sulphates. Cruelty-free and proudly formulated for all skin types.'}</p>
        `}
      </div>

      <div class="tab-panel" id="tab-care" role="tabpanel">
        ${product.ingredients ? `
          <h3>Key Ingredients</h3>
          <div class="ingredient-grid">
            ${product.ingredients.map(i => `
              <div class="ingredient-card">
                ${getProductIconSVG(i.icon)}
                <h4>${i.name}</h4>
                <p>${i.description}</p>
              </div>
            `).join('')}
          </div>
          ${product.usageSteps ? `
            <h3>How to Use</h3>
            <ol class="steps-list">
              ${product.usageSteps.map((s, idx) => `
                <li>
                  <span class="step-number">${idx + 1}</span>
                  <div><strong>${s.title}</strong> &mdash; ${s.description}</div>
                </li>
              `).join('')}
            </ol>
          ` : ''}
        ` : product.category === 'fashion' ? `
          <p><strong>Washing</strong><br>Dry clean or hand wash cold with gentle detergent. Do not bleach.</p>
          <p><strong>Drying</strong><br>Lay flat to dry away from direct sunlight. Do not tumble dry.</p>
          <p><strong>Ironing</strong><br>Iron on low to medium heat. Use a pressing cloth for delicate fabrics.</p>
          <p><strong>Storage</strong><br>Store in a cool, dry place. Use padded hangers for structured pieces.</p>
        ` : `
          <p><strong>Application</strong><br>Start with clean, moisturised skin. Apply a small amount and blend outward for a seamless finish.</p>
          <p><strong>Layering</strong><br>For best results, layer over your regular skincare routine. Allow each layer to absorb before applying the next.</p>
          <p><strong>Removal</strong><br>Remove with a gentle makeup remover or micellar water at the end of the day.</p>
          <p><strong>Storage</strong><br>Store in a cool, dry place away from direct sunlight. Keep the cap tightly sealed after use.</p>
        `}
      </div>

      <div class="tab-panel" id="tab-reviews" role="tabpanel">
        ${reviews
          .map(
            (r) => `
          <div class="review-card">
            <div class="review-header">
              <span class="review-stars" aria-label="${r.rating} out of 5 stars">${renderStars(r.rating)}</span>
              <span class="review-name">${escapeHtml(r.name)}</span>
              <span class="review-date">${r.date}</span>
            </div>
            <p class="review-text">${r.text}</p>
          </div>
        `
          )
          .join('')}
      </div>
    </div>

    <!-- ─── You May Also Like ─── -->
    <div class="related-section">
      <h2>You May Also Like</h2>
      <div class="grid-4" id="related-products-grid">
        <!-- Populated by renderRelatedProducts() -->
      </div>
    </div>
  `;

  // ── Stock indicator ──
  const stockEl = document.getElementById('stock-indicator');
  if (stockEl && product.stock !== undefined) {
    if (product.stock <= 5) {
      stockEl.className = 'stock-indicator stock-urgent';
      stockEl.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Only ' + product.stock + ' left in stock!';
    } else if (product.stock <= 15) {
      stockEl.className = 'stock-indicator stock-limited';
      stockEl.textContent = 'Limited stock';
    }
  }

  // ── Wire up events ──

  // Thumbnail clicks
  const thumbnails = container.querySelectorAll('.thumbnail-btn');
  const mainImage = document.getElementById('main-product-image');
  thumbnails.forEach((btn) => {
    btn.addEventListener('click', () => {
      const index = parseInt(btn.dataset.index, 10);
      thumbnails.forEach((t) => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      mainImage.src = images[index];
    });
  });

  // Variant selection
  const variantBtns = container.querySelectorAll('.variant-btn');
  const selectedVariantDisplay = document.getElementById('selected-variant');
  const addToCartBtn = document.getElementById('add-to-cart-btn');
  const buyNowBtn = document.getElementById('buy-now-btn');
  const variantError = document.getElementById('variant-error');
  let selectedVariant = null;

  variantBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      variantBtns.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-checked', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-checked', 'true');
      selectedVariant = btn.dataset.value;
      const label = btn.textContent.trim();
      selectedVariantDisplay.textContent = `— ${label}`;
      addToCartBtn.disabled = false;
      buyNowBtn.disabled = false;
      variantError.classList.remove('visible');
    });
  });

  // Auto-select if only one variant
  if (variantBtns.length === 1) {
    variantBtns[0].click();
  }

  // Quantity stepper
  const qtyInput = document.getElementById('qty-input');
  const qtyMinus = document.getElementById('qty-minus');
  const qtyPlus = document.getElementById('qty-plus');

  function updateQty(value) {
    let v = parseInt(value, 10);
    if (isNaN(v) || v < 1) v = 1;
    if (v > 99) v = 99;
    qtyInput.value = v;
    qtyMinus.disabled = v <= 1;
  }

  qtyMinus.addEventListener('click', () => updateQty(parseInt(qtyInput.value, 10) - 1));
  qtyPlus.addEventListener('click', () => updateQty(parseInt(qtyInput.value, 10) + 1));
  qtyInput.addEventListener('change', () => updateQty(qtyInput.value));
  qtyInput.addEventListener('input', () => {
    // Allow typing, validate on change/blur
    const v = parseInt(qtyInput.value, 10);
    if (!isNaN(v) && v >= 1 && v <= 99) {
      qtyMinus.disabled = v <= 1;
    }
  });

  // Add to Cart
  addToCartBtn.addEventListener('click', () => {
    if (!selectedVariant) {
      variantError.classList.add('visible');
      variantBtns[0]?.focus();
      return;
    }

    const quantity = parseInt(qtyInput.value, 10) || 1;

    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      variant: selectedVariant,
      quantity: quantity,
    };

    addToCart(cartItem);
  });

  // Buy Now
  buyNowBtn.addEventListener('click', () => {
    if (!selectedVariant) {
      variantError.classList.add('visible');
      variantBtns[0]?.focus();
      return;
    }

    const quantity = parseInt(qtyInput.value, 10) || 1;

    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      variant: selectedVariant,
      quantity: quantity,
    };

    addToCart(cartItem);
    window.location.href = 'checkout.html';
  });

  // WhatsApp order
  const whatsappBtn = document.getElementById('whatsapp-btn');
  if (whatsappBtn && product.whatsapp?.enabled) {
    whatsappBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const name = product.name;
      const variant = selectedVariant ? ' (' + selectedVariant + ')' : '';
      const qtyValue = parseInt(qtyInput.value, 10) || 1;
      const total = product.price * qtyValue;
      const msg =
        'Hi! I\'d like to place an order:\n' +
        '───────────────\n' +
        'Product: ' + name + variant + '\n' +
        'Quantity: ' + qtyValue + '\n' +
        'Price: ৳' + product.price + ' each (Total: ৳' + total + ')\n' +
        '───────────────\n' +
        'Please confirm availability and delivery details.';
      window.open('https://wa.me/' + product.whatsapp.phone + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
    });
  }

  // Wishlist toggle
  const wishlistBtn = document.getElementById('product-wishlist-btn');
  if (wishlistBtn) {
    wishlistBtn.addEventListener('click', () => {
      const added = toggleWishlist(product.id);
      const svg = wishlistBtn.querySelector('svg');
      if (added) {
        wishlistBtn.classList.add('active');
        svg.setAttribute('fill', 'currentColor');
        wishlistBtn.innerHTML =
          `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> Saved to Wishlist`;
        showToast('Added to wishlist');
      } else {
        wishlistBtn.classList.remove('active');
        svg.setAttribute('fill', 'none');
        wishlistBtn.innerHTML =
          `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> Add to Wishlist`;
        showToast('Removed from wishlist');
      }
    });
  }

  // Tab switching
  const tabBtns = container.querySelectorAll('.tab-btn');
  const tabPanels = {
    description: document.getElementById('tab-description'),
    care: document.getElementById('tab-care'),
    reviews: document.getElementById('tab-reviews'),
  };

  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      tabBtns.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      Object.keys(tabPanels).forEach((key) => {
        tabPanels[key].classList.toggle('active', key === tab);
      });
    });
  });

  // Render related products
  renderRelatedProducts(product);
}

/* ─── Related Products ─── */
function renderRelatedProducts(currentProduct) {
  const grid = document.getElementById('related-products-grid');
  if (!grid) return;

  const related = PRODUCTS.filter(
    (p) => p.category === currentProduct.category && p.id !== currentProduct.id
  ).slice(0, 4);

  if (related.length === 0) {
    // Fall back to products from other category
    const fallback = PRODUCTS.filter((p) => p.id !== currentProduct.id).slice(0, 4);
    renderProductCards(grid, fallback);
    return;
  }

  renderProductCards(grid, related);
}

function renderProductCards(grid, products) {
  if (products.length === 0) {
    grid.innerHTML = '';
    return;
  }

  grid.innerHTML = products
    .map((product) => {
      const inWishlist = isInWishlist(product.id);
      const price = Number(product.price).toLocaleString('en-BN');
      return `
      <div class="product-card" data-id="${escapeHtml(product.id)}">
        <a href="product.html?id=${encodeURIComponent(product.id)}" class="product-card-image-link">
          <div class="product-card-image">
            <img src="${product.image}" alt="${escapeHtml(product.name)} — Classic Aura" loading="lazy">
          </div>
        </a>
        <div class="product-card-body">
          <a href="product.html?id=${encodeURIComponent(product.id)}" class="product-card-name-link">
            <h3 class="product-card-name">${escapeHtml(product.name)}</h3>
          </a>
          <p class="product-card-price">৳ ${price}</p>
          <div class="product-card-actions">
            <button class="wishlist-btn-card ${inWishlist ? 'active' : ''}" data-id="${escapeHtml(product.id)}" aria-label="${inWishlist ? 'Remove from' : 'Add to'} wishlist">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="${inWishlist ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
            <button class="btn btn-sm btn-primary add-to-cart-btn" data-id="${escapeHtml(product.id)}">Add to Cart</button>
          </div>
        </div>
      </div>`;
    })
    .join('');

  // Wire up buttons
  grid.querySelectorAll('.add-to-cart-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const product = PRODUCTS.find((p) => p.id === btn.dataset.id);
      if (product) addToCart(product);
    });
  });

  grid.querySelectorAll('.wishlist-btn-card').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const added = toggleWishlist(id);
      const svg = btn.querySelector('svg');
      if (added) {
        btn.classList.add('active');
        svg.setAttribute('fill', 'currentColor');
        btn.setAttribute('aria-label', 'Remove from wishlist');
        showToast('Added to wishlist');
      } else {
        btn.classList.remove('active');
        svg.setAttribute('fill', 'none');
        btn.setAttribute('aria-label', 'Add to wishlist');
        showToast('Removed from wishlist');
      }
    });
  });

  // Card click navigation (delegated)
  grid.addEventListener('click', (e) => {
    const card = e.target.closest('.product-card');
    if (!card) return;
    if (e.target.closest('button') || e.target.closest('a')) return;
    const id = card.dataset.id;
    if (id) window.location.href = `product.html?id=${id}`;
  });
}

/* ════════════════════════════════════════════
   CART PAGE
   ════════════════════════════════════════════ */

const DELIVERY_FEE = 60;

function initCartPage() {
  const container = document.getElementById('cart-items-container');
  if (!container) return;

  renderCart();
  initCartTimer();
  initScarcityAlerts();
}

/* ─── Cart countdown timer (sessionStorage-backed) ─── */
var cartTimerInterval = null;

function initCartTimer() {
  var cart = getCart();
  var banner = document.getElementById('cart-timer-banner');
  var textEl = document.getElementById('cart-timer-text');
  if (!banner || !textEl) return;

  if (cart.length === 0) {
    sessionStorage.removeItem('classicAura_cartTimer');
    if (cartTimerInterval) { clearInterval(cartTimerInterval); cartTimerInterval = null; }
    return;
  }

  var data = sessionStorage.getItem('classicAura_cartTimer');
  var endTime = null;
  if (data) { try { endTime = JSON.parse(data).endTime; } catch(e) {} }
  if (!endTime) {
    endTime = Date.now() + 600000;
    sessionStorage.setItem('classicAura_cartTimer', JSON.stringify({ endTime: endTime }));
  }

  if (cartTimerInterval) { clearInterval(cartTimerInterval); }

  cartTimerInterval = setInterval(function() {
    var remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
    if (remaining <= 0) {
      textEl.textContent = 'Reservation expired, but items are still in your cart!';
      banner.classList.add('expired');
      clearInterval(cartTimerInterval);
      cartTimerInterval = null;
      sessionStorage.removeItem('classicAura_cartTimer');
      return;
    }
    var mins = Math.floor(remaining / 60);
    var secs = remaining % 60;
    textEl.textContent = 'Your cart is reserved for ' +
      (mins < 10 ? '0' : '') + mins + ':' +
      (secs < 10 ? '0' : '') + secs + ' minutes!';
    banner.classList.remove('expired');
  }, 1000);
}

/* ─── Discount state (sessionStorage-backed) ─── */
var DISCOUNT_RATE = 0.10;

function getDiscountActive() {
  var val = sessionStorage.getItem('classicAura_discount');
  return val === 'true';
}

function setDiscountActive(active) {
  sessionStorage.setItem('classicAura_discount', active ? 'true' : 'false');
}

function getEffectiveSubtotal() {
  var cart = getCart();
  var raw = cart.reduce(function(sum, item) {
    return sum + (Number(item.price) || 0) * (Number(item.quantity) || 1);
  }, 0);
  if (getDiscountActive()) {
    return Math.round(raw * (1 - DISCOUNT_RATE));
  }
  return raw;
}

/* ─── Cross-sell recommendations ─── */
var CROSS_SELLS = {
  'velvet-blazer': ['embroidered-kurti', 'linen-blend-shirt'],
  'silk-midi-dress': ['cashmere-wrap-top', 'rose-velvet-lipstick'],
  'floral-maxi-dress': ['wide-leg-trousers', 'rosewater-face-mist'],
  'embroidered-kurti': ['maroon-embroidered-kurti-set', 'crepe-abaya'],
  'crepe-abaya': ['embroidered-kurti', 'cashmere-wrap-top'],
  'cashmere-wrap-top': ['silk-midi-dress', 'floral-maxi-dress'],
  'wide-leg-trousers': ['linen-blend-shirt', 'velvet-blazer'],
  'linen-blend-shirt': ['wide-leg-trousers', 'velvet-blazer'],
  'radiant-foundation': ['hd-setting-powder', 'rose-velvet-lipstick'],
  'rose-velvet-lipstick': ['hydra-glow-serum', 'nude-eyeshadow-palette'],
  'volumizing-mascara': ['nude-eyeshadow-palette', 'velvet-liquid-lip'],
  'hd-setting-powder': ['radiant-foundation', 'hydra-glow-serum'],
  'rosewater-face-mist': ['hydra-glow-serum', 'rose-velvet-lipstick'],
  'nude-eyeshadow-palette': ['velvet-liquid-lip', 'volumizing-mascara'],
  'hydra-glow-serum': ['rosewater-face-mist', 'radiant-foundation'],
  'velvet-liquid-lip': ['rose-velvet-lipstick', 'volumizing-mascara'],
  'maroon-embroidered-kurti-set': ['embroidered-kurti', 'crepe-abaya'],
  'mango-nourishing-bleach': ['rosewater-face-mist', 'hydra-glow-serum'],
};

function renderCrossSells() {
  var container = document.getElementById('cross-sell-items');
  var section = document.getElementById('cross-sell-section');
  if (!container || !section) return;

  var cart = getCart();
  var cartIds = cart.map(function(i) { return i.id; });
  var suggested = [];
  var seen = {};

  for (var c = 0; c < cart.length; c++) {
    var recs = CROSS_SELLS[cart[c].id];
    if (recs) {
      for (var r = 0; r < recs.length; r++) {
        var rid = recs[r];
        if (!seen[rid] && cartIds.indexOf(rid) === -1 && typeof PRODUCTS !== 'undefined') {
          var prod = PRODUCTS.find(function(p) { return p.id === rid; });
          if (prod) {
            seen[rid] = true;
            suggested.push(prod);
            if (suggested.length >= 2) break;
          }
        }
      }
    }
    if (suggested.length >= 2) break;
  }

  if (suggested.length === 0) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';
  container.innerHTML = suggested.map(function(p) {
    var price = Number(p.price).toLocaleString('en-BN');
    return '<div class="cross-sell-card">' +
      '<img src="' + (p.image || '') + '" alt="' + esc(p.name) + '" loading="lazy">' +
      '<div class="cs-info">' +
        '<div class="cs-name">' + esc(p.name) + '</div>' +
        '<div class="cs-price">৳ ' + price + '</div>' +
      '</div>' +
      '<button class="cs-add-btn" data-cs-id="' + esc(p.id) + '" aria-label="Add ' + esc(p.name) + ' to cart">+</button>' +
    '</div>';
  }).join('');

  container.querySelectorAll('.cs-add-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var pid = btn.dataset.csId;
      if (typeof PRODUCTS === 'undefined') return;
      var prod = PRODUCTS.find(function(p) { return p.id === pid; });
      if (!prod) return;
      addToCart(prod);
      renderCart();
      showToast(prod.name + ' added to your bag');
    });
  });

  // Bundle banner discount toggle
  var banner = document.getElementById('bundle-banner');
  if (banner) {
    if (getDiscountActive()) {
      banner.classList.add('active');
    } else {
      banner.classList.remove('active');
    }
    // Remove old listener to avoid duplicates, add fresh one
    banner.onclick = function() {
      var nowActive = !getDiscountActive();
      setDiscountActive(nowActive);
      if (nowActive) {
        banner.classList.add('active');
      } else {
        banner.classList.remove('active');
      }
      renderCart();
    };
  }
}

/* ─── Scarcity & social proof alerts ─── */
function initScarcityAlerts() {
  var alertEl = document.getElementById('scarcity-alert');
  var textEl = document.getElementById('scarcity-text');
  if (!alertEl || !textEl) return;

  var cart = getCart();
  if (cart.length === 0) { return; }

  var stored = sessionStorage.getItem('classicAura_scarcity');
  if (stored) { try { textEl.textContent = JSON.parse(stored); return; } catch(e) {} }

  var msgs = [
    '🔥 High demand: Only ' + (Math.floor(Math.random() * 6) + 3) + ' items left in stock!',
    '👀 ' + (Math.floor(Math.random() * 6) + 2) + ' other people are viewing this item right now!',
    '⚡ Trending — selling fast in your area!',
    '💫 Popular choice — ' + (Math.floor(Math.random() * 5) + 5) + ' sold today!',
  ];
  var msg = msgs[Math.floor(Math.random() * msgs.length)];
  textEl.textContent = msg;
  sessionStorage.setItem('classicAura_scarcity', JSON.stringify(msg));
}

function saveCart(cart) {
  localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cart));
  updateCartBadge();
}

function renderCart() {
  const cart = getCart();
  const container = document.getElementById('cart-items-container');
  const emptyState = document.getElementById('cart-empty');
  const summaryEl = document.getElementById('cart-summary');
  const countEl = document.getElementById('cart-items-count');
  const checkoutBtn = document.getElementById('checkout-btn');

  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    if (summaryEl) summaryEl.style.display = 'none';
    if (countEl) countEl.textContent = '0 items';
    if (checkoutBtn) {
      checkoutBtn.style.display = 'none';
    }
    // Clear timer when cart empties
    if (cartTimerInterval) { clearInterval(cartTimerInterval); cartTimerInterval = null; }
    sessionStorage.removeItem('classicAura_cartTimer');
    sessionStorage.removeItem('classicAura_scarcity');
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  if (summaryEl) summaryEl.style.display = 'block';
  if (checkoutBtn) checkoutBtn.style.display = '';

  const totalItems = cart.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
  if (countEl) countEl.textContent = `${totalItems} ${totalItems === 1 ? 'item' : 'items'}`;

  container.innerHTML = `
    <div class="cart-items">
      ${cart.map((item, index) => buildCartItemHTML(item, index)).join('')}
    </div>
  `;

  // Wire up cart item events
  container.querySelectorAll('.cart-item-qty button').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(btn.closest('.cart-item-qty').dataset.index, 10);
      const delta = btn.classList.contains('qty-plus') ? 1 : -1;
      updateCartItemQty(index, delta);
    });
  });

  container.querySelectorAll('.cart-item-remove').forEach((btn) => {
    btn.addEventListener('click', () => {
      const index = parseInt(btn.dataset.index, 10);
      removeCartItem(index);
    });
  });

  updateCartTotals();
  renderCrossSells();
  // Update free shipping progress bar (uses effective subtotal which includes discount if active)
  var effectiveTotal = getEffectiveSubtotal();
  updateFreeShippingProgressBar(effectiveTotal);
}

function updateFreeShippingProgressBar(cartTotal) {
  var TARGET = 2500;
  var bar = document.getElementById('shipping-progress-fill');
  var label = document.getElementById('shipping-progress-label');
  var msg = document.getElementById('shipping-message');
  if (!bar || !label || !msg) return;

  var pct = Math.min((cartTotal / TARGET) * 100, 100);
  var rounded = Math.round(pct);

  bar.style.width = rounded + '%';
  label.textContent = rounded + '%';

  if (cartTotal >= TARGET) {
    bar.classList.add('completed');
    msg.textContent = 'Congratulations! You\'ve unlocked FREE Shipping! 🎉';
    msg.className = 'shipping-message success';
  } else {
    bar.classList.remove('completed');
    if (cartTotal <= 0) {
      msg.textContent = 'Add items worth 2,500 BDT to unlock FREE Shipping!';
    } else {
      var remaining = TARGET - cartTotal;
      msg.innerHTML = 'Add <span class="highlight">' + remaining.toLocaleString('en-BN') + ' BDT</span> more to get FREE Shipping!';
    }
    msg.className = 'shipping-message';
  }
}

function buildCartItemHTML(item, index) {
  const price = Number(item.price);
  const qty = Number(item.quantity) || 1;
  const lineTotal = price * qty;
  const variantDisplay = item.variant
    ? item.category === 'fashion'
      ? `Size: ${item.variant}`
      : `Shade: ${item.variant}`
    : '';

  return `
    <div class="cart-item" data-index="${index}">
      <img
        class="cart-item-image"
        src="${item.image || 'https://picsum.photos/seed/placeholder/200/250'}"
        alt="${escapeHtml(item.name)}"
        loading="lazy"
      >
      <div class="cart-item-details">
        <h4>${escapeHtml(item.name)}</h4>
        ${variantDisplay ? `<p class="cart-item-variant">${escapeHtml(variantDisplay)}</p>` : ''}
        <p class="cart-item-unit-price">৳ ${price.toLocaleString('en-BN')}</p>
      </div>
      <div class="cart-item-qty" data-index="${index}">
        <button class="qty-minus" aria-label="Decrease quantity" ${qty <= 1 ? 'disabled' : ''}>&minus;</button>
        <span class="qty-value">${qty}</span>
        <button class="qty-plus" aria-label="Increase quantity">+</button>
      </div>
      <span class="cart-item-line-total">৳ ${lineTotal.toLocaleString('en-BN')}</span>
      <button class="cart-item-remove" data-index="${index}" aria-label="Remove ${escapeHtml(item.name)} from cart">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        </svg>
      </button>
    </div>
  `;
}

function updateCartItemQty(index, delta) {
  const cart = getCart();
  if (index < 0 || index >= cart.length) return;

  const newQty = (Number(cart[index].quantity) || 1) + delta;
  if (newQty < 1) return;
  if (newQty > 99) return;

  cart[index].quantity = newQty;
  saveCart(cart);
  renderCart();
}

function removeCartItem(index) {
  let cart = getCart();
  if (index < 0 || index >= cart.length) return;

  const removed = cart.splice(index, 1)[0];
  saveCart(cart);
  renderCart();
  if (removed) showToast(`${removed.name} removed from bag`);
}

function updateCartTotals() {
  const cart = getCart();
  const rawSubtotal = cart.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
    0
  );
  const discount = getDiscountActive();
  const effectiveSubtotal = discount ? Math.round(rawSubtotal * (1 - DISCOUNT_RATE)) : rawSubtotal;
  const discountAmount = rawSubtotal - effectiveSubtotal;
  const delivery = cart.length > 0 ? DELIVERY_FEE : 0;
  const total = effectiveSubtotal + delivery;

  const subtotalEl = document.getElementById('cart-subtotal');
  const discountRow = document.getElementById('discount-row');
  const discountEl = document.getElementById('cart-discount');
  const deliveryEl = document.getElementById('cart-delivery');
  const totalEl = document.getElementById('cart-total');

  if (subtotalEl) subtotalEl.textContent = `৳ ${rawSubtotal.toLocaleString('en-BN')}`;
  if (discountRow) discountRow.style.display = discount && discountAmount > 0 ? 'flex' : 'none';
  if (discountEl && discountAmount > 0) discountEl.textContent = `−৳ ${discountAmount.toLocaleString('en-BN')}`;
  if (deliveryEl) deliveryEl.textContent = delivery > 0 ? `৳ ${delivery}` : '৳ 0';
  if (totalEl) totalEl.textContent = `৳ ${total.toLocaleString('en-BN')}`;
}

/* ════════════════════════════════════════════
   CHECKOUT PAGE
   ════════════════════════════════════════════ */

function initCheckoutPage() {
  const form = document.getElementById('checkout-form');
  if (!form) return;

  // If cart is empty, redirect to cart page
  const cart = getCart();
  if (cart.length === 0) {
    const layout = document.getElementById('checkout-layout');
    if (layout) {
      layout.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1;padding-top:var(--space-4xl);">
          <h2>Your cart is empty</h2>
          <p>Add some items to your bag before checking out.</p>
          <a href="shop.html" class="btn btn-primary">Start Shopping</a>
        </div>
      `;
    }
    return;
  }

  renderCheckoutSummary();

  // ── Checkout countdown timer (15 min) ──
  initCheckoutTimer();

  // Meta Pixel: InitiateCheckout
  if (typeof fbq === 'function') {
    const total = cart.reduce(
      (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
      0
    );
    fbq('track', 'InitiateCheckout', {
      num_items: cart.length,
      value: total,
      currency: 'BDT',
    });
  }

  // Payment method styling
  document.querySelectorAll('.payment-option').forEach((opt) => {
    const radio = opt.querySelector('input[type="radio"]');
    radio.addEventListener('change', () => {
      document.querySelectorAll('.payment-option').forEach((o) => o.classList.remove('active'));
      if (radio.checked) opt.classList.add('active');
    });
    // Set initial active state
    if (radio.checked) opt.classList.add('active');
  });

  // Form validation
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (validateCheckoutForm()) {
      submitOrder();
    }
  });
}

function initCheckoutTimer() {
  const timerEl = document.getElementById('checkout-timer');
  const textEl = document.getElementById('checkout-timer-text');
  if (!timerEl || !textEl) return;

  const DURATION = 15 * 60; // 15 minutes in seconds
  const KEY = 'classicAura_checkoutTimer';

  var stored = sessionStorage.getItem(KEY);
  var endTime = null;
  if (stored) {
    try { endTime = JSON.parse(stored).endTime; } catch (e) {}
  }
  if (!endTime) {
    endTime = Date.now() + DURATION * 1000;
    sessionStorage.setItem(KEY, JSON.stringify({ endTime: endTime }));
  }

  var interval = setInterval(function () {
    var remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
    var mins = Math.floor(remaining / 60);
    var secs = remaining % 60;
    textEl.textContent = 'Your cart is reserved for the next ' +
      (mins < 10 ? '0' : '') + mins + ':' +
      (secs < 10 ? '0' : '') + secs;

    if (remaining <= 0) {
      clearInterval(interval);
      timerEl.classList.add('expired');
    }
  }, 1000);
}

function renderCheckoutSummary() {
  const cart = getCart();
  const itemsContainer = document.getElementById('checkout-summary-items');
  const subtotalEl = document.getElementById('checkout-subtotal');
  const totalEl = document.getElementById('checkout-total');

  if (!itemsContainer) return;

  const subtotal = cart.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
    0
  );
  const delivery = DELIVERY_FEE;
  const total = subtotal + delivery;

  itemsContainer.innerHTML = cart
    .map((item) => {
      const qty = Number(item.quantity) || 1;
      const price = Number(item.price);
      const variantDisplay = item.variant || '';
      return `
      <div class="order-summary-item">
        <img src="${item.image || 'https://picsum.photos/seed/placeholder/100/120'}" alt="${escapeHtml(item.name)}" loading="lazy">
        <div class="order-summary-item-info">
          <div class="item-name">${escapeHtml(item.name)}</div>
          ${variantDisplay ? `<div class="item-variant">${escapeHtml(variantDisplay)}</div>` : ''}
          <div class="item-qty">Qty: ${qty}</div>
        </div>
        <span class="order-summary-item-price">৳ ${(price * qty).toLocaleString('en-BN')}</span>
      </div>
    `;
    })
    .join('');

  if (subtotalEl) subtotalEl.textContent = `৳ ${subtotal.toLocaleString('en-BN')}`;
  if (totalEl) totalEl.textContent = `৳ ${total.toLocaleString('en-BN')}`;
}

function validateCheckoutForm() {
  let isValid = true;

  const fields = [
    { id: 'field-name', errorId: 'error-name', test: (v) => v.trim().length >= 2 },
    { id: 'field-phone', errorId: 'error-phone', test: (v) => /^01[3-9]\d{8}$/.test(v.trim()) },
    { id: 'field-email', errorId: 'error-email', test: (v) => !v.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) },
    { id: 'field-address', errorId: 'error-address', test: (v) => v.trim().length >= 5 },
    { id: 'field-district', errorId: 'error-district', test: (v) => v.trim().length >= 2 },
  ];

  fields.forEach(({ id, errorId, test }) => {
    const input = document.getElementById(id);
    const error = document.getElementById(errorId);
    if (!input || !error) return;

    const valid = test(input.value);
    input.classList.toggle('input-error', !valid);
    error.classList.toggle('visible', !valid);
    if (!valid) isValid = false;
  });

  // Scroll to first error
  if (!isValid) {
    const firstError = document.querySelector('.input-error');
    if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  return isValid;
}

function submitOrder() {
  const cart = getCart();
  if (cart.length === 0) return;

  // Generate a random order ID
  const orderNum = String(Math.floor(100000 + Math.random() * 900000));
  const orderId = `CA-${orderNum}`;

  // Calculate totals
  const subtotal = cart.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
    0
  );
  const total = subtotal + DELIVERY_FEE;

  // Get payment method
  const paymentRadio = document.querySelector('input[name="payment"]:checked');
  const paymentMethod = paymentRadio ? paymentRadio.value : 'cod';

  const paymentLabels = { cod: 'Cash on Delivery', bkash: 'bKash', nagad: 'Nagad' };

  // Hide form, show confirmation
  const layout = document.getElementById('checkout-layout');
  const confirmed = document.getElementById('order-confirmed');
  const orderDisplay = document.getElementById('order-id-display');

  if (layout) layout.style.display = 'none';
  if (confirmed) confirmed.classList.add('visible');
  if (orderDisplay) orderDisplay.textContent = `Order #${orderId}`;

  // Populate confirmation summary
  const confirmedItems = document.getElementById('order-confirmed-items');
  const confirmedSubtotal = document.getElementById('confirmed-subtotal');
  const confirmedTotal = document.getElementById('confirmed-total');

  if (confirmedItems) {
    confirmedItems.innerHTML = cart
      .map((item) => {
        const qty = Number(item.quantity) || 1;
        const price = Number(item.price);
        const variantDisplay = item.variant || '';
        return `
        <div class="order-summary-item">
          <img src="${item.image || 'https://picsum.photos/seed/placeholder/100/120'}" alt="${escapeHtml(item.name)}" loading="lazy">
          <div class="order-summary-item-info">
            <div class="item-name">${escapeHtml(item.name)}</div>
            ${variantDisplay ? `<div class="item-variant">${escapeHtml(variantDisplay)}</div>` : ''}
            <div class="item-qty">Qty: ${qty}</div>
          </div>
          <span class="order-summary-item-price">৳ ${(price * qty).toLocaleString('en-BN')}</span>
        </div>
      `;
      })
      .join('');
  }

  if (confirmedSubtotal) confirmedSubtotal.textContent = `৳ ${subtotal.toLocaleString('en-BN')}`;
  if (confirmedTotal) confirmedTotal.textContent = `৳ ${total.toLocaleString('en-BN')}`;

  // Clear cart
  saveCart([]);

  // Also render cart UI for confirmation section
  const paymentInfo = document.createElement('p');
  paymentInfo.style.cssText = 'font-size:0.875rem;color:var(--color-gray-500);margin-top:var(--space-sm);';
  paymentInfo.textContent = `Payment method: ${paymentLabels[paymentMethod] || paymentMethod}`;
  const detailsDiv = document.getElementById('order-details-summary');
  if (detailsDiv) detailsDiv.appendChild(paymentInfo);

  // ── Fire-and-forget: POST order to Google Sheet (no-cors) ──
  const itemsStr = cart
    .map((item) => {
      const qty = Number(item.quantity) || 1;
      const price = Number(item.price);
      const variant = item.variant || '';
      return `${item.name}${variant ? ` (${variant})` : ''} × ${qty} — ৳${price * qty}`;
    })
    .join(' | ');

  const payload = {
    orderId,
    name: (document.getElementById('field-name')?.value) || '',
    phone: (document.getElementById('field-phone')?.value) || '',
    address: (document.getElementById('field-address')?.value) || '',
    city: (document.getElementById('field-district')?.value) || '',
    paymentMethod: paymentLabels[paymentMethod] || paymentMethod,
    items: itemsStr,
    total,
  };

  // Meta Pixel: Purchase
  if (typeof fbq === 'function') {
    fbq('track', 'Purchase', {
      value: total,
      currency: 'BDT',
    });
  }

  fetch('https://script.google.com/macros/s/AKfycbz0ZB6Rx-RnHR_Md2k13Db1_6jJDTjfmdOt664JNHUUKnlbeo1G-mlAoHdd5zeV-HYQbg/exec', {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch((err) => console.error('Sheet log error:', err));
}

/* ════════════════════════════════════════════
   CONTACT PAGE
   ════════════════════════════════════════════ */

function initContactPage() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const successEl = document.getElementById('contact-success');
  const layoutEl = document.getElementById('contact-layout');
  const submitBtn = document.getElementById('contact-submit-btn');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!validateContactForm()) return;

    // Disable button and show sending state
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
    }

    const payload = {
      access_key: (form.querySelector('input[name="access_key"]')?.value) || '',
      name: document.getElementById('contact-name')?.value || '',
      email: document.getElementById('contact-email')?.value || '',
      subject: document.getElementById('contact-subject')?.value || '',
      message: document.getElementById('contact-message')?.value || '',
    };

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          // Show success, hide form
          if (layoutEl) layoutEl.style.display = 'none';
          if (successEl) successEl.classList.add('visible');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          showToast('Failed to send message. Please try again.');
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Message';
          }
        }
      })
      .catch(() => {
        showToast('Network error. Please try again later.');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send Message';
        }
      });
  });

  // "Send Another Message" button
  const sendAnother = document.getElementById('contact-send-another');
  if (sendAnother) {
    sendAnother.addEventListener('click', () => {
      if (successEl) successEl.classList.remove('visible');
      if (layoutEl) layoutEl.style.display = '';
      form.reset();

      form.querySelectorAll('.input-error').forEach((el) => el.classList.remove('input-error'));
      form.querySelectorAll('.field-error.visible').forEach((el) => el.classList.remove('visible'));

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

function validateContactForm() {
  let isValid = true;

  const fields = [
    { id: 'contact-name', errorId: 'error-contact-name', test: (v) => v.trim().length >= 2 },
    { id: 'contact-email', errorId: 'error-contact-email', test: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) },
    { id: 'contact-subject', errorId: 'error-contact-subject', test: (v) => v.trim().length >= 2 },
    { id: 'contact-message', errorId: 'error-contact-message', test: (v) => v.trim().length >= 5 },
  ];

  fields.forEach(({ id, errorId, test }) => {
    const input = document.getElementById(id);
    const error = document.getElementById(errorId);
    if (!input || !error) return;

    const valid = test(input.value);
    input.classList.toggle('input-error', !valid);
    error.classList.toggle('visible', !valid);
    if (!valid) isValid = false;
  });

  if (!isValid) {
    const firstError = document.querySelector('.input-error');
    if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  return isValid;
}

/* ════════════════════════════════════════════
   ACCORDION PANELS
   ════════════════════════════════════════════ */

function initAccordions() {
  document.querySelectorAll('.accordion-trigger').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const panel = trigger.closest('.accordion-panel');
      const body = panel.querySelector('.accordion-body');
      const isOpen = panel.classList.contains('open');

      if (isOpen) {
        body.style.maxHeight = '0';
        panel.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
      } else {
        panel.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });

  // If URL has a hash matching an accordion panel, open it on load
  const hash = window.location.hash;
  if (hash) {
    const target = document.querySelector(hash + ' .accordion-trigger');
    if (target) {
      setTimeout(() => target.click(), 300);
      setTimeout(() => {
        document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 400);
    }
  }
}
