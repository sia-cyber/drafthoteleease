/* ==========================================================================
   WALK-IN BOOKING INTERACTIVITY SCRIPT (WITH DYNAMIC QR MODAL)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    const walkinForm = document.getElementById('page-walkin-form');
    const clearFormBtn = document.getElementById('clearFormBtn');
    const stayTypeSelect = document.getElementById('walkin-stay-type');
    const hoursLabel = document.getElementById('hours-label');
    const hoursSelect = document.getElementById('walkin-hours');
    const checkinInput = document.getElementById('walkin-checkin');
    const checkoutInput = document.getElementById('walkin-checkout');
    const roomSelect = document.getElementById('walkin-room');
    const guestsInput = document.getElementById('walkin-guests');
    const roomsInput = document.getElementById('walkin-rooms');
    const capacityHint = document.getElementById('capacity-hint');

    // Stepper & Panel Elements
    const stepNodes = [
        document.getElementById('step-node-1'),
        document.getElementById('step-node-2'),
        document.getElementById('step-node-3')
    ];
    const stepPanels = [
        document.getElementById('step-panel-1'),
        document.getElementById('step-panel-2'),
        document.getElementById('step-panel-3')
    ];
    const trackerLine = document.getElementById('stepperTrackProgress');

    const backToStep1Btn = document.getElementById('backToStep1Btn');
    const confirmPaymentBtn = document.getElementById('confirmPaymentBtn');
    const newBookingBtn = document.getElementById('newBookingBtn');
    const paymentMethodSelect = document.getElementById('payment-method');

    // Room Rates & Per-Room Capacity Table
    const roomRates = {
        'Economy Room': { price: 1500, cap: 2 },
        'Standard Room': { price: 2200, cap: 2 },
        'Superior Room': { price: 2800, cap: 2 },
        'Twin Room': { price: 3000, cap: 2 },
        'Family Room': { price: 3500, cap: 6 },
        'Junior Suite': { price: 3800, cap: 3 },
        'Deluxe Room': { price: 4200, cap: 3 },
        'Executive Room': { price: 5800, cap: 3 },
        'Honeymoon Suite': { price: 7000, cap: 2 },
        'Presidential Suite': { price: 9500, cap: 6 },
        'Penthouse Suite': { price: 12000, cap: 6 }
    };

    // Inject Dynamic QR Modal Markup into body dynamically
    const qrModalHTML = `
        <div class="qr-modal-overlay" id="qrModalOverlay">
            <div class="qr-modal-card">
                <button class="qr-modal-close" id="closeQrModal">&times;</button>
                <div class="qr-provider-logo" id="qrProviderTitle">Maya Checkout</div>
                <div class="qr-modal-subtitle">Scan QRPH code using your mobile app to pay</div>
                <div class="qr-code-box">
                    <div class="qr-placeholder-img">
                        <!-- Simulated QR Code SVG Graphic -->
                        <svg viewBox="0 0 100 100" fill="currentColor">
                            <rect x="10" y="10" width="30" height="30" fill="none" stroke="currentColor" stroke-width="6"/>
                            <rect x="18" y="18" width="14" height="14" fill="currentColor"/>
                            <rect x="60" y="10" width="30" height="30" fill="none" stroke="currentColor" stroke-width="6"/>
                            <rect x="68" y="18" width="14" height="14" fill="currentColor"/>
                            <rect x="10" y="60" width="30" height="30" fill="none" stroke="currentColor" stroke-width="6"/>
                            <rect x="18" y="68" width="14" height="14" fill="currentColor"/>
                            <rect x="45" y="45" width="10" height="10" fill="currentColor"/>
                            <rect x="60" y="60" width="12" height="12" fill="currentColor"/>
                            <rect x="78" y="60" width="12" height="20" fill="currentColor"/>
                            <rect x="60" y="78" width="15" height="12" fill="currentColor"/>
                        </svg>
                    </div>
                    <div class="qr-amount-display" id="qrModalAmount">₱0.00</div>
                    <div class="qr-merchant-tag">HotelEase Front Desk PMS</div>
                </div>
                <button type="button" class="btn-primary-teal" id="simulateScanCompleteBtn" style="width: 100%;">Simulate Successful Payment</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', qrModalHTML);

    const qrModalOverlay = document.getElementById('qrModalOverlay');
    const closeQrModal = document.getElementById('closeQrModal');
    const qrProviderTitle = document.getElementById('qrProviderTitle');
    const qrModalAmount = document.getElementById('qrModalAmount');
    const simulateScanCompleteBtn = document.getElementById('simulateScanCompleteBtn');

    function goToStep(stepIndex) {
        stepPanels.forEach((panel, i) => {
            if (panel) panel.classList.toggle('active', i === stepIndex);
        });

        stepNodes.forEach((node, i) => {
            if (node) {
                node.classList.remove('active', 'completed', 'finished');
                if (stepIndex === 2) {
                    node.classList.add('finished');
                } else {
                    node.classList.toggle('active', i === stepIndex);
                    node.classList.toggle('completed', i < stepIndex);
                }
            }
        });

        if (trackerLine) {
            if (stepIndex === 0) trackerLine.style.width = '0%';
            else if (stepIndex === 1) trackerLine.style.width = '33.34%';
            else if (stepIndex === 2) trackerLine.style.width = '66.68%';
        }
    }

    function syncHourlyCheckoutDate() {
        if (stayTypeSelect.value === 'hourly' && checkinInput.value) {
            checkoutInput.value = checkinInput.value;
        }
    }

    function updateCapacityRules() {
        const selectedRoom = roomSelect.value;
        const maxPerRoom = roomRates[selectedRoom]?.cap || 2;
        let roomCount = parseInt(roomsInput.value) || 1;

        if (roomCount > 5) {
            roomCount = 5;
            roomsInput.value = '5';
        } else if (roomCount < 1 && roomsInput.value !== '') {
            roomCount = 1;
            roomsInput.value = '1';
        }

        const totalMaxGuests = maxPerRoom * roomCount;
        guestsInput.dataset.max = totalMaxGuests;

        if (parseInt(guestsInput.value) > totalMaxGuests) {
            guestsInput.value = totalMaxGuests.toString();
        }

        if (capacityHint) {
            capacityHint.innerText = `(Max: ${maxPerRoom} guests/room)`;
        }
    }

    function updateHoursOptions() {
        hoursSelect.innerHTML = '';
        if (stayTypeSelect.value === 'hourly') {
            hoursLabel.innerText = 'Hours of Stay';
            [{ val: '3', text: '3 Hours' }, { val: '6', text: '6 Hours' }, { val: '8', text: '8 Hours' }, { val: '12', text: '12 Hours' }].forEach(opt => {
                const el = document.createElement('option');
                el.value = opt.val;
                el.text = opt.text;
                hoursSelect.appendChild(el);
            });
            syncHourlyCheckoutDate();
            checkoutInput.readOnly = true;
            checkoutInput.style.backgroundColor = '#e2e8f0';
        } else {
            hoursLabel.innerText = 'Additional Extension Hours';
            [{ val: '0', text: '0' }, { val: '3', text: '+ 3 Hours Extension' }, { val: '6', text: '+ 6 Hours Extension' }, { val: '8', text: '+ 8 Hours Extension' }, { val: '12', text: '+ 12 Hours Extension' }, { val: '16', text: '+ 16 Hours Extension' }].forEach(opt => {
                const el = document.createElement('option');
                el.value = opt.val;
                el.text = opt.text;
                hoursSelect.appendChild(el);
            });
            hoursSelect.value = '0';
            checkoutInput.readOnly = false;
            checkoutInput.style.backgroundColor = '#ffffff';
        }
    }

    if (guestsInput) {
        guestsInput.addEventListener('input', () => {
            guestsInput.value = guestsInput.value.replace(/\D/g, '');
            const max = parseInt(guestsInput.dataset.max) || 2;
            const val = parseInt(guestsInput.value);
            if (val > max) guestsInput.value = max.toString();
            else if (val < 1 && guestsInput.value !== '') guestsInput.value = '1';
        });
    }

    if (roomsInput) {
        roomsInput.addEventListener('input', () => {
            roomsInput.value = roomsInput.value.replace(/\D/g, '');
            const val = parseInt(roomsInput.value);
            if (val > 5) roomsInput.value = '5';
            else if (val < 1 && roomsInput.value !== '') roomsInput.value = '1';
            updateCapacityRules();
        });
    }

    updateHoursOptions();
    updateCapacityRules();

    if (stayTypeSelect) stayTypeSelect.addEventListener('change', updateHoursOptions);
    if (checkinInput) checkinInput.addEventListener('change', syncHourlyCheckoutDate);
    if (roomSelect) roomSelect.addEventListener('change', updateCapacityRules);

    if (clearFormBtn && walkinForm) {
        clearFormBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all form fields?')) {
                walkinForm.reset();
                guestsInput.value = '1';
                roomsInput.value = '1';
                updateHoursOptions();
                updateCapacityRules();
            }
        });
    }

    if (walkinForm) {
        walkinForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const guestName = document.getElementById('walkin-name').value;
            const roomType = roomSelect.value;
            const rooms = parseInt(roomsInput.value) || 1;
            const isHourly = stayTypeSelect.value === 'hourly';
            const nightlyPrice = roomRates[roomType]?.price || 1500;
            const hoursValue = hoursSelect.value;

            let calculatedTotal = 0;
            let durationText = '';

            if (isHourly) {
                const hours = parseInt(hoursValue) || 3;
                calculatedTotal = (nightlyPrice * 0.4) * rooms;
                durationText = `${hours} Hours (Hourly Stay)`;
            } else {
                const checkInDate = new Date(checkinInput.value);
                const checkOutDate = new Date(checkoutInput.value);
                const diffTime = Math.abs(checkOutDate - checkInDate);
                const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
                
                calculatedTotal = (nightlyPrice * nights) * rooms;
                if (hoursValue !== '0') {
                    durationText = `${nights} Night(s) + ${hoursValue} Extension Hours`;
                } else {
                    durationText = `${nights} Night(s) (Standard Overnight)`;
                }
            }

            document.getElementById('pay-summary-name').innerText = guestName;
            document.getElementById('pay-summary-room').innerText = `${rooms}x ${roomType}`;
            document.getElementById('pay-summary-duration').innerText = durationText;
            document.getElementById('pay-summary-total').innerText = `₱${calculatedTotal.toLocaleString()}`;

            walkinForm.dataset.summaryName = guestName;
            walkinForm.dataset.summaryDetail = `${rooms}x ${roomType} (${durationText})`;
            walkinForm.dataset.calculatedTotal = `₱${calculatedTotal.toLocaleString()}`;

            goToStep(1);
        });
    }

    if (backToStep1Btn) {
        backToStep1Btn.addEventListener('click', () => goToStep(0));
    }

    if (confirmPaymentBtn) {
        confirmPaymentBtn.addEventListener('click', () => {
            const selectedMethod = paymentMethodSelect.value;

            // If E-Wallet or Digital Bank is chosen, pop up the QR modal dynamically
            if (['Maya', 'GCash', 'MariBank', 'GoTyme', 'CIMB'].includes(selectedMethod)) {
                qrProviderTitle.innerText = `${selectedMethod} Checkout`;
                qrProviderTitle.className = `qr-provider-logo ${selectedMethod.toLowerCase()}`;
                qrModalAmount.innerText = document.getElementById('pay-summary-total').innerText;
                qrModalOverlay.classList.add('active');
            } else {
                // Process Cash or Card directly
                finalizeBooking();
            }
        });
    }

    // Close QR Modal
    if (closeQrModal) {
        closeQrModal.addEventListener('click', () => {
            qrModalOverlay.classList.remove('active');
        });
    }

    // Simulate successful scan from mobile app QR modal
    if (simulateScanCompleteBtn) {
        simulateScanCompleteBtn.addEventListener('click', () => {
            qrModalOverlay.classList.remove('active');
            finalizeBooking();
        });
    }

    function finalizeBooking() {
        const randomReqId = `REQ-${Math.floor(10000 + Math.random() * 90000)}`;
        document.getElementById('conf-req-id').innerText = randomReqId;
        document.getElementById('conf-guest-name').innerText = walkinForm.dataset.summaryName || '-';
        document.getElementById('conf-stay-detail').innerText = walkinForm.dataset.summaryDetail || '-';

        goToStep(2);
    }

    if (newBookingBtn) {
        newBookingBtn.addEventListener('click', () => {
            walkinForm.reset();
            guestsInput.value = '1';
            roomsInput.value = '1';
            updateHoursOptions();
            updateCapacityRules();
            goToStep(0);
        });
    }
});