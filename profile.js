import { db } from './firebase-config.js';
import { collection, query, where, getDocs, orderBy } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Redirect if not logged in
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    // Populate User Info
    document.getElementById('user-name').textContent = currentUser.name || 'User';
    document.getElementById('user-email').textContent = currentUser.email;
    document.getElementById('user-avatar').textContent = (currentUser.name ? currentUser.name.charAt(0) : 'U').toUpperCase();
    
    // Load Orders
    loadOrders(currentUser.email);
});

async function loadOrders(email) {
    const tbody = document.getElementById('orders-tbody');
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Loading orders...</td></tr>';
    
    try {
        const q = query(
            collection(db, "orders"), 
            where("userEmail", "==", email)
            // Note: If you want to use orderBy with where, Firebase requires an index. 
            // We will just fetch and sort in JavaScript to avoid index errors for now.
        );
        
        const querySnapshot = await getDocs(q);
        const userOrders = [];
        
        querySnapshot.forEach((doc) => {
            userOrders.push({ id: doc.id, ...doc.data() });
        });
        
        // Sort by createdAt descending
        userOrders.sort((a, b) => b.createdAt - a.createdAt);
        
        if (userOrders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:var(--text-secondary);">No past orders found.</td></tr>';
            return;
        }
        
        tbody.innerHTML = '';
        userOrders.forEach(order => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-weight:600;">${order.id.slice(0, 8).toUpperCase()}</td>
                <td>${order.date}</td>
                <td style="font-weight:600;">৳ ${order.total.toLocaleString()}</td>
                <td><span class="status-badge status-pending">${order.status || 'Pending'}</span></td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error("Error loading orders:", error);
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#ef4444;">Failed to load orders.</td></tr>';
    }
}

// Logout
document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
});
