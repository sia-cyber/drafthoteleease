document.addEventListener('DOMContentLoaded', () => {
    // Sidebar Drawer Toggle Elements
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const sidebarDrawer = document.getElementById('sidebarDrawer');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const closeSidebar = document.getElementById('closeSidebar');
    const logoutBtn = document.getElementById('logoutBtn');

    function toggleSidebar() {
        if (sidebarDrawer) sidebarDrawer.classList.toggle('open');
        if (sidebarOverlay) sidebarOverlay.classList.toggle('active');
    }

    if (hamburgerBtn) hamburgerBtn.addEventListener('click', toggleSidebar);
    if (closeSidebar) closeSidebar.addEventListener('click', toggleSidebar);
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', toggleSidebar);

    // --- ONLINE BOOKING MODAL LOGIC ---
    const bookingModalOverlay = document.getElementById('bookingModalOverlay');
    const openOnlineBookingNav = document.getElementById('openOnlineBookingNav');
    const openOnlineBookingCard = document.getElementById('openOnlineBookingCard');
    const closeBookingModal = document.getElementById('closeBookingModal');
    const closeWorkstationBtn = document.getElementById('closeWorkstationBtn');

    function openBookingModal() {
        if (bookingModalOverlay) {
            bookingModalOverlay.classList.add('open');
        }
        if (sidebarDrawer) sidebarDrawer.classList.remove('open');
        if (sidebarOverlay) sidebarOverlay.classList.remove('active');
    }

    function closeBookingModalFn() {
        if (bookingModalOverlay) {
            bookingModalOverlay.classList.remove('open');
        }
    }

    if (openOnlineBookingNav) {
        openOnlineBookingNav.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openBookingModal();
        });
    }

    if (openOnlineBookingCard) {
        openOnlineBookingCard.addEventListener('click', openBookingModal);
    }

    if (closeBookingModal) closeBookingModal.addEventListener('click', closeBookingModalFn);
    if (closeWorkstationBtn) closeWorkstationBtn.addEventListener('click', closeBookingModalFn);

    if (bookingModalOverlay) {
        bookingModalOverlay.addEventListener('click', (e) => {
            if (e.target === bookingModalOverlay) {
                closeBookingModalFn();
            }
        });
    }

    // --- WALK-IN BOOKING MODAL LOGIC ---
    const walkinNavBtn = document.getElementById('walkinNavBtn');
    const walkinModalOverlay = document.getElementById('walkinModalOverlay');
    const closeWalkinModal = document.getElementById('closeWalkinModal');
    const dashboardWalkinForm = document.getElementById('dashboard-walkin-form');
    const cancelWalkinBtn = document.getElementById('cancelWalkinBtn');

    if (walkinNavBtn && walkinModalOverlay) {
        walkinNavBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (sidebarDrawer) sidebarDrawer.classList.remove('open');
            if (sidebarOverlay) sidebarOverlay.classList.remove('active');
            walkinModalOverlay.classList.add('active');
        });
    }

    if (closeWalkinModal && walkinModalOverlay) {
        closeWalkinModal.addEventListener('click', () => {
            walkinModalOverlay.classList.remove('active');
        });
    }

    if (walkinModalOverlay) {
        walkinModalOverlay.addEventListener('click', (e) => {
            if (e.target === walkinModalOverlay) {
                walkinModalOverlay.classList.remove('active');
            }
        });
    }

    if (cancelWalkinBtn && dashboardWalkinForm) {
        cancelWalkinBtn.addEventListener('click', () => {
            dashboardWalkinForm.reset();
        });
    }

    if (dashboardWalkinForm && walkinModalOverlay) {
        dashboardWalkinForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const guestName = document.getElementById('modal-walkin-name').value;
            const contact = document.getElementById('modal-walkin-contact').value;
            const email = document.getElementById('modal-walkin-email').value;
            const checkIn = document.getElementById('modal-walkin-checkin').value;
            const checkOut = document.getElementById('modal-walkin-checkout').value;
            const hoursStay = document.getElementById('modal-walkin-hours').value || 'N/A (Per Night)';
            const guests = document.getElementById('modal-walkin-guests').value;
            const rooms = document.getElementById('modal-walkin-rooms').value;
            const roomType = document.getElementById('modal-walkin-room').value;

            alert(`Walk-In Confirmed!\n\n` +
                  `-- Guest Information --\n` +
                  `Name: ${guestName}\n` +
                  `Contact: ${contact}\n` +
                  `Email: ${email}\n\n` +
                  `-- Reservation Details --\n` +
                  `Room Type: ${roomType}\n` +
                  `Number of Rooms: ${rooms}\n` +
                  `Number of Guests: ${guests}\n` +
                  `Check-in Date: ${checkIn}\n` +
                  `Check-out Date: ${checkOut}\n` +
                  `Hours Stay: ${hoursStay}`);
            
            dashboardWalkinForm.reset();
            walkinModalOverlay.classList.remove('active');
        });
    }

    // Reservation action simulations
    document.querySelectorAll('.btn-confirm').forEach(btn => {
        btn.addEventListener('click', function() {
            const card = this.closest('.reservation-card');
            const guestName = card.querySelector('.guest-name').innerText;
            const roomNum = card.querySelector('.room-select').value;
            alert(`Confirmed booking for ${guestName} in Room ${roomNum}!`);
            card.style.opacity = '0.4';
            this.innerText = 'Confirmed';
            this.disabled = true;
        });
    });

    document.querySelectorAll('.btn-reject').forEach(btn => {
        btn.addEventListener('click', function() {
            const card = this.closest('.reservation-card');
            const guestName = card.querySelector('.guest-name').innerText;
            if (confirm(`Are you sure you want to reject ${guestName}'s request?`)) {
                card.style.display = 'none';
            }
        });
    });

    // Logout confirmation & redirect action
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Are you sure you want to log out from HotelEase Admin Portal?')) {
                window.location.href = 'login.html';
            }
        });
    }
});