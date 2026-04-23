// ============================================
// Railway Reservation System - Frontend Logic
// All API calls hit the real Express backend
// ============================================

const API = '';  // Same origin (Express serves frontend)
let currentUser = null;

// ──────────────────────────────────────────────
// 🔐 AUTHENTICATION LOGIC
// ──────────────────────────────────────────────

function checkAuth() {
    const token = localStorage.getItem('railreserve_token');
    const userStr = localStorage.getItem('railreserve_user');
    
    if (token && userStr) {
        currentUser = JSON.parse(userStr);
        const overlay = document.getElementById('authOverlay');
        const wrapper = document.getElementById('app-wrapper');
        if (overlay) overlay.style.display = 'none';
        if (wrapper) wrapper.style.display = 'block';
        const nameDisplay = document.getElementById('userNameDisplay');
        if (nameDisplay) nameDisplay.innerText = `👤 ${currentUser.full_name}`;
        
        const bookName = document.getElementById('bookName');
        const bookEmail = document.getElementById('bookEmail');
        if (bookName) bookName.value = currentUser.full_name;
        if (bookEmail) bookEmail.value = currentUser.email;

        loadDashboard();
    } else {
        const overlay = document.getElementById('authOverlay');
        const wrapper = document.getElementById('app-wrapper');
        if (overlay) overlay.style.display = 'flex';
        if (wrapper) wrapper.style.display = 'none';
    }
}

function switchAuthView(view) {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    if (view === 'login') {
        if (loginForm) loginForm.style.display = 'block';
        if (signupForm) signupForm.style.display = 'none';
    } else {
        if (loginForm) loginForm.style.display = 'none';
        if (signupForm) signupForm.style.display = 'block';
    }
}

async function loginUser() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        showToast('Please fill all fields', 'error');
        return;
    }

    const data = await apiCall('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
    
    if (data.success) {
        localStorage.setItem('railreserve_token', data.token);
        localStorage.setItem('railreserve_user', JSON.stringify(data.user));
        showToast('Logged in successfully!', 'success');
        checkAuth();
    } else {
        showToast(data.message, 'error');
    }
}

async function registerUser() {
    const full_name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    if (!full_name || !email || !password) {
        showToast('Please fill all fields', 'error');
        return;
    }

    const data = await apiCall('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ full_name, email, password })
    });
    
    if (data.success) {
        localStorage.setItem('railreserve_token', data.token);
        localStorage.setItem('railreserve_user', JSON.stringify(data.user));
        showToast('Account created successfully!', 'success');
        checkAuth();
    } else {
        showToast(data.message, 'error');
    }
}

function logoutUser() {
    localStorage.removeItem('railreserve_token');
    localStorage.removeItem('railreserve_user');
    currentUser = null;
    checkAuth();
    showToast('Logged out successfully', 'success');
}

// ──────────────────────────────────────────────
// UTILITY FUNCTIONS
// ──────────────────────────────────────────────

async function apiCall(url, options = {}) {
    try {
        const headers = { 'Content-Type': 'application/json' };
        const token = localStorage.getItem('railreserve_token');
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(API + url, {
            headers,
            ...options
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API Error:', error);
        return { success: false, message: 'Connection error: ' + error.message };
    }
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `${type === 'success' ? '✅' : '❌'} ${message}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

function formatCurrency(amount) {
    return '₹' + parseFloat(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 0 });
}

function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ──────────────────────────────────────────────
// TAB NAVIGATION
// ──────────────────────────────────────────────

function switchTab(tabName) {
    // Hide all panels, deactivate all tabs
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));

    // Show target panel
    const panel = document.getElementById('tab-' + tabName);
    if (panel) panel.classList.add('active');

    // Activate the correct nav tab
    const tabs = document.querySelectorAll('.nav-tab');
    const tabMap = ['dashboard', 'book', 'cancel', 'seats', 'transactions', 'mongodb', 'dbms'];
    const idx = tabMap.indexOf(tabName);
    if (idx >= 0 && tabs[idx]) tabs[idx].classList.add('active');

    // Load data for the tab
    if (tabName === 'dashboard') loadDashboard();
    if (tabName === 'book') loadTrainsDropdown();
    if (tabName === 'seats') loadTrainsForSeatMap();
    if (tabName === 'transactions') loadTransactions();
    if (tabName === 'mongodb') mongoSearch();
}

function switchMongoTab(tab) {
    // Buttons
    document.querySelectorAll('.sub-tab').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');

    // Panels
    document.querySelectorAll('.mongo-sub').forEach(p => p.style.display = 'none');
    document.getElementById(`mongo-${tab}`).style.display = 'block';
}

// ──────────────────────────────────────────────
// MONGODB SUB-TAB NAVIGATION
// ──────────────────────────────────────────────

// MongoDB analytics sub-tabs removed to integrate directly into Dashboard.

// ──────────────────────────────────────────────
// 📊 DASHBOARD
// ──────────────────────────────────────────────

async function loadDashboard() {
    const data = await apiCall('/api/analytics/dashboard');
    if (!data.success) {
        document.getElementById('statBookings').textContent = '0';
        document.getElementById('statRevenue').textContent = '₹0';
        document.getElementById('statPassengers').textContent = '0';
        document.getElementById('statTopTrain').textContent = 'N/A';
        document.getElementById('revenueChart').innerHTML = '<div class="empty-state"><div class="empty-state-icon">📊</div><p class="empty-state-text">No data yet. Book some tickets first!</p></div>';
        document.getElementById('recentBookings').innerHTML = '<div class="empty-state"><div class="empty-state-icon">🎫</div><p class="empty-state-text">No bookings yet.</p></div>';
        return;
    }

    const s = data.data.summary;

    // Animate stat counters
    animateCounter('statBookings', s.total_bookings || 0);
    document.getElementById('statRevenue').textContent = formatCurrency(s.total_revenue);
    animateCounter('statPassengers', s.total_passengers || 0);
    document.getElementById('statTopTrain').textContent = s.most_booked_train ? s.most_booked_train.train_name : 'N/A';
    if (s.most_booked_train) {
        document.getElementById('statTopTrain').style.fontSize = '1rem';
    }

    // Revenue chart
    const revData = data.data.revenue_per_train || [];
    const maxRev = Math.max(...revData.map(r => r.revenue), 1);
    if (revData.length === 0 || maxRev === 0) {
        document.getElementById('revenueChart').innerHTML = '<div class="empty-state"><div class="empty-state-icon">📊</div><p class="empty-state-text">No revenue data yet.</p></div>';
    } else {
        document.getElementById('revenueChart').innerHTML = revData.map(r => `
            <div class="chart-bar-row">
                <div class="chart-bar-label" title="${r.train_name}">${r.train_name}</div>
                <div class="chart-bar-track">
                    <div class="chart-bar-fill" style="width: ${(r.revenue / maxRev) * 100}%;">
                        <span class="chart-bar-value">${formatCurrency(r.revenue)} (${r.total_bookings} bookings)</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Recent bookings
    const recent = data.data.recent_bookings || [];
    if (recent.length === 0) {
        document.getElementById('recentBookings').innerHTML = '<div class="empty-state"><div class="empty-state-icon">🎫</div><p class="empty-state-text">No bookings yet.</p></div>';
    } else {
        document.getElementById('recentBookings').innerHTML = recent.map(b => `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border-glass);">
                <div>
                    <div style="font-weight: 600; font-size: 0.85rem;">${b.passenger_name}</div>
                    <div style="color: var(--text-muted); font-size: 0.75rem;">${b.train_name} • Seat ${b.seat_number}</div>
                </div>
                <div style="text-align: right;">
                    <span class="badge ${b.status === 'CONFIRMED' ? 'badge-success' : 'badge-danger'}">${b.status}</span>
                    <div style="color: var(--text-muted); font-size: 0.7rem; margin-top: 4px;">${b.pnr_number}</div>
                </div>
            </div>
        `).join('');
    }
}

function animateCounter(id, target) {
    const el = document.getElementById(id);
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 30));
    const interval = setInterval(() => {
        current += step;
        if (current >= target) {
            current = target;
            clearInterval(interval);
        }
        el.textContent = current;
    }, 30);
}

// ──────────────────────────────────────────────
// 🔍 SEARCH TRAINS
// ──────────────────────────────────────────────

async function searchTrains() {
    const source = document.getElementById('searchSource').value;
    const dest = document.getElementById('searchDest').value;

    if (!source || !dest) {
        showToast('Please select both source and destination', 'error');
        return;
    }

    document.getElementById('searchBtn').disabled = true;
    document.getElementById('searchBtn').innerHTML = '<span class="spinner"></span> Searching...';

    const data = await apiCall(`/api/trains/search?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(dest)}`);

    document.getElementById('searchBtn').disabled = false;
    document.getElementById('searchBtn').innerHTML = '🔍 Search Trains';

    const container = document.getElementById('searchResults');

    if (!data.success || data.count === 0) {
        container.innerHTML = `
            <div class="card">
                <div class="empty-state">
                    <div class="empty-state-icon">🔍</div>
                    <p class="empty-state-text">No trains found from ${source} to ${dest}</p>
                </div>
            </div>`;
        return;
    }

    container.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">Found ${data.count} train${data.count > 1 ? 's' : ''}</h2>
                <span class="badge badge-info">SQL Query Executed</span>
            </div>
            <div class="code-block" style="margin-bottom: 1rem;">${data.query}</div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Train #</th>
                            <th>Name</th>
                            <th>Route</th>
                            <th>Departure</th>
                            <th>Arrival</th>
                            <th>Available</th>
                            <th>Fare</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.data.map(t => `
                            <tr>
                                <td>${t.train_number}</td>
                                <td style="font-weight: 600;">${t.train_name}</td>
                                <td>${t.source} → ${t.destination}</td>
                                <td>${t.departure_time}</td>
                                <td>${t.arrival_time}</td>
                                <td><span class="badge ${t.real_available > 0 ? 'badge-success' : 'badge-danger'}">${t.real_available}/${t.total_seats}</span></td>
                                <td style="font-weight: 700; color: var(--accent-secondary);">${formatCurrency(t.fare)}</td>
                                <td><button class="btn btn-primary btn-sm" onclick="quickBook(${t.train_id})">Book</button></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>`;
}

function quickBook(trainId) {
    switchTab('book');
    setTimeout(() => {
        document.getElementById('bookTrain').value = trainId;
    }, 300);
}

// ──────────────────────────────────────────────
// 🎫 BOOK TICKET
// ──────────────────────────────────────────────

async function loadTrainsDropdown() {
    const data = await apiCall('/api/trains');
    const select = document.getElementById('bookTrain');
    const seatSelect = document.getElementById('seatTrainSelect');

    if (data.success) {
        select.innerHTML = '<option value="">Select a train</option>' +
            data.data.map(t => `<option value="${t.train_id}">${t.train_number} - ${t.train_name} (${t.source}→${t.destination}) - ${formatCurrency(t.fare)} (${t.real_available} seats)</option>`).join('');
    }
}

async function loadTrainsForSeatMap() {
    const data = await apiCall('/api/trains');
    const select = document.getElementById('seatTrainSelect');
    if (data.success) {
        select.innerHTML = '<option value="">Select a train</option>' +
            data.data.map(t => `<option value="${t.train_id}">${t.train_number} - ${t.train_name}</option>`).join('');
    }
}

async function bookTicket() {
    const name = document.getElementById('bookName').value.trim();
    const email = document.getElementById('bookEmail').value.trim();
    const phone = document.getElementById('bookPhone').value.trim();
    const age = document.getElementById('bookAge').value;
    const gender = document.getElementById('bookGender').value;
    const train_id = document.getElementById('bookTrain').value;
    const seat = document.getElementById('bookSeat').value;
    const payment = document.getElementById('bookPayment').value;

    if (!name || !email || !phone || !age || !train_id) {
        showToast('Please fill all required fields', 'error');
        return;
    }

    document.getElementById('bookBtn').disabled = true;
    document.getElementById('bookBtn').innerHTML = '<span class="spinner"></span> Processing Transaction...';

    const payload = {
        passenger_name: name,
        email,
        phone,
        age: parseInt(age),
        gender,
        train_id: parseInt(train_id),
        payment_method: payment,
        simulate_payment_failure: document.getElementById('simPaymentFail').checked
    };
    if (seat) payload.seat_number = parseInt(seat);

    const data = await apiCall('/api/bookings', {
        method: 'POST',
        body: JSON.stringify(payload)
    });

    document.getElementById('bookBtn').disabled = false;
    document.getElementById('bookBtn').innerHTML = '🎫 Book Ticket (Execute Transaction)';

    const container = document.getElementById('bookingResult');

    if (data.success) {
        showToast(`Booking confirmed! PNR: ${data.booking.pnr_number}`);
        
        const trainSelect = document.getElementById('bookTrain');
        const trainText = trainSelect.options[trainSelect.selectedIndex].text.split(' (')[0];

        container.innerHTML = `
            <div class="result-panel">
                <div class="result-panel-header">
                    <h3 style="color: var(--success);">✅ Booking Confirmed</h3>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <button class="btn btn-primary btn-sm" onclick="downloadReceiptPdf()">📄 Download PDF</button>
                        <span class="badge badge-success">COMMITTED</span>
                    </div>
                </div>
                <div class="result-panel-body">
                    
                    <!-- NEW TICKET RECEIPT UI -->
                    <div id="ticketReceiptDiv" class="ticket-receipt" style="background: var(--bg-secondary); border: 2px dashed var(--border-glass); border-radius: var(--radius-md); padding: 1.5rem; margin-bottom: 2rem; position: relative; overflow: hidden; box-shadow: var(--shadow-sm);">
                        <div style="position: absolute; top: 0; left: 0; width: 6px; height: 100%; background: var(--accent-gradient);"></div>
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid var(--border-glass); padding-bottom: 1rem; margin-bottom: 1rem;">
                            <div>
                                <h2 style="font-size: 1.4rem; font-weight: 800; color: var(--text-primary); margin-bottom: 4px; letter-spacing: -0.5px;">E-Ticket Reservation</h2>
                                <div style="color: var(--text-muted); font-size: 0.85rem; font-weight: 500;">Enterprise Railway System Engine</div>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600; letter-spacing: 1px;">PNR Number</div>
                                <div style="font-size: 1.6rem; font-weight: 800; color: var(--accent-primary); letter-spacing: 2px; margin-top: -2px;">${data.booking.pnr_number}</div>
                            </div>
                        </div>
                        <div class="grid-2" style="margin-bottom: 1.2rem; row-gap: 1.2rem;">
                            <div>
                                <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600; margin-bottom: 2px;">Passenger Details</div>
                                <div style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary);">${name}</div>
                            </div>
                            <div>
                                <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600; margin-bottom: 2px;">Train Details</div>
                                <div style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary);">${trainText}</div>
                            </div>
                        </div>
                        <div class="grid-3" style="background: var(--bg-glass); padding: 1.2rem; border-radius: var(--radius-sm); border: 1px solid var(--border-glass);">
                            <div>
                                <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Seat Number</div>
                                <div style="font-size: 1.4rem; font-weight: 800; color: var(--text-primary); margin-top: 2px;">${data.booking.seat_number}</div>
                            </div>
                            <div>
                                <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Total Fare</div>
                                <div style="font-size: 1.4rem; font-weight: 800; color: var(--text-primary); margin-top: 2px;">${formatCurrency(data.booking.amount)}</div>
                            </div>
                            <div>
                                <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">ACID Protocol</div>
                                <div style="font-size: 1rem; font-weight: 800; color: var(--success); margin-top: 2px;">VERIFIED</div>
                            </div>
                        </div>
                    </div>

                    <div class="card" style="margin-bottom: 1.5rem; background: rgba(99, 102, 241, 0.05);">
                        <div class="card-header"><h4 class="card-title">🔐 Transaction Technical Breakdown (ACID)</h4></div>
                        <div style="font-size: 0.85rem; line-height: 1.6;">
                            <p style="margin-bottom: 8px;"><strong>Atomicity:</strong> All 5 database updates (Passenger, Booking, Seat, Payment, Log) succeeded as a single unit or "atom".</p>
                            <p style="margin-bottom: 8px;"><strong>Consistency:</strong> Database constraints (Foreign Keys & Unique Seat ID) were verified before the <code>COMMIT</code>.</p>
                            <p style="margin-bottom: 8px;"><strong>Isolation:</strong> Row-level locks were held on Seat ID <code>${data.booking.seat_number}</code> to prevent race conditions from other users.</p>
                            <p><strong>Durability:</strong> Your booking is now permanently recorded in the <code>Booking</code> table's non-volatile storage.</p>
                        </div>
                    </div>

                    <h4 style="margin-bottom: 1rem; color: var(--text-secondary);">📝 Transaction Trace Timeline</h4>
                    <div class="timeline">
                        ${data.transaction_steps.map(s => `
                            <div class="timeline-item ${s.status === 'SUCCESS' || s.status === 'OK' ? 'success' : s.status === 'ROLLED_BACK' ? 'error' : ''}">
                                <div><span class="timeline-step">Step ${s.step}:</span> ${s.action} — <strong>${s.status}</strong></div>
                                ${s.sql ? `<div class="timeline-sql">${s.sql}</div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>`;

        // Clear form
        document.getElementById('bookName').value = '';
        document.getElementById('bookSeat').value = '';

    } else {
        showToast(data.message, 'error');
        container.innerHTML = `
            <div class="result-panel">
                <div class="result-panel-header" style="background: var(--danger-bg);">
                    <h3 style="color: var(--danger);">❌ Booking Failed — ROLLBACK</h3>
                    <span class="badge badge-danger">ROLLED BACK</span>
                </div>
                <div class="result-panel-body">
                    <div class="alert alert-error">⚠️ ${data.message}</div>
                    ${data.transaction_steps ? `
                        <h4 style="margin-bottom: 1rem; color: var(--text-secondary);">📝 Transaction Steps (Before Rollback)</h4>
                        <div class="timeline">
                            ${data.transaction_steps.map(s => `
                                <div class="timeline-item ${s.action === 'ROLLBACK' ? 'error' : 'success'}">
                                    <div><span class="timeline-step">Step ${s.step}:</span> ${s.action} — <strong>${s.status}</strong></div>
                                    ${s.sql ? `<div class="timeline-sql">${s.sql}</div>` : ''}
                                    ${s.reason ? `<div style="color: var(--danger); font-size: 0.78rem; margin-top: 4px;">Reason: ${s.reason}</div>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>`;
    }
}

// ──────────────────────────────────────────────
// 📄 DOWNLOAD RECEIPT PDF
// ──────────────────────────────────────────────
function downloadReceiptPdf() {
    const element = document.getElementById('ticketReceiptDiv');
    if (!element) return;
    
    document.getElementById('toastContainer').innerHTML = ''; // Clear toasts
    showToast('Generating PDF please wait...', 'success');

    const opt = {
        margin:       10, 
        filename:     'RailReserve_Ticket.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, scrollY: 0 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Use the actual element on screen, don't use a clone because html2canvas 
    // cannot accurately render elements that are not attached to the screen document.
    html2pdf()
        .set(opt)
        .from(element)
        .save()
        .then(() => {
            showToast('PDF downloaded successfully!');
        })
        .catch(err => {
            console.error('PDF Generation Error:', err);
            showToast('Failed to generate PDF', 'error');
        });
}

// ──────────────────────────────────────────────
// ❌ CANCEL BOOKING
// ──────────────────────────────────────────────

async function loadActiveBookings() {
    const data = await apiCall('/api/bookings');
    const container = document.getElementById('activeBookingsList');

    if (!data.success) {
        container.innerHTML = `<div class="alert alert-error">⚠️ ${data.message}</div>`;
        return;
    }

    const active = data.data.filter(b => b.status === 'CONFIRMED');

    if (active.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="padding: 2rem;">
                <div class="empty-state-icon">🎫</div>
                <p class="empty-state-text">No active reservations found.</p>
                <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 5px;">Book a train above to see it here.</p>
            </div>`;
        return;
    }

    container.innerHTML = `
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>PNR</th>
                        <th>Passenger</th>
                        <th>Train</th>
                        <th>Seat</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${active.map(b => `
                        <tr>
                            <td><code style="color: var(--accent-primary); font-weight: 700;">${b.pnr_number}</code></td>
                            <td>${b.passenger_name}</td>
                            <td>${b.train_name}</td>
                            <td><span class="badge badge-info">${b.seat_number}</span></td>
                            <td>${formatCurrency(b.amount)}</td>
                            <td><span class="badge badge-success">${b.status}</span></td>
                            <td>
                                <button class="btn btn-danger btn-sm" onclick="cancelTicket('${b.pnr_number}')">
                                    ❌ Cancel
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>`;
}

async function cancelTicket(pnr) {
    if (!confirm(`Are you sure you want to cancel booking ${pnr}? This will trigger a DBMS Rollback demonstration.`)) return;

    showToast('Initiating cancellation transaction...', 'info');
    
    // Switch to results view area
    const container = document.getElementById('bookingResult');
    container.innerHTML = '<div class="loading-overlay"><span class="spinner"></span> Processing Rollback...</div>';
    
    const data = await apiCall('/api/cancel', {
        method: 'POST',
        body: JSON.stringify({ pnr_number: pnr })
    });

    if (data.success) {
        showToast('Booking cancelled successfully!', 'success');
        loadActiveBookings(); // Refresh list
        
        container.innerHTML = `
            <div class="result-panel">
                <div class="result-panel-header" style="background: var(--danger-bg);">
                    <h3 style="color: var(--danger);">🛑 Cancellation & Refund Commited</h3>
                    <span class="badge badge-danger">CANCELLED</span>
                </div>
                <div class="result-panel-body">
                    <div class="alert alert-success">✅ PNR ${pnr} has been cancelled. Seat ${data.cancellation.seat_released} is now available.</div>
                    
                    <div class="card" style="margin-top: 1rem; background: rgba(239, 68, 68, 0.05);">
                        <div class="card-header"><h4 class="card-title">📉 Rollback & Asset Release</h4></div>
                        <div style="font-size: 0.85rem; line-height: 1.6;">
                            <p style="margin-bottom: 8px;"><strong>State Change:</strong> The booking status was moved from <code>CONFIRMED</code> to <code>CANCELLED</code>.</p>
                            <p style="margin-bottom: 8px;"><strong>Resource Release:</strong> Seat <code>${data.cancellation.seat_released}</code> was cleared and the inventory count was incremented.</p>
                            <p><strong>Financial Refund:</strong> The Payment record for <code>${formatCurrency(data.cancellation.refund_amount)}</code> was marked as <code>REFUNDED</code>.</p>
                        </div>
                    </div>

                    <h4 style="margin-bottom: 1rem; color: var(--text-secondary); margin-top: 1.5rem;">📝 Transaction Log</h4>
                    <div class="timeline">
                        ${data.transaction_steps.map(s => `
                            <div class="timeline-item ${s.status === 'SUCCESS' || s.status === 'OK' || s.status === 'RELEASED' ? 'success' : 'error'}">
                                <div><span class="timeline-step">Step ${s.step}:</span> ${s.action} — <strong>${s.status}</strong></div>
                                ${s.sql ? `<div class="timeline-sql">${s.sql}</div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>`;
    } else {
        showToast(data.message, 'error');
        container.innerHTML = `<div class="alert alert-error">❌ ${data.message}</div>`;
    }
}

async function cancelBooking() {
    const pnr = document.getElementById('cancelPnr').value.trim();
    if (!pnr) {
        showToast('Please enter a PNR number', 'error');
        return;
    }

    document.getElementById('cancelBtn').disabled = true;
    document.getElementById('cancelBtn').innerHTML = '<span class="spinner"></span> Processing...';

    const data = await apiCall('/api/cancel', {
        method: 'POST',
        body: JSON.stringify({ pnr_number: pnr })
    });

    document.getElementById('cancelBtn').disabled = false;
    document.getElementById('cancelBtn').innerHTML = '❌ Cancel Booking';

    const container = document.getElementById('cancelResult');

    if (data.success) {
        showToast(`Booking ${pnr} cancelled. Refund: ${formatCurrency(data.cancellation.refund_amount)}`);
        container.innerHTML = `
            <div class="result-panel">
                <div class="result-panel-header">
                    <h3 style="color: var(--warning);">🔄 Cancellation Complete — Rollback Demo</h3>
                    <span class="badge badge-warning">REFUNDED</span>
                </div>
                <div class="result-panel-body">
                    <div class="grid-3" style="margin-bottom: 1.5rem;">
                        <div class="stat-card">
                            <div class="stat-label">PNR</div>
                            <div style="font-weight: 700; font-size: 1rem; color: var(--warning);">${data.cancellation.pnr_number}</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label">Seat Released</div>
                            <div style="font-weight: 700; font-size: 1rem;">${data.cancellation.seat_released}</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label">Refund Amount</div>
                            <div style="font-weight: 700; font-size: 1rem; color: var(--success);">${formatCurrency(data.cancellation.refund_amount)}</div>
                        </div>
                    </div>
                    <h4 style="margin-bottom: 1rem; color: var(--text-secondary);">📝 Rollback Steps</h4>
                    <div class="timeline">
                        ${data.transaction_steps.map(s => `
                            <div class="timeline-item success">
                                <div><span class="timeline-step">Step ${s.step}:</span> ${s.action} — <strong>${s.status}</strong></div>
                                ${s.sql ? `<div class="timeline-sql">${s.sql}</div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>`;
        document.getElementById('cancelPnr').value = '';
        loadActiveBookings();
    } else {
        showToast(data.message, 'error');
        container.innerHTML = `<div class="alert alert-error">❌ ${data.message}</div>`;
    }
}

// ──────────────────────────────────────────────
// 💺 SEAT MAP
// ──────────────────────────────────────────────

async function loadSeatMap() {
    const trainId = document.getElementById('seatTrainSelect').value;
    if (!trainId) {
        document.getElementById('seatMapContainer').style.display = 'none';
        return;
    }

    const data = await apiCall(`/api/trains/${trainId}/seats`);

    if (!data.success) {
        showToast('Failed to load seat map', 'error');
        return;
    }

    document.getElementById('seatMapContainer').style.display = 'block';
    document.getElementById('seatMapTitle').textContent = `Seat Map — Train #${trainId}`;
    document.getElementById('seatAvailable').textContent = `${data.available} Available`;
    document.getElementById('seatBooked').textContent = `${data.booked} Booked`;

    const grid = document.getElementById('seatGrid');
    grid.innerHTML = data.seats.map(s => `
        <div class="seat ${s.is_booked ? 'booked' : 'available'}" 
             title="${s.is_booked ? 'Booked by ' + (s.passenger_name || 'Unknown') + ' (PNR: ' + (s.pnr_number || 'N/A') + ')' : 'Available - Click to book'}"
             ${!s.is_booked ? `onclick="quickBookSeat(${trainId}, ${s.seat_number})"` : ''}>
            ${s.seat_number}
        </div>
    `).join('');
}

function quickBookSeat(trainId, seatNumber) {
    switchTab('book');
    setTimeout(() => {
        document.getElementById('bookTrain').value = trainId;
        document.getElementById('bookSeat').value = seatNumber;
    }, 300);
}

// ──────────────────────────────────────────────
// 📜 TRANSACTIONS
// ──────────────────────────────────────────────

async function loadTransactions(filter) {
    const url = filter ? `/api/transactions?operation=${filter}` : '/api/transactions';
    const data = await apiCall(url);
    const container = document.getElementById('transactionLogs');

    if (!data.success || data.count === 0) {
        container.innerHTML = '<div class="card"><div class="empty-state"><div class="empty-state-icon">📜</div><p class="empty-state-text">No transaction logs yet. Perform some operations first.</p></div></div>';
        return;
    }

    container.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">${data.count} Transaction Log${data.count > 1 ? 's' : ''}</h2>
                <span class="badge badge-info">TransactionLog Table</span>
            </div>
            <div class="table-container">
                <table>
                    <thead><tr><th>ID</th><th>Operation</th><th>Booking ID</th><th>Status</th><th>Details</th><th>Timestamp</th></tr></thead>
                    <tbody>
                        ${data.data.map(log => `
                            <tr>
                                <td>${log.log_id}</td>
                                <td><span class="badge ${getOperationBadge(log.operation)}">${log.operation}</span></td>
                                <td>${log.booking_id || '—'}</td>
                                <td><span class="badge ${getStatusBadge(log.status)}">${log.status}</span></td>
                                <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title='${(log.details || '').replace(/'/g, "&#39;")}'>${log.details ? truncate(log.details, 60) : '—'}</td>
                                <td style="font-size: 0.75rem; color: var(--text-muted);">${formatDate(log.timestamp)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>`;
}

function getOperationBadge(op) {
    const map = { BOOK: 'badge-success', CANCEL: 'badge-warning', REFUND: 'badge-info', FAILURE: 'badge-danger', CONCURRENT_SIM: 'badge-info', DEADLOCK_SIM: 'badge-danger' };
    return map[op] || 'badge-info';
}

function getStatusBadge(status) {
    const map = { SUCCESS: 'badge-success', FAILED: 'badge-danger', ROLLBACK: 'badge-warning', CONFLICT: 'badge-warning', DEADLOCK_DETECTED: 'badge-danger' };
    return map[status] || 'badge-info';
}

function truncate(str, len) {
    return str.length > len ? str.substring(0, len) + '...' : str;
}

// ──────────────────────────────────────────────
// 🍃 MONGODB OPERATIONS
// ──────────────────────────────────────────────

async function mongoInsert() {
    const payload = {
        passenger_name: document.getElementById('mongoName').value || 'Test User',
        email: document.getElementById('mongoEmail').value || 'test@mail.com',
        phone: document.getElementById('mongoPhone').value || '9999999999',
        train: document.getElementById('mongoTrain').value || 'Rajdhani Express',
        fare: parseFloat(document.getElementById('mongoFare').value) || 1450,
        age: 25,
        gender: 'Male'
    };

    const data = await apiCall('/api/mongo/book', {
        method: 'POST',
        body: JSON.stringify(payload)
    });

    const container = document.getElementById('mongoCrudResult');
    if (data.success) {
        showToast('MongoDB booking inserted!');
        container.innerHTML = `
            <div class="result-panel">
                <div class="result-panel-header">
                    <h3 style="color: var(--success);">✅ Document Inserted</h3>
                    <span class="badge badge-success">insertOne()</span>
                </div>
                <div class="result-panel-body">
                    <div class="code-block" style="margin-bottom: 1rem;">${data.mongo_query}</div>
                    <div class="json-viewer">${JSON.stringify(data.data, null, 2)}</div>
                </div>
            </div>`;
    } else {
        container.innerHTML = `<div class="alert alert-error">❌ ${data.message}</div>`;
    }
}

async function mongoSearch() {
    const train = document.getElementById('mongoSearchTrain').value;
    const status = document.getElementById('mongoSearchStatus').value;
    let url = '/api/mongo/search?';
    if (train) url += `train=${encodeURIComponent(train)}&`;
    if (status) url += `status=${status}`;

    const data = await apiCall(url);
    const container = document.getElementById('mongoCrudResult');

    if (data.success) {
        container.innerHTML = `
            <div class="result-panel">
                <div class="result-panel-header">
                    <h3>🔍 Search Results (${data.count})</h3>
                    <span class="badge badge-info">find()</span>
                </div>
                <div class="result-panel-body">
                    <div class="code-block" style="margin-bottom: 1rem;">${data.mongo_query}</div>
                    ${data.count === 0 ? '<div class="empty-state"><p class="empty-state-text">No documents found.</p></div>' : `
                    <div class="table-container">
                        <table>
                            <thead><tr><th>PNR</th><th>Passenger</th><th>Train</th><th>Seat</th><th>Fare</th><th>Status</th><th>Actions</th></tr></thead>
                            <tbody>
                                ${data.data.map(d => `
                                    <tr>
                                        <td style="font-weight: 600;">${d.pnr || '—'}</td>
                                        <td>${d.passenger_name}</td>
                                        <td>${d.train}</td>
                                        <td>${d.seat_number}</td>
                                        <td>${formatCurrency(d.fare)}</td>
                                        <td><span class="badge ${d.status === 'CONFIRMED' ? 'badge-success' : 'badge-danger'}">${d.status}</span></td>
                                        <td>
                                            <button class="btn btn-danger btn-sm" onclick="mongoDelete('${d._id}')">Delete</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>`}
                </div>
            </div>`;
    }
}

async function mongoDelete(id) {
    if (!confirm('Delete this MongoDB document?')) return;
    const data = await apiCall(`/api/mongo/delete/${id}`, { method: 'DELETE' });
    if (data.success) {
        showToast('MongoDB document deleted');
        mongoSearch();
    } else {
        showToast(data.message, 'error');
    }
}

async function mongoAggregateRevenue() {
    const data = await apiCall('/api/mongo/aggregate/revenue');
    const container = document.getElementById('mongoAggregateResult');

    container.innerHTML = `
        <div class="result-panel">
            <div class="result-panel-header">
                <h3>💰 Revenue Aggregation</h3>
                <span class="badge badge-success">$group</span>
            </div>
            <div class="result-panel-body">
                <div class="code-block" style="margin-bottom: 1rem;">${data.mongo_query}</div>
                <div class="json-viewer">${JSON.stringify(data.data, null, 2)}</div>
            </div>
        </div>`;
}

async function mongoAggregateStats() {
    const data = await apiCall('/api/mongo/aggregate/stats');
    const container = document.getElementById('mongoAggregateResult');

    container.innerHTML = `
        <div class="result-panel">
            <div class="result-panel-header">
                <h3>📊 Booking Statistics</h3>
                <span class="badge badge-info">$facet</span>
            </div>
            <div class="result-panel-body">
                <div class="code-block" style="margin-bottom: 1rem;">${data.mongo_query}</div>
                <div class="json-viewer">${JSON.stringify(data.data, null, 2)}</div>
            </div>
        </div>`;
}

async function mongoLookup() {
    const data = await apiCall('/api/mongo/lookup');
    const container = document.getElementById('mongoLookupResult');

    container.innerHTML = `
        <div class="result-panel">
            <div class="result-panel-header">
                <h3>🔗 $lookup (JOIN)</h3>
                <span class="badge badge-warning">LEFT JOIN equivalent</span>
            </div>
            <div class="result-panel-body">
                <div class="compare-grid">
                    <div class="compare-card">
                        <span class="tag tag-mongo">MongoDB Query</span>
                        <div class="code-block">${data.mongo_query}</div>
                    </div>
                    <div class="compare-card">
                        <span class="tag tag-sql">Equivalent SQL</span>
                        <div class="code-block">${data.equivalent_sql}</div>
                    </div>
                </div>
                <div class="json-viewer" style="margin-top: 1rem; max-height: 300px;">${JSON.stringify(data.data, null, 2)}</div>
            </div>
        </div>`;
}

async function mongoIndexes() {
    const data = await apiCall('/api/mongo/indexes');
    const container = document.getElementById('mongoIndexResult');

    container.innerHTML = `
        <div class="result-panel">
            <div class="result-panel-header">
                <h3>📑 MongoDB Indexes</h3>
            </div>
            <div class="result-panel-body">
                <div class="code-block" style="margin-bottom: 1rem;">${data.mongo_query}</div>
                <h4 style="margin-bottom: 0.5rem; color: var(--text-secondary);">Bookings Collection Indexes</h4>
                <div class="json-viewer" style="margin-bottom: 1rem;">${JSON.stringify(data.indexes?.bookings, null, 2)}</div>
                <h4 style="margin-bottom: 0.5rem; color: var(--text-secondary);">Indexing Explanation</h4>
                <div class="json-viewer">${JSON.stringify(data.indexing_explanation, null, 2)}</div>
            </div>
        </div>`;
}

async function mongoCompare() {
    const data = await apiCall('/api/mongo/compare');
    const container = document.getElementById('mongoCompareResult');

    if (!data.success) {
        container.innerHTML = `<div class="alert alert-error">❌ ${data.message}</div>`;
        return;
    }

    const comp = data.comparison;
    container.innerHTML = `
        <div class="result-panel">
            <div class="result-panel-header">
                <h3>🔄 SQL vs MongoDB Comparison</h3>
            </div>
            <div class="result-panel-body">
                <h4 style="margin-bottom: 1rem;">Feature Comparison</h4>
                <div class="table-container" style="margin-bottom: 1.5rem;">
                    <table>
                        <thead><tr><th>Feature</th><th style="color: var(--info);">SQL (MySQL)</th><th style="color: var(--success);">MongoDB</th></tr></thead>
                        <tbody>
                            ${comp.key_differences.map(d => `
                                <tr>
                                    <td style="font-weight: 600;">${d.feature}</td>
                                    <td>${d.sql}</td>
                                    <td>${d.mongodb}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <h4 style="margin-bottom: 1rem;">Same Query — Both Databases</h4>
                <div class="compare-grid">
                    <div class="compare-card">
                        <span class="tag tag-sql">SQL Query</span>
                        <div class="code-block" style="font-size: 0.7rem; margin-bottom: 8px;">${comp.search_bookings.sql.query}</div>
                        <p style="font-size: 0.78rem; color: var(--text-muted);">${comp.search_bookings.sql.result_count} results</p>
                    </div>
                    <div class="compare-card">
                        <span class="tag tag-mongo">MongoDB Query</span>
                        <div class="code-block" style="font-size: 0.7rem; margin-bottom: 8px;">${comp.search_bookings.mongodb.query}</div>
                        <p style="font-size: 0.78rem; color: var(--text-muted);">${comp.search_bookings.mongodb.result_count} results</p>
                    </div>
                </div>
            </div>
        </div>`;
}

async function mongoAllQueries() {
    const data = await apiCall('/api/mongo/all-queries');
    const container = document.getElementById('mongoAllQueriesResult');

    container.innerHTML = `
        <div class="result-panel">
            <div class="result-panel-header">
                <h3>📋 All MongoDB Queries (${data.queries.length})</h3>
            </div>
            <div class="result-panel-body">
                <div class="table-container">
                    <table>
                        <thead><tr><th>#</th><th>Operation</th><th>MongoDB Query</th><th>API Endpoint</th></tr></thead>
                        <tbody>
                            ${data.queries.map(q => `
                                <tr>
                                    <td>${q.id}</td>
                                    <td><span class="badge badge-info">${q.operation}</span></td>
                                    <td><code style="font-family: 'JetBrains Mono', monospace; font-size: 0.72rem; color: var(--accent-secondary);">${q.query}</code></td>
                                    <td style="font-size: 0.75rem; color: var(--text-muted);">${q.endpoint}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>`;
}

// ──────────────────────────────────────────────
// ⚡ DBMS CONCEPTS
// ──────────────────────────────────────────────

async function runAcidDemo() {
    const data = await apiCall('/api/dbms/acid-demo');
    const container = document.getElementById('dbmsResult');

    if (!data.success) {
        container.innerHTML = `<div class="alert alert-error">❌ ${data.message}</div>`;
        return;
    }

    const p = data.properties;
    container.innerHTML = `
        <div class="result-panel">
            <div class="result-panel-header">
                <h3>🧪 ACID Properties — Live Verification</h3>
                <span class="badge badge-success">ALL VERIFIED</span>
            </div>
            <div class="result-panel-body">
                <div class="concept-grid">
                    <div class="concept-card" style="border-left: 3px solid var(--accent-primary);">
                        <h3>⚛️ Atomicity</h3>
                        <p>${p.atomicity.explanation}</p>
                        <div class="code-block" style="margin-top: 8px; font-size: 0.7rem;">${p.atomicity.sql_used?.join('\n') || p.atomicity.implementation}</div>
                    </div>
                    <div class="concept-card" style="border-left: 3px solid var(--success);">
                        <h3>✅ Consistency</h3>
                        <p>${p.consistency.explanation}</p>
                        <p style="margin-top: 8px; font-size: 0.72rem; color: var(--accent-secondary);">${p.consistency.constraints?.length || 0} constraints enforced</p>
                    </div>
                    <div class="concept-card" style="border-left: 3px solid var(--warning);">
                        <h3>🔒 Isolation</h3>
                        <p>${p.isolation.explanation}</p>
                        <p style="margin-top: 8px; font-size: 0.72rem; color: var(--accent-secondary);">Level: ${p.isolation.current_level}</p>
                    </div>
                    <div class="concept-card" style="border-left: 3px solid var(--info);">
                        <h3>💾 Durability</h3>
                        <p>${p.durability.explanation}</p>
                        <p style="margin-top: 8px; font-size: 0.72rem; color: var(--accent-secondary);">${p.durability.proof}</p>
                    </div>
                </div>
            </div>
        </div>`;
}

async function runConcurrentSim() {
    const trainId = document.getElementById('concTrainId').value || 1;
    const seatNum = document.getElementById('concSeatNum').value || 1;

    const container = document.getElementById('dbmsResult');
    container.innerHTML = '<div class="loading-overlay"><span class="spinner"></span> Simulating concurrent transactions...</div>';

    const data = await apiCall('/api/dbms/simulate-concurrent-booking', {
        method: 'POST',
        body: JSON.stringify({ train_id: parseInt(trainId), seat_number: parseInt(seatNum) })
    });

    if (!data.success) {
        container.innerHTML = `<div class="alert alert-error">❌ ${data.message}</div>`;
        return;
    }

    container.innerHTML = `
        <div class="result-panel">
            <div class="result-panel-header">
                <h3>${data.conflict_detected ? '⚠️ Conflict Detected!' : '✅ No Conflict'}</h3>
                <span class="badge ${data.conflict_detected ? 'badge-warning' : 'badge-success'}">${data.conflict_detected ? 'CONFLICT' : 'CLEAN'}</span>
            </div>
            <div class="result-panel-body">
                <h4 style="margin-bottom: 1rem;">Step-by-Step Execution</h4>
                <div class="timeline">
                    ${data.steps.map(s => `
                        <div class="timeline-item ${s.result?.includes('CONFLICT') || s.result?.includes('BLOCKED') ? 'warning' : s.result?.includes('ROLLED') ? 'error' : 'success'}">
                            <div>
                                <span class="timeline-step">[${s.time}]</span>
                                ${s.transaction ? `<span class="badge badge-info" style="margin-right: 4px;">${s.transaction}</span>` : ''}
                                ${s.action}
                            </div>
                            ${s.sql ? `<div class="timeline-sql">${s.sql}</div>` : ''}
                            ${s.result ? `<div style="color: var(--text-muted); font-size: 0.78rem; margin-top: 4px;">${s.result}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>`;
}

async function runSerializability() {
    const container = document.getElementById('dbmsResult');
    container.innerHTML = '<div class="loading-overlay"><span class="spinner"></span> Building precedence graph...</div>';

    const data = await apiCall('/api/dbms/check-serializability', {
        method: 'POST',
        body: JSON.stringify({})
    });

    if (!data.success) {
        container.innerHTML = `<div class="alert alert-error">❌ ${data.message}</div>`;
        return;
    }

    const graph = data.precedence_graph;
    container.innerHTML = `
        <div class="result-panel">
            <div class="result-panel-header">
                <h3>Conflict Serializability Analysis</h3>
                <span class="badge ${data.result.is_serializable ? 'badge-success' : 'badge-danger'}">
                    ${data.result.is_serializable ? 'SERIALIZABLE' : 'NOT SERIALIZABLE'}
                </span>
            </div>
            <div class="result-panel-body">
                <div class="grid-2" style="margin-bottom: 1.5rem;">
                    <div>
                        <h4 style="margin-bottom: 0.5rem;">Precedence Graph</h4>
                        <div class="mermaid" id="mermaidPrecedence">
                            ${data.mermaid_graph}
                        </div>
                    </div>
                    <div>
                        <h4 style="margin-bottom: 0.5rem;">Interleaved Schedule</h4>
                        <div class="table-container">
                            <table>
                                <thead><tr><th>T</th><th>Op</th><th>Res</th></tr></thead>
                                <tbody>
                                    ${data.schedule.map(s => `<tr><td>${s.transaction}</td><td>${s.type}</td><td>${s.resource}</td></tr>`).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div class="alert ${data.cycle_detection.hasCycle ? 'alert-error' : 'alert-success'}">
                    <strong>Verdict:</strong> ${data.result.verdict}
                </div>
            </div>
        </div>`;
    
    // Force mermaid to render
    setTimeout(() => {
        mermaid.init(undefined, "#mermaidPrecedence");
    }, 100);
}

async function runViewSerializability() {
    const container = document.getElementById('dbmsResult');
    container.innerHTML = '<div class="loading-overlay"><span class="spinner"></span> Analyzing view equivalence...</div>';

    const data = await apiCall('/api/dbms/check-view-serializability', {
        method: 'POST',
        body: JSON.stringify({})
    });

    if (!data.success) {
        container.innerHTML = `<div class="alert alert-error">❌ ${data.message}</div>`;
        return;
    }

    container.innerHTML = `
        <div class="result-panel">
            <div class="result-panel-header">
                <h3>View Serializability Analysis</h3>
                <span class="badge ${data.result.is_serializable ? 'badge-success' : 'badge-danger'}">
                    ${data.result.is_serializable ? 'SERIALIZABLE' : 'NOT SERIALIZABLE'}
                </span>
            </div>
            <div class="result-panel-body">
                <div class="card" style="margin-bottom: 1.5rem;">
                    <h4 style="margin-bottom: 8px;">Concepts Involved</h4>
                    <ul style="font-size: 0.85rem; color: var(--text-muted);">
                        <li><strong>Read-From:</strong> Reader T must read from the same Producer T'</li>
                        <li><strong>Initial Read:</strong> Initial read of any item must be from same T</li>
                        <li><strong>Final Write:</strong> Final write of any item must be from same T</li>
                    </ul>
                </div>
                
                <div class="alert ${data.result.is_serializable ? 'alert-success' : 'alert-error'}">
                    <strong>Verdict:</strong> ${data.result.verdict}
                </div>
                
                <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 10px;">
                    Note: Blind writes make a schedule view-serializable but not conflict-serializable.
                </p>
            </div>
        </div>`;
}

async function runDeadlock() {
    const container = document.getElementById('dbmsResult');
    container.innerHTML = '<div class="loading-overlay"><span class="spinner"></span> Simulating deadlock scenario...</div>';

    const data = await apiCall('/api/dbms/simulate-deadlock', {
        method: 'POST',
        body: JSON.stringify({})
    });

    if (!data.success) {
        container.innerHTML = `<div class="alert alert-error">❌ ${data.message}</div>`;
        return;
    }

    container.innerHTML = `
        <div class="result-panel">
            <div class="result-panel-header">
                <h3>🔒 Deadlock Detected & Resolved</h3>
                <span class="badge badge-danger">DEADLOCK</span>
            </div>
            <div class="result-panel-body">
                <div class="grid-2" style="margin-bottom: 1.5rem;">
                    <div>
                        <h4 style="margin-bottom: 0.5rem;">Wait-For Graph</h4>
                        <div class="mermaid" id="mermaidDeadlock">
                            ${data.mermaid_graph}
                        </div>
                    </div>
                    <div>
                        <h4 style="margin-bottom: 0.5rem;">Resolution Details</h4>
                        <div class="card">
                            <p style="font-size: 0.85rem; margin-bottom: 8px;"><strong>Method:</strong> ${data.resolution.method}</p>
                            <p style="font-size: 0.85rem; margin-bottom: 8px;"><strong>Victim:</strong> ${data.resolution.victim}</p>
                            <p style="font-size: 0.78rem; color: var(--text-muted);">${data.resolution.explanation}</p>
                        </div>
                    </div>
                </div>

                <h4 style="margin-bottom: 1rem;">Simulation Steps</h4>
                <div class="timeline">
                    ${data.steps.map(s => `
                        <div class="timeline-item ${s.action.includes('DEADLOCK') ? 'error' : s.action.includes('ROLLBACK') || s.action.includes('RESOLVE') ? 'warning' : 'success'}">
                            <div>
                                <span class="timeline-step">[${s.time}]</span>
                                ${s.transaction ? `<span class="badge badge-info" style="margin-right: 4px;">${s.transaction}</span>` : ''}
                                ${s.action}
                            </div>
                            ${s.sql ? `<div class="timeline-sql">${s.sql}</div>` : ''}
                            ${s.result ? `<div style="color: var(--text-muted); font-size: 0.78rem; margin-top: 4px;">${s.result}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>`;
    
    setTimeout(() => {
        mermaid.init(undefined, "#mermaidDeadlock");
    }, 100);
}

// ──────────────────────────────────────────────
// INITIALIZATION
// ──────────────────────────────────────────────

window.onload = () => {
    checkAuth();
    
    // Check API status
    apiCall('/api').then(data => {
        if (data.status === 'Running') {
            console.log('✅ API connected');
        }
    }).catch(() => {
        console.warn('⚠️ API not reachable');
    });
};
