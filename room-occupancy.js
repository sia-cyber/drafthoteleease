const rooms = {
    "101": {
        category: "Standard",
        guest: "No guest",
        status: "VR"
    },
    "102": {
        category: "Deluxe",
        guest: "Maria Santos",
        status: "OCC"
    },
    "103": {
        category: "Budget",
        guest: "John Reyes",
        status: "OCC"
    },
    "104": {
        category: "Premium",
        guest: "No guest",
        status: "VR"
    },
    "105": {
        category: "Deluxe",
        guest: "No guest",
        status: "VR"
    },
    "106": {
        category: "Standard",
        guest: "No guest",
        status: "VR"
    }
};


const detailsButtons = document.querySelectorAll(".details-btn");

const roomModal = document.getElementById("roomModal");
const closeModal = document.getElementById("closeModal");
const doneModal = document.getElementById("doneModal");

detailsButtons.forEach(function(button) {
    button.addEventListener("click", function() {
        const roomNumber = button.dataset.room;
        const room = rooms[roomNumber];

        if (!room) return;

        document.getElementById("modalRoomNumber").textContent =
            "Room " + roomNumber;

        document.getElementById("modalCategory").textContent =
            room.category;

        document.getElementById("modalGuest").textContent =
            room.guest;

        document.getElementById("modalStatus").textContent =
            room.status + " — " + statusNames[room.status];

        roomModal.classList.add("show");
    });
});



const statusNames = {
    "VR": "Vacant Ready",
    "OCC": "Occupied",
    "VD": "Vacant Dirty",
    "OOO": "Out of Order"
};

const statusClasses = {
    "VR": "vacant-ready",
    "OCC": "occupied",
    "VD": "vacant-dirty",
    "OOO": "out-of-order"
};

function updateRoomCounts() {
    document.getElementById("totalRooms").textContent =
        Object.keys(rooms).length;

    document.getElementById("availableRooms").textContent =
        Object.values(rooms).filter(function(room) {
            return room.status === "VR";
        }).length;
}

// Set each dropdown to its room's current status.
const statusSelects = document.querySelectorAll(".status-select");

statusSelects.forEach(function(select) {
    const roomNumber = select.dataset.room;
    const room = rooms[roomNumber];

    if (!room) return;

    select.value = room.status;

    select.addEventListener("change", function() {
        const newStatus = select.value;

        room.status = newStatus;

        const row = select.closest("tr");
        const statusLabel = row.querySelector(".status");

        statusLabel.textContent =
            newStatus + " — " + statusNames[newStatus];

        statusLabel.className =
            "status " + statusClasses[newStatus];

        updateRoomCounts();

        // Update the details modal if this room is being viewed.
        if (
            roomModal.classList.contains("show") &&
            document.getElementById("modalRoomNumber").textContent ===
                "Room " + roomNumber
        ) {
            document.getElementById("modalStatus").textContent =
                newStatus + " — " + statusNames[newStatus];
        }
    });
});

updateRoomCounts();



function hideRoomModal() {
    roomModal.classList.remove("show");
}

closeModal.addEventListener("click", hideRoomModal);
doneModal.addEventListener("click", hideRoomModal);

roomModal.addEventListener("click", function(event) {
    if (event.target === roomModal) {
        hideRoomModal();
    }
});

document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
        hideRoomModal();
    }
});


/* =========================
   SIDEBAR FUNCTIONALITY
========================= */

const menuButton = document.querySelector(".menu-button");
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");
const sidebarClose = document.getElementById("sidebarClose");

function openSidebar() {
    sidebar.classList.add("open");
    sidebarOverlay.classList.add("show");
    document.body.classList.add("sidebar-open");

    sidebar.setAttribute("aria-hidden", "false");
    menuButton.setAttribute("aria-expanded", "true");
    sidebarClose.focus();
}

function closeSidebar() {
    sidebar.classList.remove("open");
    sidebarOverlay.classList.remove("show");
    document.body.classList.remove("sidebar-open");

    sidebar.setAttribute("aria-hidden", "true");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.focus();
}

menuButton.setAttribute("aria-expanded", "false");

menuButton.addEventListener("click", openSidebar);

sidebarClose.addEventListener("click", closeSidebar);

sidebarOverlay.addEventListener("click", closeSidebar);

document.addEventListener("keydown", function(event) {
    if (event.key === "Escape" && sidebar.classList.contains("open")) {
        closeSidebar();
    }
});


const roomSearch = document.getElementById("roomSearch");
const clearSearch = document.getElementById("clearSearch");
const roomRows = document.querySelectorAll("#roomTableBody tr");

function filterRooms() {
    const searchText = roomSearch.value.trim().toLowerCase();

    roomRows.forEach(function(row) {
        const roomNumber = row.cells[0].textContent.toLowerCase();
        const guestName = row.cells[2].textContent.toLowerCase();

        const matches =
            roomNumber.includes(searchText) ||
            guestName.includes(searchText);

        row.style.display = matches ? "" : "none";
    });
}

roomSearch.addEventListener("input", filterRooms);

clearSearch.addEventListener("click", function() {
    roomSearch.value = "";
    filterRooms();
    roomSearch.focus();
});
