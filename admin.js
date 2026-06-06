import { auth, db, storage } from './firebase-config.js';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, getDoc, serverTimestamp, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// DOM Elements
const authSection = document.getElementById('auth-section');
const dashboardSection = document.getElementById('dashboard-section');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');
const addProductForm = document.getElementById('add-product-form');
const productTableBody = document.getElementById('product-table-body');
const orderTableBody = document.getElementById('order-table-body');
const loadingOverlay = document.getElementById('loading-overlay');
const submitBtn = document.getElementById('submit-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const productIdInput = document.getElementById('p-id');

function showLoading() { loadingOverlay.style.display = 'flex'; }
function hideLoading() { loadingOverlay.style.display = 'none'; }

// 1. Authentication State Listener
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is logged in
        authSection.style.display = 'none';
        dashboardSection.style.display = 'block';
        loadProducts(); // Load products when logged in
    } else {
        // User is logged out
        authSection.style.display = 'block';
        dashboardSection.style.display = 'none';
    }
});

// 2. Handle Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    showLoading();
    try {
        await signInWithEmailAndPassword(auth, email, password);
        loginError.style.display = 'none';
        loginForm.reset();
    } catch (error) {
        loginError.textContent = "Invalid email or password. Please try again.";
        loginError.style.display = 'block';
    } finally {
        hideLoading();
    }
});

// 3. Handle Logout
logoutBtn.addEventListener('click', async () => {
    showLoading();
    await signOut(auth);
    hideLoading();
});

// 4. Add Product
addProductForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const productId = productIdInput.value;
    const title = document.getElementById('p-title').value;
    const category = document.getElementById('p-category').value;
    const brand = document.getElementById('p-brand').value;
    const price = document.getElementById('p-price').value;
    const oldPrice = document.getElementById('p-old-price').value;
    const badge = document.getElementById('p-badge').value;
    const imageUrl = document.getElementById('p-image-url').value;
    const description = document.getElementById('p-description').value;

    showLoading();
    try {
        const productData = {
            title: title,
            category: category,
            brand: brand,
            price: Number(price),
            oldPrice: oldPrice ? Number(oldPrice) : null,
            badge: badge || null,
            imageUrl: imageUrl,
            description: description || '',
            updatedAt: serverTimestamp()
        };

        if (productId) {
            // Update existing product
            await updateDoc(doc(db, "products", productId), productData);
            alert("Product Updated Successfully!");
        } else {
            // Add new product
            productData.createdAt = serverTimestamp();
            await addDoc(collection(db, "products"), productData);
            alert("Product Added Successfully!");
        }

        resetForm();
        loadProducts();
    } catch (error) {
        console.error("Error saving product: ", error);
        alert("Error saving product. Check console.");
    } finally {
        hideLoading();
    }
});

function resetForm() {
    addProductForm.reset();
    productIdInput.value = '';
    submitBtn.textContent = 'Add Product';
    cancelEditBtn.style.display = 'none';
    document.querySelector('.admin-card h3').innerHTML = '<i class="ph ph-plus-circle"></i> Add New Product';
}

cancelEditBtn.addEventListener('click', resetForm);

// --- Tab Switching ---
window.switchTab = function(tab) {
    const productsTab = document.getElementById('products-tab');
    const ordersTab = document.getElementById('orders-tab');
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => link.classList.remove('active'));
    
    if (tab === 'products') {
        productsTab.style.display = 'block';
        ordersTab.style.display = 'none';
        document.querySelector('a[onclick*="products"]').classList.add('active');
        loadProducts();
    } else {
        productsTab.style.display = 'none';
        ordersTab.style.display = 'block';
        document.querySelector('a[onclick*="orders"]').classList.add('active');
        loadOrders();
    }
}

// 5. Load Products into Table
async function loadProducts() {
    productTableBody.innerHTML = '<tr><td colspan="4">Loading products...</td></tr>';
    
    try {
        // Query products ordered by newest first
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        productTableBody.innerHTML = ''; // Clear table
        
        if (querySnapshot.empty) {
            productTableBody.innerHTML = '<tr><td colspan="4">No products found. Add one!</td></tr>';
            return;
        }

        querySnapshot.forEach((docSnap) => {
            const product = docSnap.data();
            const tr = document.createElement('tr');
            
            tr.innerHTML = `
                <td><img src="${product.imageUrl}" class="product-img-mini" alt="${product.title}"></td>
                <td>${product.title}<br><small style="color:var(--text-secondary)">${product.brand || 'No Brand'} | ${product.category}</small></td>
                <td>৳ ${product.price.toLocaleString()}</td>
                <td>
                    <div style="display: flex; gap: 5px;">
                        <button class="btn-secondary edit-btn" data-id="${docSnap.id}" style="padding: 8px 12px; font-size: 0.9rem;">
                            <i class="ph ph-pencil"></i> Edit
                        </button>
                        <button class="btn-danger delete-btn" data-id="${docSnap.id}">
                            <i class="ph ph-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            productTableBody.appendChild(tr);
        });

        // Attach event listeners
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.closest('.edit-btn').getAttribute('data-id');
                editProduct(id);
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', deleteProduct);
        });

    } catch (error) {
        console.error("Error fetching products: ", error);
        productTableBody.innerHTML = '<tr><td colspan="4" style="color:red;">Error loading products.</td></tr>';
    }
}

// 6. Delete Product
async function deleteProduct(e) {
    if (!confirm("Are you sure you want to delete this product?")) return;
    
    // Get button element (handling icon click vs button click)
    const btn = e.target.closest('.delete-btn');
    const productId = btn.getAttribute('data-id');
    const imagePath = btn.getAttribute('data-path');

    showLoading();
    try {
        // Delete document from Firestore
        await deleteDoc(doc(db, "products", productId));
        
        // Reload table
        loadProducts();
    } catch (error) {
        console.error("Error deleting product: ", error);
        alert("Failed to delete product.");
    } finally {
        hideLoading();
    }
}

// 7. Edit Product
async function editProduct(id) {
    showLoading();
    try {
        const docSnap = await getDoc(doc(db, "products", id));
        if (docSnap.exists()) {
            const product = docSnap.data();
            
            // Populate Form
            productIdInput.value = id;
            document.getElementById('p-title').value = product.title;
            document.getElementById('p-category').value = product.category;
            document.getElementById('p-brand').value = product.brand || 'Other';
            document.getElementById('p-price').value = product.price;
            document.getElementById('p-old-price').value = product.oldPrice || '';
            document.getElementById('p-image-url').value = product.imageUrl;
            document.getElementById('p-description').value = product.description || '';
            document.getElementById('p-badge').value = product.badge || '';
            
            // Change UI to Edit Mode
            submitBtn.textContent = 'Update Product';
            cancelEditBtn.style.display = 'block';
            document.querySelector('.admin-card h3').innerHTML = '<i class="ph ph-pencil"></i> Edit Product';
            
            // Scroll to form
            document.querySelector('.admin-card').scrollIntoView({ behavior: 'smooth' });
        }
    } catch (error) {
        console.error("Error fetching product for edit:", error);
        alert("Failed to load product data.");
    } finally {
        hideLoading();
    }
}

// --- Order Management ---
async function loadOrders() {
    if (!orderTableBody) return;
    orderTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Loading orders...</td></tr>';

    try {
        const ordersRef = collection(db, "orders");
        const q = query(ordersRef, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        orderTableBody.innerHTML = '';
        
        if (querySnapshot.empty) {
            orderTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No orders found.</td></tr>';
            return;
        }

        querySnapshot.forEach((docSnap) => {
            const order = docSnap.data();
            const orderId = docSnap.id;
            
            const customerName = order.shippingInfo ? order.shippingInfo.name : 'Guest';
            const customerPhone = order.shippingInfo ? order.shippingInfo.phone : 'N/A';
            const totalAmount = order.total || 0;
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>#${orderId.slice(0, 8)}</td>
                <td>
                    <strong>${customerName}</strong><br>
                    <small>${customerPhone}</small>
                </td>
                <td>${order.items ? order.items.length : 0} Items</td>
                <td>৳ ${totalAmount.toLocaleString()}</td>
                <td><span class="badge" style="background:${order.status === 'Confirmed' ? '#22c55e' : '#f59e0b'}; color:white; padding:4px 8px; border-radius:4px; font-size:0.8rem;">${order.status || 'Pending'}</span></td>
                <td>
                    <div style="display: flex; gap: 10px; align-items: center;">
                        ${order.status !== 'Confirmed' ? 
                            `<button onclick="confirmOrder('${orderId}')" style="background:#22c55e; color:white; border:none; padding:8px 12px; border-radius:8px; cursor:pointer; font-size:0.85rem;">Confirm</button>` : 
                            `<span style="color:#22c55e; font-size:0.85rem; font-weight:600;"><i class="ph ph-check-circle"></i> Confirmed</span>`
                        }
                        <button onclick="deleteOrder('${orderId}')" style="background:#ef4444; color:white; border:none; padding:8px 12px; border-radius:8px; cursor:pointer;"><i class="ph ph-trash"></i></button>
                    </div>
                </td>
            `;
            orderTableBody.appendChild(tr);
        });
    } catch (error) {
        console.error("Error loading orders:", error);
        orderTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:red;">Error loading orders.</td></tr>';
    }
}

window.confirmOrder = async (orderId) => {
    if (!confirm("Confirm this order?")) return;
    try {
        const orderRef = doc(db, "orders", orderId);
        await updateDoc(orderRef, { status: "Confirmed" });
        alert("Order confirmed!");
        loadOrders();
    } catch (error) {
        alert("Error confirming order: " + error.message);
    }
};

window.deleteOrder = async (orderId) => {
    if (!confirm("Delete this order record?")) return;
    try {
        await deleteDoc(doc(db, "orders", orderId));
        alert("Order deleted!");
        loadOrders();
    } catch (error) {
        alert("Error deleting order: " + error.message);
    }
};

// --- Database Seeding Functionality ---
const sampleProducts = [
  {
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

async function seedDatabase() {
    const seedBtn = document.getElementById('seed-db-btn');
    if (!confirm("Are you sure you want to seed the database with sample products? This will add 6 premium tech products to your live Firestore database.")) return;
    
    showLoading();
    if (seedBtn) {
        seedBtn.disabled = true;
        seedBtn.innerHTML = '<i class="ph ph-spinner-gap"></i> Seeding...';
    }
    
    let successCount = 0;
    let failCount = 0;
    let lastError = null;

    for (const prod of sampleProducts) {
        try {
            await addDoc(collection(db, "products"), {
                ...prod,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            successCount++;
        } catch (err) {
            console.error("Error seeding product:", prod.title, err);
            failCount++;
            lastError = err;
        }
    }

    if (seedBtn) {
        seedBtn.disabled = false;
        seedBtn.innerHTML = '<i class="ph ph-database"></i> Seed Sample Products';
    }
    hideLoading();

    if (failCount === 0) {
        alert(`Successfully added ${successCount} sample products to Firestore!`);
        loadProducts();
    } else {
        alert(`Seeding completed with issues.\nAdded: ${successCount}\nFailed: ${failCount}\n\nLast Error: ${lastError ? lastError.message : 'Unknown'}\n\nPlease check your Firestore security rules.`);
    }
}

// Hook up event listener
document.addEventListener('DOMContentLoaded', () => {
    // Note: DOMContentLoaded might have already fired, but we check if button exists or set up listener
    const seedBtn = document.getElementById('seed-db-btn');
    if (seedBtn) {
        seedBtn.addEventListener('click', seedDatabase);
    }
});

// Also search for button if auth state changes and updates DOM
const observer = new MutationObserver(() => {
    const seedBtn = document.getElementById('seed-db-btn');
    if (seedBtn && !seedBtn.dataset.listenerAttached) {
        seedBtn.dataset.listenerAttached = 'true';
        seedBtn.addEventListener('click', seedDatabase);
    }
});
observer.observe(document.body, { childList: true, subtree: true });

// Initial Load
loadProducts();

