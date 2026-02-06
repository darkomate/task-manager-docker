const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

// Connect to MongoDB
mongoose.connect('mongodb://mongodb:27017/taskdb', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Connected to MongoDB successfully!");
    }).catch((error)=>{
        console.log("Error connecting to MongoDB: ", error);
    });

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Define Task Schema and Model
const taskSchema = new mongoose.Schema({
    taskName: String,
    completed: Boolean
});

const Task = mongoose.model('Task', taskSchema);

// Get /tasks - Retrieve all tasks
app.get('/tasks', async (req, res) => {
    try {
        const tasks = await Task.find();
        console.log(`Retrieved $(tasks.length) tasks from the dbase`);
        res.json(tasks);
    } catch(error) {
        console.log('Error occured: ', error);
        res.status(500).json({error: 'Error occured with getting tasks'});
    }
})

// Post /add - Add new task
app.post('/tasks', async(req, res) => {
    const { taskName } = req.body;
    console.log('Trying to add new task');

    // Create new Task model and add data parsed from the body of the index.html in frontend directory
    const newT = new Task({
        taskName,
        completed: false
    });

    try {
        const savedT = await newT.save();
        console.log(`Task added successfully: $(savedT)`);
        res.status(201).json(savedT);
    } catch(error) {
        console.log("Error occured with adding new task: ", error);
        res.status(500).json({error: 'Error occured with adding task'});
    }
});

// Expose port 3000
const PORT = 3000;
app.listen(PORT, ()=>{
    console.log(`Server running on port $(PORT)`);
})