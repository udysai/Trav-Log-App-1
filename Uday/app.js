// -- THEME --
const themeBtn = document.getElementById('theme-toggle');
themeBtn.onclick = () => {
  document.body.classList.toggle('dark');
  themeBtn.textContent = document.body.classList.contains('dark') ? '🌕' : '🌑';
  localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
};
if(localStorage.getItem('theme')==='dark'){
  document.body.classList.add('dark');
  themeBtn.textContent = '🌕';
}

// -- USER & LOGIN --
let user = JSON.parse(localStorage.getItem('user')) || null;
const loginModal = document.getElementById('loginModal');
const logoutBtn = document.getElementById('logout');
const userDisplay = document.getElementById('currentUser');
function showLogout(loggedIn) {
  logoutBtn.style.display = loggedIn ? "inline-block" : "none";
  userDisplay.innerHTML = loggedIn && user ? `Signed in as: <b>${user.email}</b>` : "";
}
function setUser(email) {
  user = { email: email.toLowerCase() };
  localStorage.setItem('user', JSON.stringify(user));
  loginModal.classList.remove('active');
  showLogout(true);
  renderRoute();
}
function logoutUser() {
  localStorage.removeItem('user');
  user = null;
  showLogout(false);
  loginModal.classList.add('active');
  renderRoute();
}
logoutBtn.onclick = logoutUser;

document.getElementById('loginForm').onsubmit = e => {
  e.preventDefault();
  let em = document.getElementById('loginEmail').value.trim();
  if (em.length && em.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) {
    setUser(em); // Modal closes, homepage is now visible
  }
};
if (!user) {
  loginModal.classList.add('active');
} else {
  loginModal.classList.remove('active');
  showLogout(true);
}

// -- STORAGE: Trips per user --
function getTrips() {
  if (!user) return [];
  return JSON.parse(localStorage.getItem('trips_' + user.email)) || [];
}
function setTrips(trips) {
  if (user) localStorage.setItem('trips_' + user.email, JSON.stringify(trips));
}
let tripFilter = "";
const tripSearch = document.getElementById('tripSearch');
tripSearch.addEventListener('input', e => {
  tripFilter = e.target.value.toLowerCase();
  if (location.hash === "#trips") renderRoute();
});

const routes = {
  home: homePage,
  trips: tripsPage,
  gallery: galleryPage,
  notes: notesPage,
  expenses: expensesPage,
  contact: contactPage,
  about: aboutPage,
};
window.addEventListener('hashchange', renderRoute);
window.addEventListener('DOMContentLoaded', renderRoute);

function renderRoute() {
  if (!user) { loginModal.classList.add('active'); return; } else loginModal.classList.remove('active');
  const hash = location.hash.replace('#','') || 'home';
  routes[hash]?.();
}

function homePage() {
  document.getElementById('main-content').innerHTML = `
    <div class="card">
      <h1 style="margin-bottom:0.7rem;">Plan Your Next Adventure</h1>
      <div class="features-grid">
        <div class="feature-tile"><div class="icon">🗺️</div><h4>Multi-Stop Trips</h4>Create, view, and manage multi-destination journeys with ease.</div>
        <div class="feature-tile"><div class="icon">📍</div><h4>Live Location & Maps</h4>Track your trip route, log your locations, and visualize memories on interactive maps.</div>
        <div class="feature-tile"><div class="icon">💸</div><h4>Smart Expense Logs</h4>Record expenses by category, view totals, and export your reports securely.</div>
      </div>
      <div style="margin-top:2.2rem;">
        <a href="#trips"><button>Start a Trip</button></a>
        <a href="#reviews"><button class="secondary">See Reviews</button></a>
      </div>
      <div style="margin-top:2.3rem;">
        <h2 style="color:#2988d5;">Traveler Stories</h2>
        <div class="reviews-slider" id="reviewsSlider">
          ${sampleReviews.map(r => `
            <div class="review-card">
              <div class="stars">${'★'.repeat(r.stars)}${'☆'.repeat(5-r.stars)}</div>
              <p>${r.text}</p>
              <div class="author">- ${r.author}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}
const sampleReviews = [
  {author:"G.K.Narasimha Reddy, Dentist", stars:5, text:"TripDiary helped me organize my first solo backpacking adventure across Goa. Simple and beautiful!"},
  {author:"P.Veeresh, Delhi", stars:4, text:"Loved the expense tracking feature. Highly recommend for group trips."},
  {author:"C.V.Madhu Sudhan Reddy, Actor", stars:5, text:"Integrated maps and photo gallery make memories come alive."},
  {author:"K.Sudhakar", stars:5, text:"The multi-stop trip planner is genius. I will use this for all future travels!"},
];

function tripsPage() {
  let trips = getTrips();
  let filtered = tripFilter ? trips.filter(t => t.title.toLowerCase().includes(tripFilter)) : trips;
  document.getElementById('main-content').innerHTML = `
    <div class="card">
      <h2>Your Trips</h2>
      <form id="trip-form" style="margin-bottom:2rem;display:flex;gap:0.8rem;flex-wrap:wrap;">
        <input required name="title" placeholder="Trip title" style="flex:1;">
        <input required name="dest" placeholder="Destination" style="flex:1.2;">
        <input required type="date" name="start">
        <input required type="date" name="end">
        <input required type="number" name="budget" placeholder="Budget (₹)" min="0" style="width:120px;">
        <button type="submit" style="min-width:90px;">+ Add</button>
      </form>
      <div style="display:grid;gap:1.2rem;">
        ${filtered.map(trip => `
          <div class="card" style="background: var(--feature-bg);">
            <b style="font-size:1.18rem;">${trip.title}</b>
            <span style="color:#2988d5;">${trip.dest}</span>
            <br><small>${trip.start} — ${trip.end}</small>
            <br><span style="color:#14c8b6;">Budget: ₹${trip.budget || 'N/A'}</span>
          </div>
        `).join('') || "<p>No trips found.</p>"}
      </div>
    </div>
  `;
  document.getElementById('trip-form').onsubmit = e => {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.target));
    let trips = getTrips();
    trips.push({
      title: fd.title,
      dest: fd.dest,
      start: fd.start,
      end: fd.end,
      budget: fd.budget,
      gallery: [],
      notes: [],
      expenses: []
    });
    setTrips(trips);
    renderRoute();
  };
}
function galleryPage() {
  let trips = getTrips();
  let imgs = trips.flatMap(trip => trip.gallery||[]);
  document.getElementById('main-content').innerHTML = `
    <div class="card">
      <h2>Gallery</h2>
      <input id="gallery-upload" type="file" accept="image/*" multiple style="margin-bottom:1rem;">
      <div id="gallery-photos" style="display:flex; flex-wrap:wrap; gap:.75rem; margin-top:1rem;">
        ${imgs.length ? imgs.map(img => `<img src="${img}" alt="" style="width:120px;height:95px;object-fit:cover;border-radius:10px;border:2px solid #2988d53c;" loading="lazy">`).join('') : "<p>No images yet.</p>"}
      </div>
    </div>
  `;
  document.getElementById('gallery-upload').onchange = function(e) {
    let files = e.target.files, urls = [];
    for (let i=0; i<files.length; i++) urls.push(URL.createObjectURL(files[i]));
    let trips = getTrips(); if (trips.length) {
      trips[0].gallery = (trips[0].gallery||[]).concat(urls);
      setTrips(trips);
    }
    renderRoute();
  }
}

function notesPage() {
  let trips = getTrips();
  let notes = trips.flatMap(t => t.notes||[]);
  document.getElementById('main-content').innerHTML = `
    <div class="card">
      <h2>Travel Notes</h2>
      <form id="note-form" style="display:flex;gap:.8rem;flex-wrap:wrap;">
        <input type="date" name="date" required style="min-width:120px;">
        <select name="mood">
          <option>😊</option><option>😎</option><option>🤩</option><option>🥲</option>
        </select>
        <input name="text" placeholder="Your trip note..." required style="flex:1;">
        <button type="submit">+ Add Note</button>
      </form>
      <div style="display:grid;gap:1.1rem;">
        ${notes.map(n => `<div class="card" style="background:var(--feature-bg);padding:.8rem 1.1rem;"><b>${n.date}</b> ${n.mood}<br>${n.text}</div>`).join('') || "<p>No notes yet.</p>"}
      </div>
    </div>
  `;
  document.getElementById('note-form').onsubmit = e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    let trips = getTrips(); if (trips.length) {
      (trips[0].notes ||= []).push({date:fd.get('date'), text:fd.get('text'), mood:fd.get('mood')});
      setTrips(trips);
    }
    renderRoute();
  }
}

function expensesPage() {
  let trips = getTrips();
  let expenses = trips.flatMap(t => t.expenses||[]);
  const total = expenses.reduce((s,e) => s+Number(e.amt||0),0);
  document.getElementById('main-content').innerHTML = `
    <div class="card">
      <h2>Trip Expenses</h2>
      <form id="expense-form" style="display:grid;grid-template-columns:1.7fr 1.1fr 1fr 0.9fr;gap:0.6rem; margin-bottom:1rem;">
        <input required name="amt" type="number" min="1" placeholder="Amount (&#8377;)">
        <select name="cat">
          <option>Food</option>
          <option>Travel</option>
          <option>Accommodation</option>
          <option>Shopping</option>
          <option>Other</option>
        </select>
        <input type="date" name="date" required>
        <button type="submit">+ Add</button>
      </form>
      <table class="expense-table">
        <thead><tr>
          <th>Amount</th><th>Category</th><th>Date</th><th>Action</th>
        </tr></thead>
        <tbody id="expense-list">
          ${expenses.map((ex,i) =>
            `<tr>
              <td>&#8377;${ex.amt}</td>
              <td>${ex.cat}</td>
              <td>${ex.date}</td>
              <td><button onclick="removeExpense(${i})" aria-label="Delete" style="background:#ff426a;">X</button></td>
            </tr>`
          ).join('') || `<tr><td colspan="4">No expenses yet.</td></tr>`}
        </tbody>
      </table>
      <div style="text-align:right;margin-top:1.1rem;font-size:1.18rem;color:var(--primary);"><b>Total: &#8377;${total}</b></div>
    </div>
  `;
  document.getElementById('expense-form').onsubmit = e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    let trips = getTrips(); if (trips.length) {
      (trips[0].expenses ||= []).push({amt:fd.get('amt'), cat:fd.get('cat'), date:fd.get('date')});
      setTrips(trips);
    }
    renderRoute();
  }
  window.removeExpense = function(idx) {
    let trips = getTrips();
    let allExpenses = trips.flatMap(t => t.expenses||[]);
    let globalIdx = -1, foundTrip = null, expIdx=null;
    let counter = 0;
    for (let trip of trips) {
      if (trip.expenses) {
        for (let i=0; i<trip.expenses.length; i++) {
          if (counter === idx) { foundTrip = trip; expIdx = i; break;}
          counter++;
        }
      }
      if (foundTrip) break;
    }
    if (foundTrip && expIdx!=null) {
      foundTrip.expenses.splice(expIdx, 1); setTrips(trips); renderRoute();
    }
  };
}

function contactPage() {
  document.getElementById('main-content').innerHTML = `
    <section class="info-section">
      <h2>Contact Us</h2>
      <p>Email: <a href="mailto:explorex@gmail.com">explorex@gmail.com</a></p>
    </section>
  `;
}

function aboutPage() {
  document.getElementById('main-content').innerHTML = `
    <section class="info-section">
      <h2>About Us</h2>
      <blockquote style="font-size:1.13rem;color:#2988d5;margin-bottom:1.2rem;">
        "Travel is the only thing you buy that makes you richer."
      </blockquote>
      <p><b>Our Team:</b></p>
      <ul style="list-style:none;padding:0;margin-bottom:1.2rem;">
        <li style="margin-bottom:0.7rem;">
          <span style="font-weight:600;">M. Uday Kumar</span>
          <span style="background:#14c8b6;color:#fff;padding:2px 8px;border-radius:10px;font-size:0.95rem;margin-left:8px;">Team Lead</span>
          <a href="mailto:mankaruday00@gmail.com" style="margin-left:10px;color:var(--accent);text-decoration:underline;">Email</a>
        </li>
        <li><span style="font-weight:500;">G. Divya Jyothi</span>
          <a href="mailto:divyajyothi.g25@gmail.com" style="margin-left:10px;color:var(--accent);text-decoration:underline;">Email</a>
        </li>
        <li><span style="font-weight:500;">A. Afthab</span>
          <a href="mailto:agasanauraftab@gmail.com" style="margin-left:10px;color:var(--accent);text-decoration:underline;">Email</a>
        </li>
        <li><span style="font-weight:500;">A. Harshitha</span>
          <a href="mailto:harshiavvar103@gmail.com" style="margin-left:10px;color:var(--accent);text-decoration:underline;">Email</a>
        </li>
        <li><span style="font-weight:500;">E. Gayathri</span>
          <a href="mailto:ethamanugayathri@gmail.com" style="margin-left:10px;color:var(--accent);text-decoration:underline;">Email</a>
        </li>
        <li><span style="font-weight:500;">K. Roopa</span>
          <a href="mailto:kengarroopa40@gmail.com" style="margin-left:10px;color:var(--accent);text-decoration:underline;">Email</a>
        </li>
      </ul>
      <p>We are passionate travelers dedicated to making your journeys easier and more memorable.</p>
    </section>
  `;
}

function setSidebar(hash) {
  const sidebar = document.getElementById('sidebarContent');
  if (hash === "trips") {
    sidebar.innerHTML = `
      <div class="filter-section">
        <label for="tripSearch"><b>Filter Trips</b></label>
        <input id="tripSearch" type="search" placeholder="Search your trips..." autocomplete="off">
      </div>
    `;
    document.getElementById('tripSearch').addEventListener('input', e => {
      tripFilter = e.target.value.toLowerCase();
      if (location.hash === "#trips") renderRoute();
    });
  } else {
    sidebar.innerHTML = `
      <div style="padding:2rem 1rem;text-align:center;">
        <h3 style="color:var(--primary);margin-bottom:1rem;">Welcome to Trav-Log!</h3>
        <p style="color:#2988d5;font-size:1.08rem;">Plan, track, and cherish your journeys.<br>Start by adding a trip or explore features from the menu.</p>
        <div style="font-size:2.3rem;margin-top:1.2rem;">🌍 ✈️ 🏞️</div>
      </div>
    `;
  }
}
