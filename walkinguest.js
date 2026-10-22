/**
 * Walk-In Guest Management Script (walkinguest.js)
 * -------------------------------------------------------------------------
 * This file handles the form data submission, shows a confirmation message,
 * and automatically routes the user back to the dashboard.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Select the walk-in form from the HTML by its ID
    const form = document.getElementById('walkin-form');

    // Add an event listener to handle form submission actions
    form.addEventListener('submit', (e) => {
        // Prevent the page from doing a default browser reload
        e.preventDefault();
        
        // Grab the values typed/selected by the user in the form fields
        const guestName = document.getElementById('walkin-name').value;
        const roomType = document.getElementById('walkinguest-room') ? document.getElementById('walkinguest-room').value : document.getElementById('walkin-room').value;
        const nights = document.getElementById('walkin-nights').value;

        // Show a popup confirmation alert detailing the booking summary
        alert(`Walk-In Confirmed!\n\nGuest: ${guestName}\nRoom: ${roomType}\nNights: ${nights}`);
        
        // Redirect the user back to the admin dashboard page
        window.location.href = 'dashboard.html';
    });
});