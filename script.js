// --- script.js ---

// Product data with variant support
const products = {
  women: [
    { id: 1, name: "Floral Summer Dress", price: 49.99, rating: 4.5, reviews: 120, image: "Women1.webp", sizes: ["S", "M", "L"], colors: ["#ff6b6b", "#feca57"] },
    { id: 2, name: "Elegant Blouse", price: 35.00, rating: 4.2, reviews: 85, image: "Women3.webp", sizes: ["S", "M", "L"], colors: ["#ffffff", "#333333"] },
    { id: 3, name: "Pleated Skirt", price: 29.50, rating: 4.0, reviews: 75, image: "Women5.webp", sizes: ["M", "L"], colors: ["#b53471", "#1e90ff"] }
  ],
  men: [
    { id: 4, name: "Linen Shirt", price: 40.00, rating: 4.4, reviews: 110, image: "Men1.jpg", sizes: ["M", "L", "XL"], colors: ["#00cec9", "#0984e3"] },
    { id: 5, name: "Casual Jacket", price: 60.00, rating: 4.6, reviews: 95, image: "Men2.webp", sizes: ["M", "L", "XL"], colors: ["#2d3436", "#636e72"] },
    { id: 6, name: "Slim Jeans", price: 45.00, rating: 4.3, reviews: 100, image: "Men4.avif", sizes: ["30", "32", "34"], colors: ["#2c3e50", "#34495e"] }
  ],
  kids: [
    { id: 7, name: "Kids Hoodie", price: 25.00, rating: 4.7, reviews: 150, image: "https://source.unsplash.com/400x500/?hoodie,kid", sizes: ["XS", "S", "M"], colors: ["#e84393", "#fd79a8"] },
    { id: 8, name: "Graphic T-shirt", price: 15.00, rating: 4.5, reviews: 130, image: "https://source.unsplash.com/400x500/?tshirt,kid", sizes: ["XS", "S", "M", "L"], colors: ["#fab1a0", "#dfe6e9"] },
    { id: 9, name: "Denim Shorts", price: 20.00, rating: 4.4, reviews: 90, image: "https://source.unsplash.com/400x500/?shorts,kid", sizes: ["XS", "S", "M"], colors: ["#74b9ff", "#55efc4"] }
  ]
};

function getProductById(id) {
  return [...products.women, ...products.men, ...products.kids].find(p => p.id === id);
}

let cart = [];
let currentFilter = 'all';
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  setupScrollAnimations();
  setupSearch();
  setupQuickView();
});

// Lenis Smooth Scroll
const lenis = new Lenis({
  duration: 1.2,
  easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smooth: true
});
function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Firebase Auth
const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider).then((result) => {
    alert("Signed in as " + result.user.displayName);
  });
}

function signOut() {
  auth.signOut().then(() => alert("Signed out"));
}

function toggleWishlist(id) {
  if (wishlist.includes(id)) wishlist = wishlist.filter(pid => pid !== id);
  else wishlist.push(id);
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
  loadProducts();
}

function toggleWishlistModal() {
  document.getElementById("wishlist-page").style.display = "block";
  document.getElementById("wishlist-container").innerHTML = wishlist.map(id => {
    const item = getProductById(id);
    return `<div><img src="${item.image}" width="100"><p>${item.name}</p></div>`;
  }).join('');
}

function setupQuickView() {
  document.querySelectorAll('.quick-view').forEach(btn => {
    btn.onclick = function () {
      const card = btn.closest('.product-card');
      const id = parseInt(card.dataset.id);
      const product = getProductById(id);
      const modal = document.getElementById('quick-view-modal');
      const content = document.getElementById('quick-view-content');
      if (!modal || !content) return;
      modal.style.display = "block";

      const sizeOptions = product.sizes.map(size => `<option>${size}</option>`).join('');
      const colorSwatches = product.colors.map(c => `<input type="radio" name="color" style="background:${c}; width:20px; height:20px; margin:5px;" />`).join('');

      content.innerHTML = `
        <h2>${product.name}</h2>
        <img src="${product.image}" width="200">
        <p>${product.description || "A premium product."}</p>
        <p><b>Price:</b> $${product.price}</p>
        <label>Size:</label>
        <select>${sizeOptions}</select><br/>
        <label>Color:</label><br/>
        ${colorSwatches}
        <br/><br/>
        <button onclick="addToCart(${product.id}, '${product.name}', ${product.price}, '${product.image}')">Add to Cart</button>
      `;
    }
  });
}

function closeQuickView() {
  document.getElementById('quick-view-modal').style.display = "none";
}

function loadProducts() {
  Object.keys(products).forEach(category => {
    const container = document.getElementById(`${category}-products`);
    container.innerHTML = products[category].map(product => createCard(product, category)).join('');
  });
}

function createCard(product, category) {
  const heartClass = wishlist.includes(product.id) ? 'fas' : 'far';
  return `
    <div class="product-card" data-id="${product.id}" data-category="${category}" data-name="${product.name.toLowerCase()}">
      <div class="wishlist-icon" onclick="toggleWishlist(${product.id})">
        <i class="${heartClass} fa-heart"></i>
      </div>
      <div class="product-image">
        <img src="${product.image}" alt="${product.name}">
        <div class="product-overlay">
          <div class="quick-view">Quick View</div>
        </div>
      </div>
      <div class="product-info">
        <h3>${product.name}</h3>
        <div class="product-rating">${'★'.repeat(Math.floor(product.rating))} (${product.reviews})</div>
        <div class="product-price">$${product.price.toFixed(2)}</div>
        <button class="add-to-cart" onclick="addToCart(${product.id}, '${product.name}', ${product.price}, '${product.image}')">
          <i class="fas fa-cart-plus"></i> Add to Cart
        </button>
      </div>
    </div>
  `;
}

function addToCart(id, name, price, image) {
  const item = cart.find(i => i.id === id);
  if (item) item.quantity++;
  else cart.push({ id, name, price, image, quantity: 1 });
  updateCart();
}

function updateCart() {
  document.getElementById('cart-count').textContent = cart.reduce((sum, i) => sum + i.quantity, 0);
  const items = cart.map(i => `
    <div class="cart-item">
      <img src="${i.image}" alt="${i.name}">
      <div>
        <h4>${i.name}</h4>
        <p>$${i.price} × ${i.quantity}</p>
      </div>
      <button onclick="removeFromCart(${i.id})"><i class="fas fa-trash"></i></button>
    </div>`).join('');
  document.getElementById('cart-items').innerHTML = items;
  document.getElementById('cart-total').textContent = cart.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2);
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  updateCart();
}

function toggleCart() {
  document.getElementById('cart-sidebar').classList.toggle('open');
}

function checkout() {
  if (!cart.length) return alert('Cart is empty!');
  alert(`Order placed! Total: $${cart.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2)}`);
  cart = [];
  updateCart();
  toggleCart();
}

function filterProducts(category, e) {
  currentFilter = category;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  e.target.classList.add('active');
  document.querySelectorAll('.product-card').forEach(card => {
    card.style.display = category === 'all' || card.dataset.category === category ? 'block' : 'none';
  });
}

function setupSearch() {
  document.getElementById('search-input').addEventListener('input', function() {
    const term = this.value.toLowerCase();
    document.querySelectorAll('.product-card').forEach(card => {
      const matches = card.dataset.name.includes(term);
      const matchesFilter = currentFilter === 'all' || card.dataset.category === currentFilter;
      card.style.display = matches && matchesFilter ? 'block' : 'none';
    });
  });
}

function setupScrollAnimations() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        observer.unobserve(entry.target); // animate once
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.product-section').forEach(section => {
    section.classList.remove('show'); // reset if needed
    observer.observe(section);
  });
}

function toggleTheme() {
  document.body.classList.toggle('dark-mode');
}
