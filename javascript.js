document.addEventListener("DOMContentLoaded", function() {
    // Get all the buttons and contents
    const yearButtons = document.querySelectorAll("#forum-categories button");
    const yearContents = document.querySelectorAll("#forum-categories .content");

    // Function to toggle content visibility
    function toggleContent(content) {
        if (content.style.display === "block") {
            content.style.display = "none";
        } else {
            content.style.display = "block";
        }
    }

    // Add event listener to each button
    yearButtons.forEach(function(button) {
        button.addEventListener("click", function() {
            // Hide all contents
            yearContents.forEach(function(content) {
                content.style.display = "none";
            });

            // Toggle the content of the clicked button
            const content = this.nextElementSibling;
            toggleContent(content);
        });
    });
});
