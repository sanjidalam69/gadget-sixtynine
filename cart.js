document.addEventListener('DOMContentLoaded', () => {
    renderCart();
});

function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
}

function renderCart() {
    const cartContainer = document.getElementById('cart-container');
    const subtotalEl = document.getElementById('summary-subtotal');
    const totalEl = document.getElementById('summary-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    let cart = getCart();
    cartContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div class="empty-cart">
                <i class="ph ph-shopping-cart"></i>
                <h2>Your cart is empty</h2>
                <p>Looks like you haven't added any premium gadgets yet.</p>
                <a href="index.html" class="btn-primary" style="margin-top: 20px;">Start Shopping</a>
            </div>
        `;
        subtotalEl.textContent = '৳ 0';
        totalEl.textContent = '৳ 0';
        checkoutBtn.style.pointerEvents = 'none';
        checkoutBtn.style.opacity = '0.5';
        return;
    }
    
    checkoutBtn.style.pointerEvents = 'auto';
    checkoutBtn.style.opacity = '1';
    
    let total = 0;
    
    cart.forEach((item, index) => {
        total += item.price * item.quantity;
        
        const itemEl = document.createElement('div');
        itemEl.className = 'cart-item';
        itemEl.innerHTML = `
            <img src="${item.imageUrl}" class="cart-item-img" alt="${item.title}">
            <div class="cart-item-info">
                <div class="cart-item-title">${item.title}</div>
                <div style="color:var(--text-secondary); font-size:0.85rem; margin-bottom:5px;">${item.category}</div>
                <div class="cart-item-price">৳ ${(item.price * item.quantity).toLocaleString()}</div>
                
                <div class="qty-controls">
                    <button class="qty-btn" onclick="updateQuantity(${index}, -1)"><i class="ph ph-minus"></i></button>
                    <span style="font-weight:600; width: 20px; text-align:center;">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity(${index}, 1)"><i class="ph ph-plus"></i></button>
                </div>
            </div>
            <button class="remove-btn" onclick="removeItem(${index})"><i class="ph ph-trash"></i> Remove</button>
        `;
        cartContainer.appendChild(itemEl);
    });
    
    subtotalEl.textContent = `৳ ${total.toLocaleString()}`;
    totalEl.textContent = `৳ ${total.toLocaleString()}`;
}

window.updateQuantity = function(index, change) {
    let cart = getCart();
    if (cart[index]) {
        cart[index].quantity += change;
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
        saveCart(cart);
    }
}

window.removeItem = function(index) {
    let cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
}
