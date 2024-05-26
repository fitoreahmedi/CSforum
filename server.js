const env = require('dotenv').config();
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const path = require('path');
const app = express();
const mongoose = require('mongoose');



app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());



const JWT_SECRET = process.env.JWT_SECRET;
const MONGODB_URI = process.env.MONGODB_URI;
const PORT = 3008;
const topicSchema = new mongoose.Schema({
    topic_name: String
});
const Topic = mongoose.model('Topic', topicSchema);

let usersCollection, postsCollection, commentsCollection, topicsCollection;

const connectToDatabase = async () => {
    try {
        const client = new MongoClient(MONGODB_URI);
        await client.connect();
        console.log('Connected to MongoDB');

        const dbForum = client.db('forum');

        usersCollection = dbForum.collection('users');

        postsCollection = dbForum.collection('posts');
        commentsCollection = dbForum.collection('comments');
        topicsCollection = dbForum.collection('topics');


        startServer();
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

const startServer = () => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
};

connectToDatabase();

// Authentication Middleware
const authenticateToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return ("token wrong");//res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};
app.get('/set-cookies', (req, res) => {

    // res.setHeader('Set-Cookie', 'newUser=true');
    
    res.cookie('newUser', false);
    res.cookie('isEmployee', true, { maxAge: 1000 * 60 * 60 * 24, httpOnly: true });
  
    res.send('you got the cookies!');
  
  });  

app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.get("/login", (req, res) => {
    res.render("login.js");
});

app.get("/signup", (req, res) => {
    res.render("signup.ejs");
});

// User Registration
app.post('/signup', async (req, res) => {
    const { username, email, bio, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const existingEmail = await usersCollection.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }

        const existingUser = await usersCollection.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Username already exists' });
        }

        const newUser = { username, email, bio, password: hashedPassword };
        const result = await usersCollection.insertOne(newUser);
        newUser._id = result.insertedId;

        const token = jwt.sign({ userId: newUser._id, username: newUser.username }, JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token);

        res.json({ success: true, message: 'User signed up successfully', user: newUser });
    } catch (error) {
        console.error('Error signing up user:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// User Login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await usersCollection.findOne({ username });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Login failed: User not found' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ success: false, message: 'Login failed: Incorrect password' });
        }

        const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true });

        res.json({ success: true, message: 'Login successful' });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.post('/set-topics', async (req, res) => {
    const { topic_name } = req.body;
    const newTopic = { topic_name};
    const result = await topicsCollection.insertOne(newTopic);
    res.json({ success: true, message: 'Topic inserted successfully', topic: newTopic });
});

// Define API endpoint to get topics
app.post('/topics', async (req, res) => {
    try {
    
        // Fetch all topics from the collection
        const topics = await topicsCollection.find({}).toArray();
    
        // Send the list of topics as JSON response
        res.json({ success: true, topics: topics });
      } catch (error) {
        console.error('Error fetching topics:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
});
// Logout
app.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ success: true, message: 'Logged out successfully' });
});

// Create Post
app.post('/set-post', async (req, res) => {
    const { title, content, userId, topic_id } = req.body;

    // Convert userId and topic_id to ObjectId
    const userIdObject = new ObjectId(userId);
    const topicIdObject = new ObjectId(topic_id);

    const newPost = { 
        title,
        content,
        userId: userIdObject,
        topic_id: topicIdObject,
        createdAt: new Date()
    };

    try {
        const result = await postsCollection.insertOne(newPost);
        newPost._id = result.insertedId;
        res.json({ success: true, message: 'Post created successfully', post: newPost });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Get All Posts
app.post('/posts', async (req, res) => {
    const {topic_id} = req.body;
    try {
        const postsWithUsername = await postsCollection.aggregate([
            {
                $match: { topic_id: topic_id } // Match posts based on topic_id
            },
            {
                $lookup: {
                    from: "users", // Collection to join with
                    localField: "userId",
                    foreignField: "_id",
                    as: "user" // Alias for the joined user document
                }
            },
            {
                $unwind: {
                    path: "$user",
                    preserveNullAndEmptyArrays: true // Preserve documents that don't match the join condition
                }
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    content: 1,
                    username: { $ifNull: ["$user.username", "Unknown"] } // Use "Unknown" if username is null
                }
            }
        ]).toArray();

        res.json({ success: true, message: 'Posts retrieved successfully', posts: postsWithUsername });
    } catch (error) {
        console.error('Error retrieving posts:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Add Comment to Post
app.post('/posts/:postId/comments', authenticateToken, async (req, res) => {
    const { content } = req.body;
    const userId = req.user.userId;
    const postId = req.params.postId;

    try {
        const post = await postsCollection.findOne({ _id: new ObjectId(postId) });
        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        const newComment = { content, userId, postId: new ObjectId(postId), createdAt: new Date() };
        const result = await commentsCollection.insertOne(newComment);
        newComment._id = result.insertedId;

        res.json({ success: true, message: 'Comment added successfully', comment: newComment });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
// Change bio
app.post('/change-bio', authenticateToken, async (req, res) => {
    const { bio } = req.body;

    try {
        // Update the bio for the logged-in user
        const updatedUser = await usersCollection.findOneAndUpdate(
            { _id: req.user.userId }, // Filter by user ID obtained from the token
            { $set: { bio: bio } }, // Set the new bio
            { returnOriginal: false } // Return the updated document
        );

        if (!updatedUser || !updatedUser.value) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, message: 'Bio updated successfully', user: updatedUser.value });
    } catch (error) {
        console.error('Error updating bio:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
app.post('/getUserById', async (req, res) => {
    const { userId } = req.body;

    try {
        // Fetch the user document from the users collection
        const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

        if (user) {
            // Send the username in the response
            res.json({ success: true, username: user.username });
        } else {
            // If user not found, send appropriate response
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        console.error('Error getting user by ID:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
