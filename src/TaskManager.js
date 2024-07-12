// src/TaskManager.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { firestore } from './firebaseConfig';

const TaskManager = ({ username }) => {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [game, setGame] = useState('');
  const [games, setGames] = useState([]);
  const [openGameDialog, setOpenGameDialog] = useState(false);
  const [gameToDelete, setGameToDelete] = useState(null);

  // Function to fetch tasks from Firestore
  const fetchTasks = async () => {
    const querySnapshot = await getDocs(collection(firestore, 'Tasks'));
    const tasksList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setTasks(tasksList);
  };

  // Function to fetch games from Firestore
  const fetchGames = async () => {
    const querySnapshot = await getDocs(collection(firestore, 'Games'));
    const gamesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setGames(gamesList);
  };

  // Fetch tasks and games when component mounts
  useEffect(() => {
    fetchTasks();
    fetchGames();
  }, []);

  // Function to handle task submission
  const handleAddTask = async () => {
    if (task.trim()) {
      try {
        await addDoc(collection(firestore, 'Tasks'), {
          task,
          username,
          createdAt: new Date(),
        });
        alert('Task added successfully');
        setTask(''); // Clear the input field
        fetchTasks(); // Refresh the list of tasks
      } catch (error) {
        console.error('Error adding task:', error);
        alert(`Error adding task: ${error.message}`);
      }
    } else {
      alert('Task cannot be empty');
    }
  };

  // Function to handle game submission
  const handleAddGame = async () => {
    if (game.trim()) {
      try {
        await addDoc(collection(firestore, 'Games'), {
          game,
          username,
          createdAt: new Date(),
        });
        alert('Game added successfully');
        setGame(''); // Clear the input field
        fetchGames(); // Refresh the list of games
      } catch (error) {
        console.error('Error adding game:', error);
        alert(`Error adding game: ${error.message}`);
      }
    } else {
      alert('Game cannot be empty');
    }
  };

  // Function to handle task deletion
  const handleDeleteTask = async (id) => {
    try {
      await deleteDoc(doc(firestore, 'Tasks', id));
      alert('Task deleted successfully');
      fetchTasks(); // Refresh the list of tasks
      handleCloseTaskDialog(); // Close the dialog
    } catch (error) {
      console.error('Error deleting task:', error);
      alert(`Error deleting task: ${error.message}`);
    }
  };

  // Function to handle game deletion
  const handleDeleteGame = async (id) => {
    try {
      await deleteDoc(doc(firestore, 'Games', id));
      alert('Game deleted successfully');
      fetchGames(); // Refresh the list of games
      handleCloseGameDialog(); // Close the dialog
    } catch (error) {
      console.error('Error deleting game:', error);
      alert(`Error deleting game: ${error.message}`);
    }
  };

  // Function to open the task confirmation dialog
  const handleOpenTaskDialog = (taskId) => {
    setTaskToDelete(taskId);
    setOpenTaskDialog(true);
  };

  // Function to close the task confirmation dialog
  const handleCloseTaskDialog = () => {
    setOpenTaskDialog(false);
    setTaskToDelete(null);
  };

  // Function to open the game confirmation dialog
  const handleOpenGameDialog = (gameId) => {
    setGameToDelete(gameId);
    setOpenGameDialog(true);
  };

  // Function to close the game confirmation dialog
  const handleCloseGameDialog = () => {
    setOpenGameDialog(false);
    setGameToDelete(null);
  };

  return (
    <Container component={Paper} style={{ padding: '20px', backgroundColor: '#1d1d1d', color: '#ffffff', marginTop: '20px' }}>
      <Typography variant="h5" style={{ textAlign: 'center', color: '#ffffff' }}>Tasks</Typography>
      <TextField
        label="New Task"
        variant="outlined"
        fullWidth
        value={task}
        onChange={(e) => setTask(e.target.value)}
        style={{ marginTop: '20px', color: '#ffffff', backgroundColor: '#2c2c2c', borderRadius: '5px' }}
        InputLabelProps={{
          style: { color: '#ffffff' },
        }}
        InputProps={{
          style: { color: '#ffffff' },
        }}
      />
      <Button variant="contained" color="primary" onClick={handleAddTask} style={{ marginTop: '10px' }}>
        Add Task
      </Button>
      <List style={{ marginTop: '20px' }}>
        {tasks.map((taskItem) => (
          <ListItem key={taskItem.id} secondaryAction={
            <IconButton edge="end" aria-label="delete" onClick={() => handleOpenTaskDialog(taskItem.id)}>
              <DeleteIcon style={{ color: '#ffffff' }} />
            </IconButton>
          }>
            <ListItemText
              primary={taskItem.task}
              secondary={`Added by ${taskItem.username}`}
              primaryTypographyProps={{ style: { color: 'white' } }}
              secondaryTypographyProps={{ style: { color: 'gray' } }}
            />
          </ListItem>
        ))}
      </List>
      <Dialog
        open={openTaskDialog}
        onClose={handleCloseTaskDialog}
      >
        <DialogTitle style={{ color: '#ffffff' }}>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText style={{ color: '#ffffff' }}>
            Are you sure you want to delete this task? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTaskDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={() => handleDeleteTask(taskToDelete)} color="primary" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      <Typography variant="h5" style={{ marginTop: '40px', textAlign: 'center', color: '#ffffff' }}>Games</Typography>
      <TextField
        label="New Game"
        variant="outlined"
        fullWidth
        value={game}
        onChange={(e) => setGame(e.target.value)}
        style={{ marginTop: '20px', color: '#ffffff', backgroundColor: '#2c2c2c', borderRadius: '5px' }}
        InputLabelProps={{
          style: { color: '#ffffff' },
        }}
        InputProps={{
          style: { color: '#ffffff' },
        }}
      />
      <Button variant="contained" color="primary" onClick={handleAddGame} style={{ marginTop: '10px' }}>
        Add Game
      </Button>
      <List style={{ marginTop: '20px' }}>
        {games.map((gameItem) => (
          <ListItem key={gameItem.id} secondaryAction={
            <IconButton edge="end" aria-label="delete" onClick={() => handleOpenGameDialog(gameItem.id)}>
              <DeleteIcon style={{ color: '#ffffff' }} />
            </IconButton>
          }>
            <ListItemText
              primary={gameItem.game}
              secondary={`Created by ${gameItem.username}`}
              primaryTypographyProps={{ style: { color: 'white' } }}
              secondaryTypographyProps={{ style: { color: 'gray' } }}
            />
          </ListItem>
        ))}
      </List>
      <Dialog
        open={openGameDialog}
        onClose={handleCloseGameDialog}
      >
        <DialogTitle style={{ color: '#ffffff' }}>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText style={{ color: '#ffffff' }}>
            Are you sure you want to delete this game? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseGameDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={() => handleDeleteGame(gameToDelete)} color="primary" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TaskManager;
