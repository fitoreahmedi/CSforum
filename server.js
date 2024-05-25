const express = require("express");
const mongoose = require("mongoose");
const { MongoClient, ObjectId } = require('mongodb');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const app = express();
const path = require('path');


app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')));
const uri = 'mongodb+srv://mongooseaccess:1N9GQ2GRgGo5MCx9@cluster0.qakl86r.mongodb.net/your_database_name?retryWrites=true&w=majority&appName=Cluster0';

const client = new MongoClient(uri);

// Database Name
const dbName = 'users'; //  Database name

// Connect to the MongoDB server
client.connect(async (err) => {
    if (err) {
        console.error('Error connecting to MongoDB:', err);
        return;
    }
    console.log('Connected to MongoDB');

    // Get a reference to the database
    const db = client.db(dbName);

    try {
        // Fetch data from a collection
        const collection = db.collection('users'); // Collection name
        const documents = collection.find({}).toArray(); // Fetch all documents

        console.log('Fetched documents:', documents);
    } catch (error) {
        console.error('Error fetching documents:', error);
    } finally {
        // Close the connection
        client.close();
    }
})
app.get("/", (req, res) =>{
    res.render("index.ejs")
})
app.get("/login", (req, res) =>{
    res.render("login.ejs")
})
app.get("/signup", (req, res) =>{
    res.render("signup.ejs")
})
app.use(bodyParser.json());

const db = client.db('users'); // Replace 'your_database_name' with your actual database name
const usersCollection = db.collection('users'); // Replace 'users' with your actual collection name
// =================================================================POST for SignUP=======================================================================
app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ username });
    if (existingUser) {
        return res.status(400).json({ success: false, message: 'Username already exists' });
    }

    // Insert new user
    const newUser = {
        username,
        email,
        password: hashedPassword
    };

    try {
        const result = await usersCollection.insertOne(newUser);
        newUser._id = result.insertedId; // Assign the generated ObjectId to the newUser object
        res.json({ success: true, message: 'User signed up successfully', user: newUser });
    } catch (error) {
        if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }
        console.error('Error signing up user:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
//==========================================================POST endpoint for login=============================================================
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Find user in the database
    const user = await usersCollection.findOne({ username });

    if (!user) {
        return res.status(401).json({ success: false, message: 'Login failed: User not found' });
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
        res.json({ success: true, message: 'Login successful', user });
    } else {
        res.status(401).json({ success: false, message: 'Login failed: Incorrect password' });
    }
});
const dbForum = client.db('forum'); // Database name
const postsCollection = dbForum.collection('posts'); // Collection name
const commentsCollection = dbForum.collection('comments');

//==================================================================POST endpoint for creating a post==============================================
app.post('/posts', async (req, res) => {
    const { title, content, userId, subForum } = req.body;

    // Insert new post
    const newPost = {
        title,
        content,
        userId,
        subForum,
        createdAt: new Date(),
    };

    try {
        const result = await postsCollection.insertOne(newPost);
        newPost._id = result.insertedId; // Assign the generated ObjectId to the newPost object
        res.json({ success: true, message: 'Post created successfully', post: newPost });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//===========================================================GET endpoint for searching all posts====================================================
app.get('/posts', async (req, res) => {
    try {
        const posts = await postsCollection.find().toArray();
        res.json({ success: true, message: 'Posts retrieved successfully', posts });
    } catch (error) {
        console.error('Error retrieving posts:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
//===================================================== POST endpoint for adding a comment to a post====================================================
app.post('/posts/:postId/comments', async (req, res) => {
    const { content, userId } = req.body;
    const postId = req.params.postId;

    try {
        // Check if the post exists
        const post = await postsCollection.findOne({ _id: new ObjectId(postId) });
        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        // Insert new comment
        const newComment = {
            content,
            userId,
            postId: new ObjectId(postId),
            createdAt: new Date(),
        };

        const result = await commentsCollection.insertOne(newComment);
        newComment._id = result.insertedId; // Assign the generated ObjectId to the newComment object

        res.json({ success: true, message: 'Comment added successfully', comment: newComment });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.listen(3000, () => {
    console.log(`Server is running on port 3000`);
});


