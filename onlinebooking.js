document.addEventListener('DOMContentLoaded', () => {
    // Sidebar Drawer Toggle Logic
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const sidebarDrawer = document.getElementById('sidebarDrawer');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const closeSidebar = document.getElementById('closeSidebar');
    const logoutBtn = document.getElementById('logoutBtn');

    function toggleSidebar() {
        sidebarDrawer.classList.toggle('open');
        sidebarOverlay.classList.toggle('active');
    }

    if (hamburgerBtn) hamburgerBtn.addEventListener('click', toggleSidebar);
    if (closeSidebar) closeSidebar.addEventListener('click', toggleSidebar);
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', toggleSidebar);

    // FLOATING ONLINE BOOKING OVERLAY MODAL LOGIC
    const bookingModalOverlay = document.getElementById('bookingModalOverlay');
    const openOnlineBookingNav = document.getElementById('openOnlineBookingNav');
    const openOnlineBookingCard = document.getElementById('openOnlineBookingCard');
    const closeBookingModal = document.getElementById('closeBookingModal');
    const closeWorkstationBtn = document.getElementById('closeWorkstationBtn');

    function openBookingModal() {
        if (bookingModalOverlay) {
            bookingModalOverlay.classList.add('open');
        }
        // Close sidebar if open
        if (sidebarDrawer) sidebarDrawer.classList.remove('open');
        if (sidebarOverlay) sidebarOverlay.classList.remove('active');
    }

    function closeBookingModalFn() {
        if (bookingModalOverlay) {
            bookingModalOverlay.classList.remove('open');
        }
    }

    if (openOnlineBookingNav) openOnlineBookingNav.addEventListener('click', (e) => { e.preventDefault(); openBookingModal(); });
    if (openOnlineBookingCard) openOnlineBookingCard.addEventListener('click', openBookingModal);

    if (closeBookingModal) closeBookingModal.addEventListener('click', closeBookingModalFn);
    if (closeWorkstationBtn) closeWorkstationBtn.addEventListener('click', closeBookingModalFn);

    // Close on clicking backdrop
    if (bookingModalOverlay) {
        bookingModalOverlay.addEventListener('click', (e) => {
            if (e.target === bookingModalOverlay) {
                closeBookingModalFn();
            }
        });
    }

    // Action button simulations inside modal
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

    // Logout confirmation action
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Are you sure you want to log out from HotelEase Admin Portal?')) {
                alert('Successfully logged out.');
            }
        });
    }
});