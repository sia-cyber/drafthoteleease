/* ==========================================================================
   WALK-IN BOOKING INTERACTIVITY SCRIPT (GREY OUT QUOTA-MET ROOMS)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    const walkinForm = document.getElementById('page-walkin-form');
    const clearFormBtn = document.getElementById('clearFormBtn');

    // Multi-Room Builder Elements
    const roomRowsContainer = document.getElementById('room-selection-rows-container');
    const addRoomRowBtn = document.getElementById('add-room-row-btn');
    const totalRoomsBadge = document.getElementById('total-rooms-badge');

    // Stepper & Panel Elements (4 STEPS)
    const stepNodes = [
        document.getElementById('step-node-1'),
        document.getElementById('step-node-2'),
        document.getElementById('step-node-3'),
        document.getElementById('step-node-4')
    ];
    const stepPanels = [
        document.getElementById('step-panel-1'),
        document.getElementById('step-panel-2'),
        document.getElementById('step-panel-3'),
        document.getElementById('step-panel-4')
    ];
    const trackerLine = document.getElementById('stepperTrackProgress');

    // Step Navigation Buttons
    const backToStep1Btn = document.getElementById('backToStep1Btn');
    const proceedToPaymentBtn = document.getElementById('proceedToPaymentBtn');
    const backToStep2Btn = document.getElementById('backToStep2Btn');
    const confirmPaymentBtn = document.getElementById('confirmPaymentBtn');
    const newBookingBtn = document.getElementById('newBookingBtn');
    const paymentMethodSelect = document.getElementById('payment-method');

    // Room Picker Elements
    const pickerRequestedBreakdown = document.getElementById('picker-requested-breakdown');
    const selectedRoomsCountEl = document.getElementById('selected-rooms-count');
    const targetRoomsCountEl = document.getElementById('target-rooms-count');
    const buildingFloorsContainer = document.getElementById('buildingFloorsContainer');

    let selectedRoomsList = [];
    let rowIdCounter = 1;

    // Daily Pricelist & Maximum Capacity Map
    const roomRates = {
        'Economy Room': { price: 5500, cap: 2, floors: [1, 2] },
        'Standard Room': { price: 8200, cap: 2, floors: [3, 4] },
        'Family Room': { price: 12500, cap: 6, floors: [5, 6] },
        'Executive Room': { price: 16800, cap: 3, floors: [7, 8] },
        'Presidential Suite': { price: 20500, cap: 6, floors: [9, 10] },
        'Penthouse Suite': { price: 24000, cap: 6, floors: [11, 12] }
    };

    // Inject Dynamic QR Modal Markup
    const qrModalHTML = `
        <div class="qr-modal-overlay" id="qrModalOverlay">
            <div class="qr-modal-card">
                <button class="qr-modal-close" id="closeQrModal">&times;</button>
                <div class="qr-provider-logo" id="qrProviderTitle">Maya Checkout</div>
                <div class="qr-modal-subtitle">Scan QRPH code using your mobile app to pay</div>
                <div class="qr-code-box">
                    <div class="qr-placeholder-img">
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

    // Mock Occupied Rooms Set
    const occupiedRooms = new Set(['103', '107', '202', '304', '308', '405', '501', '606', '702', '808', '903', '1005', '1102', '1204']);

    // ==========================================================================
    // MULTI-ROOM TYPE BUILDER & ITEMIZED RECEIPT TABLE CALCULATOR
    // ==========================================================================

    function updateCategoryOptionsText(rowCard) {
        const catSelect = rowCard.querySelector('.row-category-select');
        const stayType = rowCard.querySelector('.row-stay-type-select').value;
        const checkoutElem = rowCard.querySelector('.row-checkout-input');

        let rateMultiplier = 1;
        let unitLabel = '/night';

        if (stayType === 'hourly') {
            const hours = checkoutElem && checkoutElem.tagName === 'SELECT' ? (parseInt(checkoutElem.value) || 3) : 3;
            if (hours === 3) rateMultiplier = 0.30;
            else if (hours === 6) rateMultiplier = 0.50;
            else if (hours === 8) rateMultiplier = 0.65;
            else if (hours === 12) rateMultiplier = 0.80;

            unitLabel = `/${hours} hrs`;
        }

        Array.from(catSelect.options).forEach(option => {
            const catName = option.value;
            const info = roomRates[catName];
            if (info) {
                let displayPrice = info.price;
                if (stayType === 'hourly') {
                    displayPrice = Math.round(info.price * rateMultiplier);
                }
                option.text = `${catName} (₱${displayPrice.toLocaleString()}${unitLabel})`;
            }
        });
    }

    function updateExtensionOptionsText(rowCard) {
        const catSelect = rowCard.querySelector('.row-category-select');
        const extSelect = rowCard.querySelector('.row-extension-select');
        const stayType = rowCard.querySelector('.row-stay-type-select').value;
        
        if (!extSelect) return;

        if (stayType === 'hourly') {
            extSelect.innerHTML = `<option value="0">N/A (Hourly Stay)</option>`;
            extSelect.disabled = true;
            return;
        }

        extSelect.disabled = false;
        const category = catSelect.value;
        const nightlyPrice = roomRates[category]?.price || 5500;
        const previousVal = extSelect.value || '0';

        const extRates = [
            { hours: 0, mult: 0, label: 'None (No Extension)' },
            { hours: 3, mult: 0.30, label: '+3 Hours' },
            { hours: 6, mult: 0.50, label: '+6 Hours' },
            { hours: 8, mult: 0.65, label: '+8 Hours' },
            { hours: 12, mult: 0.80, label: '+12 Hours' }
        ];

        extSelect.innerHTML = '';
        extRates.forEach(item => {
            const cost = Math.round(nightlyPrice * item.mult);
            const opt = document.createElement('option');
            opt.value = item.hours.toString();
            opt.text = item.hours === 0 ? item.label : `${item.label} (+₱${cost.toLocaleString()})`;
            extSelect.appendChild(opt);
        });

        extSelect.value = previousVal;
    }

    function updateGuestsDropdown(rowCard) {
        const catSelect = rowCard.querySelector('.row-category-select');
        const guestsSelect = rowCard.querySelector('.row-guests-select');
        const category = catSelect.value;
        const maxCap = roomRates[category]?.cap || 2;
        
        const previousVal = parseInt(guestsSelect.value) || 1;
        guestsSelect.innerHTML = '';

        for (let i = 1; i <= maxCap; i++) {
            const isMax = i === maxCap;
            const opt = document.createElement('option');
            opt.value = i.toString();
            opt.text = isMax ? `${i} ${i === 1 ? 'Guest' : 'Guests'} (Max Capacity)` : `${i} ${i === 1 ? 'Guest' : 'Guests'}`;
            guestsSelect.appendChild(opt);
        }

        guestsSelect.value = Math.min(previousVal, maxCap).toString();
    }

    function updateItemizedReceiptTable() {
        const roomRows = getRequestedRoomRequirements();
        const tableBody = document.getElementById('receipt-table-body');
        const subtotalEl = document.getElementById('receipt-subtotal');
        const taxEl = document.getElementById('receipt-tax');
        const grandTotalEl = document.getElementById('receipt-grand-total');

        if (!tableBody) return;

        tableBody.innerHTML = '';
        let subtotal = 0;

        roomRows.forEach((r, idx) => {
            const nightlyPrice = roomRates[r.category]?.price || 5500;

            if (r.stayType === 'hourly') {
                const hours = parseInt(r.checkoutVal) || 3;
                let rateMultiplier = 0.30;
                if (hours === 6) rateMultiplier = 0.50;
                else if (hours === 8) rateMultiplier = 0.65;
                else if (hours === 12) rateMultiplier = 0.80;

                const rowCost = Math.round(nightlyPrice * rateMultiplier);
                subtotal += rowCost;

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>1</td>
                    <td>
                        <div style="font-weight: 600; color: #0d2b38;">${r.category}</div>
                        <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Hourly Stay (${hours} Hours, ${r.guestsCount} Guest(s)) [In: ${r.checkinVal}]</div>
                    </td>
                    <td>₱${rowCost.toLocaleString()}</td>
                    <td>₱${rowCost.toLocaleString()}</td>
                `;
                tableBody.appendChild(tr);
            } else {
                const checkInDateObj = new Date(r.checkinVal);
                const checkOutDateObj = new Date(r.checkoutVal);
                const diffTime = Math.abs(checkOutDateObj - checkInDateObj);
                const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
                const baseDailyCost = nightlyPrice * nights;

                subtotal += baseDailyCost;

                // 1. Base Daily Stay Row
                const trDaily = document.createElement('tr');
                trDaily.innerHTML = `
                    <td>1</td>
                    <td>
                        <div style="font-weight: 600; color: #0d2b38;">${r.category}</div>
                        <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Daily Stay (${nights} Night(s), ${r.guestsCount} Guest(s)) [In: ${r.checkinVal} to ${r.checkoutVal}]</div>
                    </td>
                    <td>₱${baseDailyCost.toLocaleString()}</td>
                    <td>₱${baseDailyCost.toLocaleString()}</td>
                `;
                tableBody.appendChild(trDaily);

                // 2. Separate Formatted Extension Hours Row (Indented below)
                const extHours = r.extHoursVal || 0;
                if (extHours > 0) {
                    let extMultiplier = 0.30;
                    if (extHours === 6) extMultiplier = 0.50;
                    else if (extHours === 8) extMultiplier = 0.65;
                    else if (extHours === 12) extMultiplier = 0.80;

                    const extCost = Math.round(nightlyPrice * extMultiplier);
                    subtotal += extCost;

                    const trExt = document.createElement('tr');
                    trExt.innerHTML = `
                        <td>1</td>
                        <td>
                            <div style="font-weight: 600; color: #0f766e; padding-left: 14px;">+ Extension Hours (${extHours} Hours)</div>
                            <div style="font-size: 11px; color: #64748b; margin-top: 2px; padding-left: 14px;">Additional extension for ${r.category}</div>
                        </td>
                        <td>₱${extCost.toLocaleString()}</td>
                        <td>₱${extCost.toLocaleString()}</td>
                    `;
                    tableBody.appendChild(trExt);
                }
            }
        });

        const taxAmount = Math.round(subtotal * 0.12);
        const grandTotal = subtotal + taxAmount;

        if (subtotalEl) subtotalEl.innerText = `₱${subtotal.toLocaleString()}`;
        if (taxEl) taxEl.innerText = `₱${taxAmount.toLocaleString()}`;
        if (grandTotalEl) grandTotalEl.innerText = `₱${grandTotal.toLocaleString()}`;
    }

    function createRoomTypeRow(defaultCategory = 'Economy Room') {
        const rowId = `row-${rowIdCounter++}`;
        const rowCard = document.createElement('div');
        rowCard.className = 'room-type-builder-card';
        rowCard.dataset.rowId = rowId;

        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        let optionsHTML = '';
        for (const [catName, info] of Object.entries(roomRates)) {
            optionsHTML += `<option value="${catName}" ${catName === defaultCategory ? 'selected' : ''}>${catName} (₱${info.price.toLocaleString()}/night)</option>`;
        }

        rowCard.innerHTML = `
            <div class="room-type-builder-header">
                <span class="room-row-badge-title">Room Selection & Schedule #${rowCard.dataset.rowId.replace('row-', '')}</span>
                <button type="button" class="btn-remove-room-row" title="Remove Room Type">&times;</button>
            </div>
            <div class="room-type-builder-grid">
                <div class="modal-input-group">
                    <label>Room Category</label>
                    <select class="row-category-select">${optionsHTML}</select>
                </div>
                <div class="modal-input-group">
                    <label>Guests</label>
                    <select class="row-guests-select">
                        <!-- Options populated dynamically -->
                    </select>
                </div>
                <div class="modal-input-group">
                    <label>Stay Type</label>
                    <select class="row-stay-type-select">
                        <option value="daily">Daily Stay</option>
                        <option value="hourly">Hourly Stay</option>
                    </select>
                </div>
                <div class="modal-input-group row-checkin-container">
                    <label>Check-in Date</label>
                    <input type="date" class="row-checkin-input" value="${todayStr}" min="${todayStr}">
                </div>
                <div class="modal-input-group row-checkout-container">
                    <label class="row-checkout-label">Check-out Date</label>
                    <input type="date" class="row-checkout-input" value="${tomorrowStr}" min="${todayStr}">
                </div>
                <div class="modal-input-group row-extension-container">
                    <label>Extension Hours</label>
                    <select class="row-extension-select">
                        <!-- Extension options populated dynamically -->
                    </select>
                </div>
            </div>
        `;

        const catSelect = rowCard.querySelector('.row-category-select');
        const guestsSelect = rowCard.querySelector('.row-guests-select');
        const stayTypeSelectRow = rowCard.querySelector('.row-stay-type-select');
        const checkinInputRow = rowCard.querySelector('.row-checkin-input');
        const checkoutInputRow = rowCard.querySelector('.row-checkout-input');
        const checkoutLabelRow = rowCard.querySelector('.row-checkout-label');
        const extSelectRow = rowCard.querySelector('.row-extension-select');
        const removeBtn = rowCard.querySelector('.btn-remove-room-row');

        // Populate dynamic dropdowns
        updateGuestsDropdown(rowCard);
        updateExtensionOptionsText(rowCard);

        catSelect.addEventListener('change', () => {
            updateGuestsDropdown(rowCard);
            updateExtensionOptionsText(rowCard);
            updateCategoryOptionsText(rowCard);
            updateTotalsBadge();
            updateItemizedReceiptTable();
        });

        guestsSelect.addEventListener('change', updateItemizedReceiptTable);
        extSelectRow.addEventListener('change', updateItemizedReceiptTable);

        checkinInputRow.addEventListener('change', () => {
            const currentCheckinVal = checkinInputRow.value;
            const currentCheckoutElem = rowCard.querySelector('.row-checkout-input');
            
            if (currentCheckoutElem && currentCheckoutElem.type === 'date') {
                currentCheckoutElem.min = currentCheckinVal;
                if (currentCheckoutElem.value <= currentCheckinVal) {
                    const nextDay = new Date(currentCheckinVal);
                    nextDay.setDate(nextDay.getDate() + 1);
                    currentCheckoutElem.value = nextDay.toISOString().split('T')[0];
                }
            }
            updateItemizedReceiptTable();
        });

        stayTypeSelectRow.addEventListener('change', () => {
            const currentCheckinVal = checkinInputRow.value || todayStr;
            const currentCheckoutElem = rowCard.querySelector('.row-checkout-input');

            if (stayTypeSelectRow.value === 'hourly') {
                checkoutLabelRow.innerText = 'Duration Hours';
                const selectElem = document.createElement('select');
                selectElem.className = 'row-checkout-input';
                [{ val: '3', text: '3 Hours' }, { val: '6', text: '6 Hours' }, { val: '8', text: '8 Hours' }, { val: '12', text: '12 Hours' }].forEach(opt => {
                    const el = document.createElement('option');
                    el.value = opt.val;
                    el.text = opt.text;
                    selectElem.appendChild(el);
                });

                selectElem.addEventListener('change', () => {
                    updateCategoryOptionsText(rowCard);
                    updateItemizedReceiptTable();
                });

                currentCheckoutElem.replaceWith(selectElem);
            } else {
                checkoutLabelRow.innerText = 'Check-out Date';
                const nextDay = new Date(currentCheckinVal);
                nextDay.setDate(nextDay.getDate() + 1);
                const nextDayStr = nextDay.toISOString().split('T')[0];

                const inputElem = document.createElement('input');
                inputElem.type = 'date';
                inputElem.className = 'row-checkout-input';
                inputElem.value = nextDayStr;
                inputElem.min = currentCheckinVal;
                inputElem.addEventListener('change', updateItemizedReceiptTable);
                currentCheckoutElem.replaceWith(inputElem);
            }

            updateExtensionOptionsText(rowCard);
            updateCategoryOptionsText(rowCard);
            updateItemizedReceiptTable();
        });

        removeBtn.addEventListener('click', () => {
            if (document.querySelectorAll('.room-type-builder-card').length > 1) {
                rowCard.remove();
                updateTotalsBadge();
                updateItemizedReceiptTable();
            } else {
                alert('At least one room selection row is required.');
            }
        });

        roomRowsContainer.appendChild(rowCard);
        updateTotalsBadge();
        updateCategoryOptionsText(rowCard);
        updateItemizedReceiptTable();
    }

    function getRequestedRoomRequirements() {
        const rows = [];
        const todayStr = new Date().toISOString().split('T')[0];

        document.querySelectorAll('.room-type-builder-card').forEach(card => {
            const rowId = card.dataset.rowId;
            const category = card.querySelector('.row-category-select').value;
            const guestsCount = parseInt(card.querySelector('.row-guests-select').value) || 1;
            const stayType = card.querySelector('.row-stay-type-select').value;
            const checkinVal = card.querySelector('.row-checkin-input')?.value || todayStr;
            const checkoutVal = card.querySelector('.row-checkout-input')?.value;
            const extHoursVal = parseInt(card.querySelector('.row-extension-select')?.value) || 0;

            rows.push({
                rowId,
                category,
                guestsCount,
                stayType,
                checkinVal,
                checkoutVal,
                extHoursVal
            });
        });
        return rows;
    }

    function updateTotalsBadge() {
        const totalRooms = document.querySelectorAll('.room-type-builder-card').length;

        if (totalRooms > 5) {
            alert('Maximum 5 rooms allowed per walk-in transaction.');
            totalRoomsBadge.innerText = '5 (Max Reached)';
        } else {
            totalRoomsBadge.innerText = totalRooms.toString();
        }
    }

    if (addRoomRowBtn) {
        addRoomRowBtn.addEventListener('click', () => {
            const currentTotal = document.querySelectorAll('.room-type-builder-card').length;
            if (currentTotal >= 5) {
                alert('You have reached the maximum limit of 5 rooms per booking.');
                return;
            }
            createRoomTypeRow('Standard Room');
        });
    }

    // Initialize first row
    createRoomTypeRow('Economy Room');

    // ==========================================================================
    // FLOOR MAP & ROOM ALLOCATION SYSTEM
    // ==========================================================================

    function scrollToActiveFloors(firstValidFloor) {
        const targetCard = document.getElementById(`floor-card-${firstValidFloor}`);
        if (targetCard && buildingFloorsContainer) {
            setTimeout(() => {
                const cardTopOffset = targetCard.offsetTop - buildingFloorsContainer.offsetTop;
                buildingFloorsContainer.scrollTo({
                    top: cardTopOffset,
                    behavior: 'smooth'
                });
            }, 120);
        }
    }

    function renderBuildingRoomsGrid() {
        buildingFloorsContainer.innerHTML = '';
        const roomRows = getRequestedRoomRequirements();
        
        const activeFloorsSet = new Set();
        roomRows.forEach(r => {
            (roomRates[r.category]?.floors || []).forEach(f => activeFloorsSet.add(f));
        });

        for (let floor = 12; floor >= 1; floor--) {
            const floorCard = document.createElement('div');
            const isTargetFloor = activeFloorsSet.has(floor);
            
            let floorTypeLabel = '';
            for (const [type, info] of Object.entries(roomRates)) {
                if (info.floors.includes(floor)) {
                    floorTypeLabel = type;
                    break;
                }
            }

            floorCard.className = `floor-card ${isTargetFloor ? 'highlighted-floor' : 'other-floor'}`;
            floorCard.id = `floor-card-${floor}`;

            let roomsHTML = '';
            for (let r = 1; r <= 8; r++) {
                const roomNum = `${floor}${r < 10 ? '0' + r : r}`;
                const isOccupied = occupiedRooms.has(roomNum);
                const isSelected = selectedRoomsList.some(item => item.roomNum === roomNum);
                
                const reqQtyForCategory = roomRows.filter(row => row.category === floorTypeLabel).length;
                const selectedQtyForCategory = selectedRoomsList.filter(item => item.category === floorTypeLabel).length;
                const isQuotaReachedForCategory = reqQtyForCategory > 0 && selectedQtyForCategory >= reqQtyForCategory;

                let statusClass = 'available';
                let statusText = 'Available';

                if (isOccupied) {
                    statusClass = 'occupied';
                    statusText = 'Occupied';
                } else if (isSelected) {
                    statusClass = 'selected';
                    statusText = 'Selected';
                } else if (isQuotaReachedForCategory) {
                    statusClass = 'quota-reached';
                    statusText = 'Quota Met';
                }

                if (!isTargetFloor && !isOccupied) {
                    statusClass += ' type-mismatch';
                }

                roomsHTML += `
                    <div class="room-btn ${statusClass}" data-room="${roomNum}" data-floor="${floor}" data-category="${floorTypeLabel}">
                        <span class="room-btn-number">${roomNum}</span>
                        <span class="room-btn-status">${statusText}</span>
                    </div>
                `;
            }

            floorCard.innerHTML = `
                <div class="floor-header">
                    <div class="floor-title-group">
                        <span class="floor-badge">Floor ${floor}</span>
                        <span class="floor-type-tag">${floorTypeLabel}</span>
                    </div>
                    <span style="font-size: 11px; color: #94a3b8;">8 Rooms / Floor</span>
                </div>
                <div class="rooms-grid">${roomsHTML}</div>
            `;

            buildingFloorsContainer.appendChild(floorCard);
        }

        document.querySelectorAll('.room-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const roomNum = btn.dataset.room;
                const category = btn.dataset.category;

                if (btn.classList.contains('occupied')) {
                    alert(`Room ${roomNum} is currently occupied.`);
                    return;
                }

                const roomRows = getRequestedRoomRequirements();
                const totalReqForCat = roomRows.filter(r => r.category === category).length;

                if (totalReqForCat === 0) {
                    alert(`Room ${roomNum} is a ${category}. You did not request any ${category}s in Step 1.`);
                    return;
                }

                const existingIndex = selectedRoomsList.findIndex(item => item.roomNum === roomNum);

                if (existingIndex > -1) {
                    selectedRoomsList.splice(existingIndex, 1);
                } else {
                    const alreadySelectedForCat = selectedRoomsList.filter(item => item.category === category).length;
                    if (alreadySelectedForCat >= totalReqForCat) {
                        alert(`You have already selected all ${totalReqForCat} required ${category}(s). Unselect an existing one if you want to switch rooms.`);
                        return;
                    }

                    selectedRoomsList.push({ roomNum, category, floor: parseInt(btn.dataset.floor) });
                }

                updateSelectedRoomsUI();
            });
        });

        updateSelectedRoomsUI();
    }

    function updateSelectedRoomsUI() {
        const roomRows = getRequestedRoomRequirements();
        const totalTargetRooms = roomRows.length;

        selectedRoomsCountEl.innerText = selectedRoomsList.length.toString();
        targetRoomsCountEl.innerText = totalTargetRooms.toString();

        pickerRequestedBreakdown.innerHTML = '';
        
        const categoryMap = {};
        roomRows.forEach(r => {
            categoryMap[r.category] = (categoryMap[r.category] || 0) + 1;
        });

        for (const [category, reqQty] of Object.entries(categoryMap)) {
            const currentSelectedCount = selectedRoomsList.filter(item => item.category === category).length;
            const isComplete = currentSelectedCount === reqQty;

            const badge = document.createElement('span');
            badge.className = `req-category-badge ${isComplete ? 'complete' : ''}`;
            badge.innerHTML = `${category}: ${currentSelectedCount} / ${reqQty} ${isComplete ? '✓' : ''}`;
            pickerRequestedBreakdown.appendChild(badge);
        }

        document.querySelectorAll('.room-btn').forEach(btn => {
            const roomNum = btn.dataset.room;
            const category = btn.dataset.category;
            if (btn.classList.contains('occupied')) return;

            const isSelected = selectedRoomsList.some(item => item.roomNum === roomNum);
            const reqQtyForCategory = roomRows.filter(row => row.category === category).length;
            const selectedQtyForCategory = selectedRoomsList.filter(item => item.category === category).length;
            const isQuotaReachedForCategory = reqQtyForCategory > 0 && selectedQtyForCategory >= reqQtyForCategory;

            if (isSelected) {
                btn.className = 'room-btn selected';
                btn.querySelector('.room-btn-status').innerText = 'Selected';
            } else if (isQuotaReachedForCategory) {
                btn.className = 'room-btn quota-reached';
                if (btn.classList.contains('type-mismatch')) btn.className += ' type-mismatch';
                btn.querySelector('.room-btn-status').innerText = 'Quota Met';
            } else if (btn.classList.contains('type-mismatch')) {
                btn.className = 'room-btn available type-mismatch';
                btn.querySelector('.room-btn-status').innerText = 'Available';
            } else {
                btn.className = 'room-btn available';
                btn.querySelector('.room-btn-status').innerText = 'Available';
            }
        });
    }

    // ==========================================================================
    // STEPPER NAVIGATION & FORM HANDLERS
    // ==========================================================================

    function goToStep(stepIndex) {
        stepPanels.forEach((panel, i) => {
            if (panel) panel.classList.toggle('active', i === stepIndex);
        });

        stepNodes.forEach((node, i) => {
            if (node) {
                node.classList.remove('active', 'completed', 'finished');
                if (stepIndex === 3) {
                    node.classList.add('finished');
                } else {
                    node.classList.toggle('active', i === stepIndex);
                    node.classList.toggle('completed', i < stepIndex);
                }
            }
        });

        if (trackerLine) {
            if (stepIndex === 0) trackerLine.style.width = '0%';
            else if (stepIndex === 1) trackerLine.style.width = '33.33%';
            else if (stepIndex === 2) trackerLine.style.width = '66.66%';
            else if (stepIndex === 3) trackerLine.style.width = '100%';
        }
    }

    if (walkinForm) {
        walkinForm.addEventListener('submit', (e) => {
            e.preventDefault();

            selectedRoomsList = [];
            renderBuildingRoomsGrid();
            goToStep(1);

            const roomRows = getRequestedRoomRequirements();
            const firstCategory = roomRows[0]?.category || 'Economy Room';
            const targetFloors = roomRates[firstCategory]?.floors || [1, 2];
            scrollToActiveFloors(targetFloors[1]);
        });
    }

    if (proceedToPaymentBtn) {
        proceedToPaymentBtn.addEventListener('click', () => {
            const roomRows = getRequestedRoomRequirements();
            const totalTargetRooms = roomRows.length;

            if (selectedRoomsList.length !== totalTargetRooms) {
                alert(`Please select all ${totalTargetRooms} room(s) from the floor map before proceeding to payment.`);
                return;
            }

            const guestName = document.getElementById('walkin-name').value;
            let calculatedSubtotal = 0;
            const summaryBreakdownLines = [];

            roomRows.forEach(r => {
                const nightlyPrice = roomRates[r.category]?.price || 5500;

                if (r.stayType === 'hourly') {
                    const hours = parseInt(r.checkoutVal) || 3;
                    let rateMultiplier = 0.30;
                    if (hours === 6) rateMultiplier = 0.50;
                    else if (hours === 8) rateMultiplier = 0.65;
                    else if (hours === 12) rateMultiplier = 0.80;

                    const rowCost = Math.round(nightlyPrice * rateMultiplier);
                    calculatedSubtotal += rowCost;
                    summaryBreakdownLines.push(`1x ${r.category} • Hourly Stay (${hours} Hours, ${r.guestsCount} Guest(s)) [₱${rowCost.toLocaleString()}]`);
                } else {
                    const checkInDateObj = new Date(r.checkinVal);
                    const checkOutDateObj = new Date(r.checkoutVal);
                    const diffTime = Math.abs(checkOutDateObj - checkInDateObj);
                    const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
                    const baseDailyCost = nightlyPrice * nights;

                    calculatedSubtotal += baseDailyCost;
                    summaryBreakdownLines.push(`1x ${r.category} • Daily Stay (${nights} Night(s), ${r.guestsCount} Guest(s)) [₱${baseDailyCost.toLocaleString()}]`);

                    const extHours = r.extHoursVal || 0;
                    if (extHours > 0) {
                        let extMultiplier = 0.30;
                        if (extHours === 6) extMultiplier = 0.50;
                        else if (extHours === 8) extMultiplier = 0.65;
                        else if (extHours === 12) extMultiplier = 0.80;

                        const extCost = Math.round(nightlyPrice * extMultiplier);
                        calculatedSubtotal += extCost;
                        summaryBreakdownLines.push(`&nbsp;&nbsp;&nbsp;&nbsp;+ Extension Hours (${extHours} Hours) [₱${extCost.toLocaleString()}]`);
                    }
                }
            });

            const taxAmount = Math.round(calculatedSubtotal * 0.12);
            const grandTotal = calculatedSubtotal + taxAmount;
            const roomNumbersText = selectedRoomsList.map(item => `${item.roomNum} (${item.category.split(' ')[0]})`).join(', ');

            document.getElementById('pay-summary-name').innerText = guestName;
            document.getElementById('pay-summary-room-breakdown').innerHTML = summaryBreakdownLines.join('<br>');
            document.getElementById('pay-summary-room-numbers').innerText = roomNumbersText;
            document.getElementById('pay-summary-total').innerText = `₱${grandTotal.toLocaleString()}`;

            walkinForm.dataset.summaryName = guestName;
            walkinForm.dataset.summaryDetail = summaryBreakdownLines.join(' | ');
            walkinForm.dataset.allocatedRooms = roomNumbersText;
            walkinForm.dataset.calculatedTotal = `₱${grandTotal.toLocaleString()}`;

            goToStep(2);
        });
    }

    if (backToStep1Btn) {
        backToStep1Btn.addEventListener('click', () => goToStep(0));
    }

    if (backToStep2Btn) {
        backToStep2Btn.addEventListener('click', () => goToStep(1));
    }

    if (confirmPaymentBtn) {
        confirmPaymentBtn.addEventListener('click', () => {
            const selectedMethod = paymentMethodSelect.value;

            if (['Maya', 'GCash', 'MariBank', 'GoTyme', 'CIMB'].includes(selectedMethod)) {
                qrProviderTitle.innerText = `${selectedMethod} Checkout`;
                qrProviderTitle.className = `qr-provider-logo ${selectedMethod.toLowerCase()}`;
                qrModalAmount.innerText = document.getElementById('pay-summary-total').innerText;
                qrModalOverlay.classList.add('active');
            } else {
                finalizeBooking();
            }
        });
    }

    if (closeQrModal) {
        closeQrModal.addEventListener('click', () => {
            qrModalOverlay.classList.remove('active');
        });
    }

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
        document.getElementById('conf-stay-detail').innerHTML = walkinForm.dataset.summaryDetail ? walkinForm.dataset.summaryDetail.replace(/ \| /g, '<br>') : '-';
        document.getElementById('conf-room-numbers').innerText = walkinForm.dataset.allocatedRooms || '-';

        goToStep(3);
    }

    if (newBookingBtn) {
        newBookingBtn.addEventListener('click', () => {
            walkinForm.reset();
            roomRowsContainer.innerHTML = '';
            createRoomTypeRow('Economy Room');
            selectedRoomsList = [];
            goToStep(0);
        });
    }
});