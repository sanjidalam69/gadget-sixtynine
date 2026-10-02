import { db } from './firebase-config.js';
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    loadCheckoutSummary();
    
    // Check if user is logged in to auto-fill form
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if(currentUser) {
        document.getElementById('c-name').value = currentUser.name || '';
        document.getElementById('c-email').value = currentUser.email || '';
    }
});

function loadCheckoutSummary() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const itemsContainer = document.getElementById('checkout-items');
    const subtotalEl = document.getElementById('summary-subtotal');
    const totalEl = document.getElementById('summary-total');
    
    if (cart.length === 0) {
        alert("Your cart is empty. Redirecting to store.");
        window.location.href = "index.html";
        return;
    }
    
    let total = 0;
    itemsContainer.innerHTML = '';
    
    cart.forEach(item => {
        total += item.price * item.quantity;
        
        const itemEl = document.createElement('div');
        itemEl.className = 'summary-item';
        itemEl.innerHTML = `
            <img src="${item.imageUrl}" class="summary-item-img" alt="">
            <span class="summary-item-title">${item.quantity}x ${item.title}</span>
            <span style="font-weight: 600;">৳ ${(item.price * item.quantity).toLocaleString()}</span>
        `;
        itemsContainer.appendChild(itemEl);
    });
    
    subtotalEl.textContent = `৳ ${total.toLocaleString()}`;
    totalEl.textContent = `৳ ${total.toLocaleString()}`;
}

// Payment method UI logic
document.querySelectorAll('.payment-method input').forEach(radio => {
    radio.addEventListener('change', (e) => {
        document.querySelectorAll('.payment-method').forEach(label => label.classList.remove('active'));
        e.target.closest('.payment-method').classList.add('active');
    });
});

// Handle Form Submit
document.getElementById('checkout-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.textContent = "Placing Order...";
    submitBtn.disabled = true;
    
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if(cart.length === 0) return;
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const inputEmail = document.getElementById('c-email').value.trim();
    const userEmail = currentUser ? currentUser.email : (inputEmail || 'guest');
    
    // Create order object for Firebase
    const order = {
        date: new Date().toLocaleDateString(),
        createdAt: new Date(),
        items: cart,
        total: total,
        status: 'Pending',
        userEmail: userEmail,
        shippingInfo: {
            name: document.getElementById('c-name').value,
            email: inputEmail,
            phone: document.getElementById('c-phone').value,
            address: document.getElementById('c-address').value
        }
    };
    
    try {
        // Save to Firebase
        const docRef = await addDoc(collection(db, "orders"), order);
        
        // Clear cart
        localStorage.removeItem('cart');
        
        // Show success modal with Firebase document ID
        document.getElementById('order-id').textContent = docRef.id.slice(0, 8).toUpperCase();
        document.getElementById('success-modal').style.display = 'flex';
    } catch (error) {
        console.error("Error adding document: ", error);
        alert("There was an error placing your order. Please try again.");
        submitBtn.textContent = "Place Order";
        submitBtn.disabled = false;
    }
});
