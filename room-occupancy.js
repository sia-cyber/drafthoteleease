const rooms = {
    "101": {
        category: "Standard",
        guest: "No guest",
        status: "Available"
    },
    "102": {
        category: "Deluxe",
        guest: "Maria Santos",
        status: "Occupied"
    },
    "103": {
        category: "Budget",
        guest: "John Reyes",
        status: "Check-in"
    },
    "104": {
        category: "Premium",
        guest: "No guest",
        status: "Reserved"
    },
    "105": {
    category: "Deluxe",
    guest: "No guest",
    status: "Available"
    },
    "106": {
    category: "Standard",
    guest: "No guest",
    status: "Available"
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
            room.status;

        roomModal.classList.add("show");
    });
});

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