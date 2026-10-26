/* ==========================================================================
   ONLINE BOOKING INTERACTIVITY SCRIPT
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.reservation-card');
    const resetDemoBtn = document.getElementById('resetDemoBtn');
    const pendingCounter = document.getElementById('pendingCounter');

    // Dynamically update the pending reservations counter badge
    function updatePendingCount() {
        const pendingCards = document.querySelectorAll('.reservation-card[data-status="pending"]');
        if (pendingCounter) {
            pendingCounter.innerText = `${pendingCards.length} Pending`;
        }
    }

    // Confirm Booking Action
    document.querySelectorAll('.btn-confirm').forEach(btn => {
        btn.addEventListener('click', function() {
            const card = this.closest('.reservation-card');
            const guestName = card.querySelector('.guest-name').innerText;
            const roomNum = card.querySelector('.room-select').value;
            const statusTag = card.querySelector('.status-tag');
            
            alert(`Confirmed booking for ${guestName} in Room ${roomNum}!`);
            
            card.style.opacity = '0.7';
            card.dataset.status = 'confirmed';
            
            if (statusTag) {
                statusTag.className = 'status-tag green';
                statusTag.innerText = 'Confirmed';
                statusTag.style.backgroundColor = '#dcfce7';
                statusTag.style.color = '#15803d';
            }

            this.innerText = 'Confirmed';
            this.disabled = true;
            this.style.backgroundColor = '#94a3b8';
            this.style.cursor = 'default';

            updatePendingCount();
        });
    });

    // Reject Request Action
    document.querySelectorAll('.btn-reject').forEach(btn => {
        btn.addEventListener('click', function() {
            const card = this.closest('.reservation-card');
            const guestName = card.querySelector('.guest-name').innerText;
            if (confirm(`Are you sure you want to reject ${guestName}'s request?`)) {
                card.remove();
                updatePendingCount();
            }
        });
    });

    // Live Search Input Filter
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            document.querySelectorAll('.reservation-card').forEach(card => {
                const info = card.dataset.guest.toLowerCase();
                card.style.display = info.includes(term) ? 'block' : 'none';
            });
        });
    }

    // Status Tab Filters (All, Pending, Confirmed)
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const filter = this.dataset.filter;

            document.querySelectorAll('.reservation-card').forEach(card => {
                if (filter === 'all') {
                    card.style.display = 'block';
                } else {
                    card.style.display = card.dataset.status === filter ? 'block' : 'none';
                }
            });
        });
    });

    // Reset Demo Queue Button
    if (resetDemoBtn) {
        resetDemoBtn.addEventListener('click', () => {
            location.reload();
        });
    }
});