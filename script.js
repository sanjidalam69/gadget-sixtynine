import { db } from './firebase-config.js';
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Initialize cart from LocalStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

window.updateCartBadge = function() {
    const cartBadge = document.getElementById('cart-count-badge');
    if (cartBadge) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartBadge.textContent = totalItems;
    }
}

window.addToCart = function(index) {
    const product = allProducts[index];
    const existingItem = cart.find(item => item.title === product.title);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({...product, quantity: 1});
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
    
    // Add small animation
    const cartBadge = document.getElementById('cart-count-badge');
    if(cartBadge) {
        cartBadge.style.transform = 'scale(1.5)';
        setTimeout(() => {
            cartBadge.style.transform = 'scale(1)';
        }, 200);
    }
    
    alert(`${product.title} added to cart!`);
}

// Sticky header styling on scroll
window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (window.scrollY > 50) {
        header.style.boxShadow = '0 5px 20px rgba(0,0,0,0.05)';
        header.style.background = 'rgba(255, 255, 255, 0.9)';
    } else {
        header.style.boxShadow = 'none';
        header.style.background = 'var(--glass-bg)';
    }
});



// --- Search and Filter Logic with Mock Data ---

let allProducts = [];
let globalRatingsData = {};

// --- Fallback Sample Products (in case Firestore is empty or not configured) ---
const fallbackProducts = [
  {
    id: "demo-iphone15",
    title: "iPhone 15 Pro Max",
    category: "Smartphone",
    brand: "Apple",
    price: 150000,
    oldPrice: 165000,
    badge: "Hot",
    imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=600",
    description: "Premium Titanium design, A17 Pro chip, customizable Action button, and the most powerful iPhone camera system ever with 5x optical zoom."
  },
  {
    id: "demo-s24ultra",
    title: "Samsung Galaxy S24 Ultra",
    category: "Smartphone",
    brand: "Samsung",
    price: 135000,
    oldPrice: 145000,
    badge: "New",
    imageUrl: "https://images.unsplash.com/photo-1707204481014-a957805cb3ca?auto=format&fit=crop&q=80&w=600",
    description: "Welcome to the era of mobile AI. With Galaxy S24 Ultra, unleash whole new levels of creativity, productivity, and possibility, starting with a built-in S Pen."
  },
  {
    id: "demo-sonyheadphones",
    title: "Sony WH-1000XM5 Wireless Headphones",
    category: "Audio",
    brand: "Other",
    price: 38000,
    oldPrice: 42000,
    badge: "Best Seller",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600",
    description: "Industry-leading noise cancellation, exceptional sound quality, crystal-clear hands-free calling, and up to 30 hours of battery life with quick charging."
  },
  {
    id: "demo-applewatchultra2",
    title: "Apple Watch Ultra 2",
    category: "Smartwatch",
    brand: "Apple",
    price: 95000,
    oldPrice: 105000,
    badge: "Limited",
    imageUrl: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?auto=format&fit=crop&q=80&w=600",
    description: "The ultimate sports and adventure watch. Featuring a rugged titanium case, up to 36 hours of battery life, dual-frequency GPS, and a super-bright Retina display."
  },
  {
    id: "demo-airpodspro2",
    title: "AirPods Pro (2nd Generation)",
    category: "Audio",
    brand: "Apple",
    price: 26000,
    oldPrice: 29000,
    badge: "Sale",
    imageUrl: "https://images.unsplash.com/photo-1588449668338-dec40003066b?auto=format&fit=crop&q=80&w=600",
    description: "Up to 2x more Active Noise Cancellation, Adaptive Audio, Transparency mode, and Personalized Spatial Audio for an immersive sound experience."
  },
  {
    id: "demo-ankernano",
    title: "Anker Nano Power Bank (22.5W)",
    category: "Accessories",
    brand: "Other",
    price: 2500,
    oldPrice: 3200,
    badge: "Popular",
    imageUrl: "https://images.unsplash.com/photo-1609592424109-dd82ab241c7b?auto=format&fit=crop&q=80&w=600",
    description: "Built-in foldable USB-C connector makes it easy to charge your phone anywhere. 22.5W high-speed charging in an ultra-compact pocket-friendly design."
  }
];

// Fetch products from Firebase
async function loadPublicProducts() {
    const publicProductsGrid = document.getElementById('public-products-grid');
    if (!publicProductsGrid) return;
    
    try {
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        allProducts = [];
        querySnapshot.forEach((docSnap) => {
            allProducts.push({
                id: docSnap.id,
                ...docSnap.data()
            });
        });
        
        // Fetch and calculate product ratings
        globalRatingsData = {};
        try {
            const reviewsSnapshot = await getDocs(collection(db, "reviews"));
            reviewsSnapshot.forEach((docSnap) => {
                const review = docSnap.data();
                const pId = review.productId;
                if (pId) {
                    if (!globalRatingsData[pId]) {
                        globalRatingsData[pId] = { total: 0, count: 0 };
                    }
                    globalRatingsData[pId].total += review.rating;
                    globalRatingsData[pId].count += 1;
                }
            });
        } catch (err) {
            console.error("Error loading reviews for ratings:", err);
        }

        // Remove any existing status banner
        const existingBanner = document.getElementById('db-status-banner');
        if (existingBanner) existingBanner.remove();

        if (allProducts.length === 0) {
            // Firestore is connected, but empty. Load demo data and show helper banner.
            allProducts = fallbackProducts;
            const banner = document.createElement('div');
            banner.id = 'db-status-banner';
            banner.style.cssText = 'grid-column: 1/-1; background: rgba(245, 158, 11, 0.1); border: 1px solid #f59e0b; color: #d97706; padding: 15px; border-radius: 12px; margin-bottom: 20px; font-size: 0.95rem; display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap;';
            banner.innerHTML = `
                <span style="display: flex; align-items: center; gap: 8px;"><i class="ph ph-warning-circle" style="font-size: 1.2rem;"></i> Running in Demo Mode. Your live Firestore database is currently empty.</span>
                <a href="admin.html" style="background: #d97706; color: white; padding: 6px 12px; border-radius: 6px; font-size: 0.85rem; font-weight: 600; text-decoration: none;">Go to Admin Panel to Seed</a>
            `;
            publicProductsGrid.parentNode.insertBefore(banner, publicProductsGrid);
        }
        
        renderProducts(allProducts);
    } catch (error) {
        console.error("Error fetching products: ", error);
        
        // Remove any existing status banner
        const existingBanner = document.getElementById('db-status-banner');
        if (existingBanner) existingBanner.remove();

        // Render fallback products
        allProducts = fallbackProducts;
        globalRatingsData = {};
        
        // Create error banner
        const banner = document.createElement('div');
        banner.id = 'db-status-banner';
        banner.style.cssText = 'grid-column: 1/-1; background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; color: #dc2626; padding: 15px; border-radius: 12px; margin-bottom: 20px; font-size: 0.95rem;';
        banner.innerHTML = `
            <div style="font-weight: 600; display: flex; align-items: center; gap: 8px; margin-bottom: 5px;"><i class="ph ph-x-circle" style="font-size: 1.2rem;"></i> Firestore Database Error: ${error.code || error.message}</div>
            <p style="font-size: 0.85rem; color: #86868b; margin: 0 0 10px 0;">Detail: ${error.message}. <br><strong>How to fix:</strong> Make sure Firestore is enabled in your Firebase console, and your Security Rules permit public reads.</p>
            <a href="admin.html" style="background: #dc2626; color: white; padding: 6px 12px; border-radius: 6px; font-size: 0.85rem; font-weight: 600; text-decoration: none; display: inline-block;">Go to Admin Panel to Seed</a>
        `;
        publicProductsGrid.parentNode.insertBefore(banner, publicProductsGrid);
        
        renderProducts(allProducts);
    }
}

// Render Products to DOM
function renderProducts(productsToRender) {
    const publicProductsGrid = document.getElementById('public-products-grid');
    if (!publicProductsGrid) return;
    
    publicProductsGrid.innerHTML = ''; 

    if (productsToRender.length === 0) {
        publicProductsGrid.innerHTML = '<p style="text-align:center; grid-column: 1/-1; color: var(--text-secondary);">No products found matching your criteria.</p>';
        return;
    }

    productsToRender.forEach((product) => {
        const oldPriceHtml = product.oldPrice 
            ? `<span>৳ ${product.oldPrice.toLocaleString()}</span>` 
            : '';
            
        const badgeHtml = product.badge 
            ? `<span class="product-badge">${product.badge}</span>` 
            : '';

        // Rating HTML for home page cards (Sumash Tech Style)
        const rating = globalRatingsData[product.id];
        let starsHtml = '';
        if (rating && rating.count > 0) {
            const avg = rating.total / rating.count;
            const filledStarsCount = Math.round(avg);
            for (let i = 1; i <= 5; i++) {
                if (i <= filledStarsCount) {
                    starsHtml += '<i class="ph-fill ph-star" style="color: #fbbf24; font-size: 0.9rem;"></i>';
                } else {
                    starsHtml += '<i class="ph ph-star" style="color: #fbbf24; font-size: 0.9rem;"></i>';
                }
            }
        } else {
            // Default to 5 outline stars if no reviews
            for (let i = 1; i <= 5; i++) {
                starsHtml += '<i class="ph ph-star" style="color: #fbbf24; font-size: 0.9rem;"></i>';
            }
        }
        
        const ratingHtml = `
            <div class="product-card-rating" style="display: flex; gap: 2px; margin-top: 4px;">
                ${starsHtml}
            </div>
        `;

        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-img-container" onclick="window.location.href='product-details.html?id=${product.id}'" style="cursor:pointer;">
                ${badgeHtml}
                <img src="${product.imageUrl}" alt="${product.title}">
            </div>
            <div class="product-info">
                <span class="product-category">${product.category}</span>
                <h3 class="product-title" onclick="window.location.href='product-details.html?id=${product.id}'" style="cursor:pointer;">${product.title}</h3>
                <div class="product-footer">
                    <div class="product-footer-left" style="display: flex; flex-direction: column; gap: 4px;">
                        <div class="product-price">৳ ${product.price.toLocaleString()} ${oldPriceHtml}</div>
                        ${ratingHtml}
                    </div>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <button class="btn-add-cart" style="background: var(--surface-hover); color: var(--text-primary);" onclick="window.location.href='product-details.html?id=${product.id}'">
                            <i class="ph ph-eye"></i>
                        </button>
                        <button class="btn-add-cart" onclick="addToCart(${allProducts.indexOf(product)})">
                            <i class="ph ph-plus"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        publicProductsGrid.appendChild(productCard);
    });
}

// Handle Filtering and Searching
function handleFilters() {
    let filtered = allProducts;
    
    // 1. Search Filter
    const searchField = document.getElementById('search-input');
    const searchTerm = searchField ? searchField.value.toLowerCase().trim() : '';
    
    if (searchTerm) {
        filtered = filtered.filter(p => {
            const title = p.title ? p.title.toLowerCase() : '';
            const brand = p.brand ? p.brand.toLowerCase() : '';
            const category = p.category ? p.category.toLowerCase() : '';
            return title.includes(searchTerm) || brand.includes(searchTerm) || category.includes(searchTerm);
        });

        // Smooth scroll to the products section if user is at the top of the page
        const shopSection = document.getElementById('shop-section');
        if (shopSection && window.scrollY < shopSection.offsetTop - 150) {
            shopSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    // 2. Category Filter
    const catField = document.getElementById('filter-category');
    const catValue = catField ? catField.value : 'all';
    if (catValue !== 'all') {
        filtered = filtered.filter(p => p.category === catValue);
    }
    
    // 3. Brand Filter
    const brandField = document.getElementById('filter-brand');
    const brandValue = brandField ? brandField.value : 'all';
    if (brandValue !== 'all') {
        filtered = filtered.filter(p => p.brand === brandValue);
    }
    
    // 4. Price Filter
    const priceField = document.getElementById('filter-price');
    const priceValue = priceField ? priceField.value : 'all';
    if (priceValue === 'under10k') {
        filtered = filtered.filter(p => p.price < 10000);
    } else if (priceValue === '10k-50k') {
        filtered = filtered.filter(p => p.price >= 10000 && p.price <= 50000);
    } else if (priceValue === 'over50k') {
        filtered = filtered.filter(p => p.price > 50000);
    }
    
    renderProducts(filtered);
}

// Event Listeners for Filters
const setupEventListeners = () => {
    const searchField = document.getElementById('search-input');
    const catField = document.getElementById('filter-category');
    const brandField = document.getElementById('filter-brand');
    const priceField = document.getElementById('filter-price');

    if(searchField) {
        searchField.addEventListener('input', handleFilters);
        searchField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleFilters();
        });
    }
    if(catField) catField.addEventListener('change', handleFilters);
    if(brandField) brandField.addEventListener('change', handleFilters);
    if(priceField) priceField.addEventListener('change', handleFilters);
};

// --- Hero Banner Carousel Logic (Auto side-scroll every 2.5s) ---
function initBannerCarousel() {
    const track = document.getElementById('carousel-track');
    const dotsContainer = document.getElementById('carousel-dots');
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');
    const carousel = document.getElementById('hero-carousel');
    
    if (!track || !dotsContainer) return;
    
    const slides = track.querySelectorAll('.carousel-slide');
    const dots = dotsContainer.querySelectorAll('.dot');
    const totalSlides = slides.length;
    let currentIndex = 0;
    let autoSlideInterval = null;
    const slideDuration = 2500; // 2.5 seconds per slide

    function goToSlide(index) {
        if (index < 0) {
            currentIndex = totalSlides - 1;
        } else if (index >= totalSlides) {
            currentIndex = 0;
        } else {
            currentIndex = index;
        }

        // Smooth horizontal slide
        track.style.transform = `translateX(-${currentIndex * 100}%)`;

        // Update active dots
        dots.forEach((dot, idx) => {
            dot.classList.toggle('active', idx === currentIndex);
        });
    }

    function nextSlide() {
        goToSlide(currentIndex + 1);
    }

    function prevSlide() {
        goToSlide(currentIndex - 1);
    }

    function startAutoSlide() {
        stopAutoSlide();
        autoSlideInterval = setInterval(nextSlide, slideDuration);
    }

    function stopAutoSlide() {
        if (autoSlideInterval) {
            clearInterval(autoSlideInterval);
            autoSlideInterval = null;
        }
    }

    // Controls
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
            startAutoSlide();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            startAutoSlide();
        });
    }

    // Dot indicators
    dots.forEach((dot, idx) => {
        dot.addEventListener('click', () => {
            goToSlide(idx);
            startAutoSlide();
        });
    });

    // Pause on hover
    if (carousel) {
        carousel.addEventListener('mouseenter', stopAutoSlide);
        carousel.addEventListener('mouseleave', startAutoSlide);
        
        // Touch swipe support for mobile
        let touchStartX = 0;
        let touchEndX = 0;
        
        carousel.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            stopAutoSlide();
        }, { passive: true });
        
        carousel.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            if (touchStartX - touchEndX > 50) {
                nextSlide();
            } else if (touchEndX - touchStartX > 50) {
                prevSlide();
            }
            startAutoSlide();
        }, { passive: true });
    }

    // Start auto slide
    startAutoSlide();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initBannerCarousel();
    loadPublicProducts();
    updateCartBadge();
    setupEventListeners();
});

// Brand Bar Helper
window.filterByBrand = function(brand, element) {
    const brandField = document.getElementById('filter-brand');
    if (brandField) {
        brandField.value = brand;
        // Trigger the change event to update the grid
        brandField.dispatchEvent(new Event('change'));
        
        // Update active state in UI
        document.querySelectorAll('.brand-item').forEach(item => item.classList.remove('active'));
        if (element) element.classList.add('active');
    }
}
