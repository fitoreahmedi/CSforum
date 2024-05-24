document.getElementById('postBtn').addEventListener('click', function() {
    const postContent = document.getElementById('postContent').value;
    if (postContent.trim() === '') return;

    const post = document.createElement('div');
    post.className = 'post';

    const content = document.createElement('div');
    content.className = 'content';
    content.textContent = postContent;

    const actions = document.createElement('div');
    actions.className = 'actions';

    const upvoteBtn = document.createElement('button');
    upvoteBtn.textContent = 'Upvote';
    upvoteBtn.addEventListener('click', function() {
        let count = parseInt(this.textContent.split(' ')[1]) || 0;
        count++;
        this.textContent = `Upvote ${count}`;
    });

    const downvoteBtn = document.createElement('button');
    downvoteBtn.textContent = 'Downvote';
    downvoteBtn.addEventListener('click', function() {
        let count = parseInt(this.textContent.split(' ')[1]) || 0;
        count--;
        this.textContent = `Downvote ${count}`;
    });

    const shareBtn = document.createElement('button');
    shareBtn.textContent = 'Share';

    const commentBtn = document.createElement('button');
    commentBtn.textContent = 'Comment';
    commentBtn.addEventListener('click', function() {
        const commentSection = document.createElement('div');
        commentSection.className = 'comments';

        const commentInput = document.createElement('textarea');
        commentInput.placeholder = 'Add a comment...';

        const submitCommentBtn = document.createElement('button');
        submitCommentBtn.textContent = 'Submit';
        submitCommentBtn.addEventListener('click', function() {
            const commentContent = commentInput.value;
            if (commentContent.trim() === '') return;

            const comment = document.createElement('div');
            comment.className = 'comment';
            comment.textContent = commentContent;

            commentSection.appendChild(comment);
            commentInput.value = '';
        });

        commentSection.appendChild(commentInput);
        commentSection.appendChild(submitCommentBtn);
        post.appendChild(commentSection);
    });

    actions.appendChild(upvoteBtn);
    actions.appendChild(downvoteBtn);
    actions.appendChild(shareBtn);
    actions.appendChild(commentBtn);

    post.appendChild(content);
    post.appendChild(actions);

    document.getElementById('posts').appendChild(post);
    document.getElementById('postContent').value = '';
});

document.getElementById('subscribeBtn').addEventListener('click', function() {
    alert('You have subscribed to notifications for this forum.');
});

