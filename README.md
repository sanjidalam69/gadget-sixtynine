# Gadget Sixty Nine - Premium Tech E-commerce Ecosystem

**Course Name:** Web and Internet Programming Lab  
**Project Title:** Gadget Sixty Nine - A Premium Tech E-commerce Ecosystem  

Gadget Sixty Nine is a high-performance, responsive e-commerce web application tailored for the premium consumer electronics market in Bangladesh. Utilizing a serverless architecture, this platform features a clean modern aesthetic, reactive user interfaces, secure authentication, real-time database transactions, and a robust administrative control center.

---

## 🚀 Key Features

### 🛒 Client Storefront
* **Dynamic Catalog & Discovery:** Dynamic product grids synced in real-time with Google Cloud Firestore.
* **Premium Rating System:** Sumash Tech style 5-star rating system displayed on every product card, calculated from customer reviews.
* **Multi-Layered Filter Engine:** Instant, live filtering of the catalog by:
  * **Categories:** Smartphones, Audio, Smartwatches, Accessories.
  * **Brand Affinity:** Filtering across brands like Apple, Samsung, OnePlus, Xiaomi, Oppo, Vivo, Realme, and others.
  * **Price Range:** Tiered pricing filters matching consumer budgets.
* **Persistent Shopping Cart:** An interactive shopping cart utilizing browser `LocalStorage` so users do not lose their items on browser closing.
* **Streamlined Checkout Pipeline:** Quick order form gathering shipping info, calculating total costs, creating unique Firestore orders, and clearing the cart dynamically.
* **"Buy Now" Direct Action:** Instantly skip the cart step and move directly to checkout.

### 👤 User Accounts & Profiles
* **Secure Authentication:** User registration (Sign Up) and login (Sign In) powered securely by Firebase Authentication.
* **User Dashboard:** A dedicated space showing account details, billing statistics, and personal order logs with real-time delivery status updates.
* **Dynamic Feedback & Review System:** Logged-in users can write reviews and leave 1-to-5 star ratings. The system computes average ratings and review counts dynamically.

### 🛡️ Administrative Portal
* **Inventory Management (CRUD):** Admin UI to Create, Read, Update, and Delete products dynamically from the live database.
* **Order Fulfillment Suite:** A real-time tracking interface showing customer orders, billing totals, shipping phone/address, with capabilities to confirm or cancel/delete order records.
* **Database Seeding tool:** A single-click seeding script to instantly load 6 pre-configured premium gadgets for demo purposes.

---

## 🛠️ Tech Stack & Architecture

* **Frontend:** HTML5 (Semantic Structure), CSS3 (Custom variables, responsive layouts, glassmorphism), JavaScript (ES6+ Asynchronous Modules).
* **Styling & Icons:** Phosphor Icons (v2) and Google Fonts (Inter).
* **Database & Auth:** Google Firebase (Authentication & Cloud Firestore NoSQL Database).
* **Theme Management:** Persisted light/dark mode switcher script (`theme.js`) leveraging system state cache.

---

## 📂 Project Structure

```text
gadget-store/
├── assets/                  # Images and graphics assets
├── admin.html               # Admin Dashboard view
├── admin.js                 # Admin CRUD & order operations script
├── banner.png               # Banner asset
├── cart.html                # Cart view page
├── cart.js                  # Cart logic
├── checkout.html            # Checkout billing form
├── checkout.js              # Checkout processing logic
├── firebase-config.js       # Firebase SDK initialisation credentials
├── index.html               # Main homepage & product catalog
├── login.html               # Authentication tab interface (Login / Signup)
├── login.js                 # Firebase Auth integration logic
├── product-details.html     # Dedicated product description page
├── product-details.js       # Product details renderer and reviews handler
├── profile.html             # User profile page
├── profile.js               # Orders fetcher and dashboard loader
├── README.md                # Project documentation
├── script.js                # Main catalog engine and filters logic
├── style.css                # Global styles and theme configurations
└── theme.js                 # Persistent light/dark mode loader
```

---

## ⚙️ Setup & Configuration

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/your-username/gadget-store.git
   cd gadget-store
   ```

2. **Setup Firebase Database:**
   * Go to the [Firebase Console](https://console.firebase.google.com/).
   * Create a new project named `Gadget Sixty Nine`.
   * Enable **Firebase Authentication** (Email/Password Sign-In provider).
   * Enable **Cloud Firestore Database** (Start in test mode or configure Security Rules).

3. **Configure API Keys:**
   * Open the `firebase-config.js` file.
   * Replace the placeholder config object with your Firebase SDK config values:
     ```javascript
     const firebaseConfig = {
         apiKey: "YOUR_API_KEY",
         authDomain: "YOUR_AUTH_DOMAIN",
         projectId: "YOUR_PROJECT_ID",
         storageBucket: "YOUR_STORAGE_BUCKET",
         messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
         appId: "YOUR_APP_ID"
     };
     ```

4. **Launch the Application:**
   * Open `index.html` with a local web server (e.g. VS Code Live Server extension) at `http://127.0.0.1:5500`.
   * Head over to the **Admin Access** link in the footer of `index.html`, log in (using a registered email/password), and click **Seed Sample Products** to populate your catalog.

---

## 📜 Firestore Security Rules (Recommended)

Set the following security rules in your Firestore Console to preserve security while maintaining public access to reviews and orders:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /reviews/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /orders/{document} {
      allow read, write: if true; // Customize for authenticated users in production
    }
  }
}
```

---

## 👥 Course & Developer Info

* **Developer:** [Your Name]
* **Course:** Web and Internet Programming Lab (CSE)
* **Semester:** [Your Semester]
* **University:** [Your University]
