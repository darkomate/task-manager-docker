# Task Manager Docker Project
This project is taken from Himnish Chopra Video on Full Stack App with Docker in Minutes.

## 

-----------------------------------------------------------------------------------
- Youtube: https://www.youtube.com/watch?v=K7PsxBMeBCI                            -
- Files: https://drive.google.com/drive/folders/1Il_RsPJQbJt0veH1n7KVhvhNEZW2WGb5 -
- Time: 9:27                                                                      -
-----------------------------------------------------------------------------------

Pull MongoDB latest image
````bash
docker pull mongo:latest
````

Check available running networks
````bash
docker network ls
````

Create new network for the project
````bash
docker network create task-manager-network
````

Run frontend with the following command. This will serve the index.html file. Make sure you are in the frontend directory when running the command.
````bash
docker run -d --name frontend --network task-manager-network -p 8080:80 -v ./:/usr/share/nginx/html nginx:1.29.4
````

Create MongoDB container. The name 'mongodb' will be the name of the MongoDB database to connect to.
````bash
docker run -d --name mongodb --network task-manager-network -p 27017:27017 mongo:latest
````

Create backend directory 'backend'.
````bash
mkdir backend
````

Pull Node Image. I am using node:20-bullseye. This will run the Express server.
````bash
docker pull node:20-bullseye
````

Create 'index.js' file and add following code. This will be used to serve the data fetching.
````bash
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
````

The 'index.html' file to serve as the frontend has the following code.
````bash
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Task App</title>
</head>
<body>
    <h1>Task List</h1>
    <h3>by Loniu</h3>
    <ul id="task-list"></ul>
    <input type="text" id="task-input" placeholder="Add a new task">
    <button id="add-task">Add Task</button>

    <script>
        // API endpoint
        const API_URL = 'http://localhost:3000/tasks';

        // Fetch tasks from the API
        async function fetchTasks() {
            try {
                const response = await fetch(API_URL);
                const tasks = await response.json();
                const taskList = document.getElementById('task-list');
                taskList.innerHTML = '';

                tasks.forEach(task => {
                    const li = document.createElement('li');
                    li.textContent = task.taskName;
                    taskList.appendChild(li);
                });
            } catch (error) {
                console.error('Error fetching tasks:', error);
            }
        }

        // Add a new task to the API
        async function addTask(taskName) {
            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ taskName })
                });

                if (response.ok) {
                    console.log('Task added successfully');
                    fetchTasks(); // Reload tasks after adding
                } else {
                    console.error('Error adding task');
                }
            } catch (error) {
                console.error('Error adding task:', error);
            }
        }

        // Event listener for adding a task
        document.getElementById('add-task').addEventListener('click', () => {
            const taskInput = document.getElementById('task-input');
            const taskName = taskInput.value;

            if (taskName) {
                addTask(taskName);
                taskInput.value = ''; // Clear the input field
            }
        });

        // Fetch tasks on page load
        window.onload = fetchTasks;
    </script>
</body>
</html>
````

Finally create 'Dockerfile' for the container build.
````bash
FROM node:20-bullseye

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
````

Go into the 'backend' directory to build the backend image. Run the following.
````bash
docker build -t backend .
````


Run the newly created backend image.
````bash
docker run -d --name backend --network task-manager-network -p 3000:3000 backend:latest
````

Confirm that databases adding records correctly.
````bash
docker exec -it mongodb mongosh
show dbs
use taskdb
db.tasks.find().pretty()
````




