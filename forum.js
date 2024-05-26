document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("create-post-btn").addEventListener("click", function() {
        document.getElementById("post-form").style.display = "block";
    });

    document.getElementById("submit-post-btn").addEventListener("click", function() {
        var postTitle = document.getElementById("post-title").value;
        var postContent = document.getElementById("post-content").value;
        var username = "username";
        var avatar = "images.png";

        

        if (postTitle && postContent && username && avatar) {
            var postSection = document.getElementById("posts");
            var newPost = document.createElement("div");
            newPost.classList.add("post");
            

            var newPostHeader = document.createElement("div");
            newPostHeader.classList.add("post-header");

            var avatarImg = document.createElement("img");
            avatarImg.src = avatar;
            avatarImg.alt = username + "'s avatar";
            avatarImg.classList.add("avatar");

            var userInfo = document.createElement("div");
            userInfo.classList.add("user-info");

            var usernameDisplay = document.createElement("div");
            usernameDisplay.classList.add("username");
            usernameDisplay.textContent = username;

            userInfo.appendChild(usernameDisplay);

            var postBody = document.createElement("div");
            postBody.classList.add("post-body");

            var newPostTitle = document.createElement("div");
            newPostTitle.classList.add("post-title");
            newPostTitle.textContent = postTitle;

            var newPostContent = document.createElement("div");
            newPostContent.classList.add("post-content");
            newPostContent.textContent = postContent;

            postBody.appendChild(newPostTitle);
            postBody.appendChild(newPostContent);

            newPostHeader.appendChild(avatarImg);
            newPostHeader.appendChild(userInfo);
            newPostHeader.appendChild(postBody);

            var postButtons = document.createElement("div");
            postButtons.classList.add("post-buttons");

            var score = 0;
            var scoreDisplay = document.createElement("span");
            scoreDisplay.textContent = score;
            scoreDisplay.classList.add("score-display");

            var upvoteButton = document.createElement("button");
            upvoteButton.innerHTML = "&#9650;"; // Up arrow symbol
            upvoteButton.classList.add("upvote-btn");
            upvoteButton.addEventListener("click", function() {
                if (upvoteButton.classList.contains("active")) {
                    score--;
                    upvoteButton.classList.remove("active");
                } else {
                    score++;
                    upvoteButton.classList.add("active");
                    if (downvoteButton.classList.contains("active")) {
                        downvoteButton.classList.remove("active");
                        score++;
                    }
                }
                scoreDisplay.textContent = score;
            });

            var downvoteButton = document.createElement("button");
            downvoteButton.innerHTML = "&#9660;"; // Down arrow symbol
            downvoteButton.classList.add("downvote-btn");
            downvoteButton.addEventListener("click", function() {
                if (downvoteButton.classList.contains("active")) {
                    score++;
                    downvoteButton.classList.remove("active");
                } else {
                    score--;
                    downvoteButton.classList.add("active");
                    if (upvoteButton.classList.contains("active")) {
                        upvoteButton.classList.remove("active");
                        score--;
                    }
                }
                scoreDisplay.textContent = score;
            });

            var shareButton = document.createElement("button");
            shareButton.textContent = "Share";
            shareButton.classList.add("share-btn");
            shareButton.addEventListener("click", function() {
                // Handle share logic here
            });

            var deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.classList.add("delete-post-btn");
            deleteButton.addEventListener("click", function() {
                postSection.removeChild(newPost);
            });

            postButtons.appendChild(upvoteButton);
            postButtons.appendChild(scoreDisplay);
            postButtons.appendChild(downvoteButton);
            postButtons.appendChild(shareButton);
            postButtons.appendChild(deleteButton);

            newPost.appendChild(newPostHeader);
            newPost.appendChild(postButtons);

            postSection.appendChild(newPost);

            // Reset form values
            document.getElementById("post-title").value = "";
            document.getElementById("post-content").value = "";

            // Hide the post form
            document.getElementById("post-form").style.display = "none";
        } else {
            alert("Please fill out all fields.");
        }
    });
});
