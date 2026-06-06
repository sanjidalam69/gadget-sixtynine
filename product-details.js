import { db } from './firebase-config.js';
import { doc, getDoc, collection, addDoc, getDocs, query, where, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async () => {
    updateCartBadge();
    
    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        window.location.href = 'index.html';
        return;
    }

    await loadProductDetails(productId);
});

// --- Fallback Sample Products ---
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

async function loadProductDetails(id) {
    const loadingDiv = document.getElementById('loading-details');
    const contentDiv = document.getElementById('details-content');

    if (id.startsWith('demo-')) {
        const product = fallbackProducts.find(p => p.id === id);
        if (product) {
            renderDetails(product);
            loadingDiv.style.display = 'none';
            contentDiv.style.display = 'grid';
            loadReviews(product.id);
            setupReviewForm(product.id);
        } else {
            alert("Demo product not found!");
            window.location.href = 'index.html';
        }
        return;
    }

    try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const product = { id: docSnap.id, ...docSnap.data() };
            renderDetails(product);
            
            loadingDiv.style.display = 'none';
            contentDiv.style.display = 'grid';
            loadReviews(product.id);
            setupReviewForm(product.id);
        } else {
            alert("Product not found!");
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error("Error fetching product details:", error);
        alert("Failed to load product details.");
    }
}

function renderDetails(product) {
    document.getElementById('d-image').src = product.imageUrl;
    document.getElementById('d-brand').textContent = product.brand || product.category;
    document.getElementById('d-title').textContent = product.title;
    document.getElementById('d-price').textContent = `৳ ${product.price.toLocaleString()}`;
    
    if (product.oldPrice) {
        document.getElementById('d-old-price').textContent = `৳ ${product.oldPrice.toLocaleString()}`;
    }

    // Format Specs (Split by newline)
    const specsList = document.getElementById('d-specs');
    specsList.innerHTML = '';
    
    if (product.description) {
        const lines = product.description.split('\n');
        lines.forEach(line => {
            if (line.trim().includes(':')) {
                const [label, ...valParts] = line.split(':');
                const val = valParts.join(':');
                
                const li = document.createElement('li');
                li.className = 'specs-item';
                li.innerHTML = `<span class="specs-label">${label.trim()}</span> <span>${val.trim()}</span>`;
                specsList.appendChild(li);
            } else if (line.trim()) {
                const li = document.createElement('li');
                li.className = 'specs-item';
                li.innerHTML = `<span colspan="2">${line.trim()}</span>`;
                specsList.appendChild(li);
            }
        });
    } else {
        specsList.innerHTML = '<p style="color:var(--text-secondary)">No specific specifications provided.</p>';
    }

    // Add to Cart Logic
    document.getElementById('add-to-cart-btn').onclick = () => {
        addToCart(product, false);
    };

    // Buy Now Logic
    const buyNowBtn = document.getElementById('buy-now-btn');
    if (buyNowBtn) {
        buyNowBtn.onclick = () => {
            addToCart(product, true);
            window.location.href = 'checkout.html';
        };
    }
}

function addToCart(product, silent = false) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existing = cart.find(item => item.id === product.id);

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            title: product.title,
            price: product.price,
            imageUrl: product.imageUrl,
            quantity: 1
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
    
    if (!silent) {
        // Simple toast-like alert
        const btn = document.getElementById('add-to-cart-btn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="ph ph-check"></i> Added to Cart';
        btn.style.background = '#10b981';
        btn.style.color = '#ffffff';
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
            btn.style.color = '';
        }, 2000);
    }
}

function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('cart-count-badge');
    if (badge) badge.textContent = count;
}

// --- Reviews & Ratings Database Operations ---
async function loadReviews(productId) {
    const reviewsSection = document.getElementById('reviews-section');
    const reviewsListContainer = document.getElementById('reviews-list-container');
    const avgRatingValue = document.getElementById('avg-rating-value');
    const avgRatingStars = document.getElementById('avg-rating-stars');
    const totalReviewsCount = document.getElementById('total-reviews-count');

    if (!reviewsSection || !reviewsListContainer) return;
    reviewsSection.style.display = 'block';

    try {
        const q = query(
            collection(db, "reviews"),
            where("productId", "==", productId)
        );
        const querySnapshot = await getDocs(q);

        let totalRating = 0;
        let count = 0;
        reviewsListContainer.innerHTML = '';

        let reviewList = [];
        querySnapshot.forEach((docSnap) => {
            reviewList.push({
                id: docSnap.id,
                ...docSnap.data()
            });
        });

        // Sort in-memory (Newest first) to avoid needing a Firestore Composite Index
        reviewList.sort((a, b) => {
            const timeA = a.createdAt ? (a.createdAt.seconds || 0) : 0;
            const timeB = b.createdAt ? (b.createdAt.seconds || 0) : 0;
            return timeB - timeA;
        });

        reviewList.forEach((review) => {
            count++;
            totalRating += review.rating;

            const dateStr = review.createdAt ? new Date(review.createdAt.seconds * 1000).toLocaleDateString() : 'Recent';
            const starsHtml = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
            
            const card = document.createElement('div');
            card.className = 'review-card';
            card.innerHTML = `
                <div class="review-header">
                    <span class="review-author">${review.name || 'Anonymous'}</span>
                    <span class="review-stars">${starsHtml}</span>
                </div>
                <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                    <span class="review-date">${dateStr}</span>
                </div>
                <p class="review-comment">${review.comment}</p>
            `;
            reviewsListContainer.appendChild(card);
        });

        if (count === 0) {
            reviewsListContainer.innerHTML = '<p style="color:var(--text-secondary); text-align:center; padding: 20px;">No reviews yet. Be the first to review this product!</p>';
            avgRatingValue.textContent = '0.0';
            avgRatingStars.innerHTML = '☆'.repeat(5);
            totalReviewsCount.textContent = '0 reviews';
            updateProductDetailRating(0, 0);
        } else {
            const avg = (totalRating / count).toFixed(1);
            avgRatingValue.textContent = avg;
            
            const fullStars = Math.round(avg);
            avgRatingStars.innerHTML = '★'.repeat(fullStars) + '☆'.repeat(5 - fullStars);
            totalReviewsCount.textContent = `${count} review${count > 1 ? 's' : ''}`;
            
            updateProductDetailRating(avg, count);
        }

    } catch (err) {
        console.error("Error loading reviews:", err);
        reviewsListContainer.innerHTML = '<p style="color:var(--text-secondary); text-align:center; padding: 20px;">Reviews are currently unavailable. Make sure your Firestore has a reviews collection.</p>';
    }
}

function updateProductDetailRating(avg, count) {
    const titleHeader = document.querySelector('.details-title');
    if (titleHeader) {
        let badge = document.getElementById('title-rating-badge');
        if (badge) badge.remove();

        if (count > 0) {
            badge = document.createElement('span');
            badge.id = 'title-rating-badge';
            badge.style.cssText = 'font-size: 1.1rem; font-weight: 600; color: #fbbf24; background: rgba(251, 191, 36, 0.1); padding: 4px 10px; border-radius: 8px; margin-left: 15px; display: inline-block; vertical-align: middle;';
            badge.innerHTML = `<i class="ph-fill ph-star"></i> ${avg} (${count})`;
            titleHeader.appendChild(badge);
        }
    }
}

function setupReviewForm(productId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const reviewForm = document.getElementById('review-form');
    const guestMessage = document.getElementById('review-guest-message');
    const starsSelector = document.getElementById('rating-star-selector');
    const ratingValueInput = document.getElementById('review-rating-value');

    if (currentUser) {
        if (reviewForm) reviewForm.style.display = 'block';
        if (guestMessage) guestMessage.style.display = 'none';

        if (starsSelector && ratingValueInput) {
            const stars = starsSelector.querySelectorAll('i');
            stars.forEach(star => {
                star.onclick = () => {
                    const rating = parseInt(star.getAttribute('data-value'));
                    ratingValueInput.value = rating;
                    
                    stars.forEach(s => {
                        const val = parseInt(s.getAttribute('data-value'));
                        if (val <= rating) {
                            s.className = 'ph-fill ph-star active';
                        } else {
                            s.className = 'ph ph-star';
                        }
                    });
                };
            });
        }
    } else {
        if (reviewForm) reviewForm.style.display = 'none';
        if (guestMessage) guestMessage.style.display = 'block';
    }

    if (reviewForm) {
        reviewForm.onsubmit = async (e) => {
            e.preventDefault();
            
            const ratingVal = parseInt(ratingValueInput.value);
            const commentVal = document.getElementById('review-comment-input').value.trim();

            if (ratingVal === 0) {
                alert("Please select a rating of at least 1 star!");
                return;
            }

            const submitBtn = reviewForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = "Submitting...";

            try {
                const newReview = {
                    productId: productId,
                    name: currentUser ? currentUser.name : 'Anonymous',
                    rating: ratingVal,
                    comment: commentVal,
                    createdAt: serverTimestamp()
                };

                await addDoc(collection(db, "reviews"), newReview);
                
                alert("Review submitted successfully!");
                reviewForm.reset();
                ratingValueInput.value = "0";
                
                if (starsSelector) {
                    starsSelector.querySelectorAll('i').forEach(s => s.className = 'ph ph-star');
                }

                loadReviews(productId);
            } catch (err) {
                console.error("Error submitting review:", err);
                alert("Failed to submit review. Check your Firestore rules.");
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = "Submit Review";
            }
        };
    }
}
