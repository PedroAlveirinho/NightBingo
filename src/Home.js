// src/Home.js
import React, { useState, useEffect } from 'react';
import { Container, Typography, List, ListItem, ListItemText, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, Tabs, Tab } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getDocs, collection, doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { firestore } from './firebaseConfig';
import TaskManager from './TaskManager';
import Leaderboard from './Leaderboard';  // Import Leaderboard component

const Home = ({ username }) => {
  const [games, setGames] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [currentGameId, setCurrentGameId] = useState(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [taskDialogType, setTaskDialogType] = useState(null); // 'complete' or 'remove'
  const [selectedTab, setSelectedTab] = useState(0);

  // Function to fetch games from Firestore
  const fetchGames = async () => {
    const querySnapshot = await getDocs(collection(firestore, 'Games'));
    const gamesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setGames(gamesList);
  };

  // Function to fetch tasks from Firestore
  const fetchTasks = async () => {
    const querySnapshot = await getDocs(collection(firestore, 'Tasks'));
    const tasksList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setTasks(tasksList);
  };

  // Fetch games and tasks when component mounts
  useEffect(() => {
    fetchGames();
    fetchTasks();
  }, []);

  // Handle game click
  const handleGameClick = async (gameId, gameName) => {
    const gameDocRef = doc(firestore, 'Games', gameId);
    const gameDoc = await getDoc(gameDocRef);
    const gameData = gameDoc.data();

    if (gameData.participants && gameData.participants.includes(username)) {
      setSelectedGame({ id: gameId, name: gameName });
      setCompletedTasks(gameData.completedTasks && gameData.completedTasks[username] ? gameData.completedTasks[username] : []);
    } else {
      setCurrentGameId(gameId);
      setJoinDialogOpen(true);
    }
  };

  // Handle join confirmation
  const handleJoinGame = async () => {
    if (currentGameId) {
      const gameDocRef = doc(firestore, 'Games', currentGameId);
      await updateDoc(gameDocRef, {
        participants: arrayUnion(username)
      });
      const game = games.find(game => game.id === currentGameId);
      setSelectedGame({ id: currentGameId, name: game.game });
      setCompletedTasks([]);
    }
    setJoinDialogOpen(false);
  };

  // Handle back button click
  const handleBackClick = () => {
    setSelectedGame(null);
    setCompletedTasks([]);
  };

  // Handle task click to mark as completed or remove from completed
  const handleTaskClick = (task) => {
    setCurrentTask(task);
    if (completedTasks.includes(task.id)) {
      setTaskDialogType('remove');
    } else {
      setTaskDialogType('complete');
    }
    setTaskDialogOpen(true);
  };

  // Confirm task completion
  const handleConfirmTaskCompletion = async () => {
    if (selectedGame && currentTask) {
      const gameDocRef = doc(firestore, 'Games', selectedGame.id);
      await updateDoc(gameDocRef, {
        [`completedTasks.${username}`]: arrayUnion(currentTask.id)
      });
      setCompletedTasks([...completedTasks, currentTask.id]);
    }
    setTaskDialogOpen(false);
    setCurrentTask(null);
  };

  // Confirm task removal from completed
  const handleConfirmTaskRemoval = async () => {
    if (selectedGame && currentTask) {
      const gameDocRef = doc(firestore, 'Games', selectedGame.id);
      await updateDoc(gameDocRef, {
        [`completedTasks.${username}`]: arrayRemove(currentTask.id)
      });
      setCompletedTasks(completedTasks.filter(taskId => taskId !== currentTask.id));
    }
    setTaskDialogOpen(false);
    setCurrentTask(null);
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  return (
    <Container style={{ padding: '10px' }}>
      {selectedGame ? (
        <>
          <IconButton onClick={handleBackClick} style={{ marginTop: '10px' }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" style={{ marginTop: '10px', textAlign: 'center' }}>
            Welcome to the game: {selectedGame.name}
          </Typography>
          <Tabs value={selectedTab} onChange={handleTabChange} style={{ marginTop: '20px' }}>
            <Tab label="Tasks" />
            <Tab label="Leaderboard" />
          </Tabs>
          {selectedTab === 0 && (
            <List style={{ marginTop: '10px' }}>
              {tasks.map((task) => (
                <ListItem
                  button
                  key={task.id}
                  onClick={() => handleTaskClick(task)}
                  style={{
                    backgroundColor: '#f0f0f0',
                    margin: '10px 0',
                    borderRadius: '8px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                    transition: 'background-color 0.3s ease',
                    textDecoration: completedTasks.includes(task.id) ? 'line-through' : 'none',
                    color: completedTasks.includes(task.id) ? '#888' : 'inherit'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e0e0e0'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                >
                  <ListItemText primary={task.task} />
                </ListItem>
              ))}
            </List>
          )}
          {selectedTab === 1 && (
            <Leaderboard gameId={selectedGame.id} />
          )}
        </>
      ) : (
        <>
          <Typography variant="h4" style={{ textAlign: 'center' }}>Hello, {username}</Typography>
          {username === 'Manager' && <TaskManager username={username} />}
          <Typography variant="h5" style={{ marginTop: '20px', textAlign: 'center' }}>Games</Typography>
          <List style={{ marginTop: '10px' }}>
            {games.map((game) => (
              <ListItem
                button
                key={game.id}
                onClick={() => handleGameClick(game.id, game.game)}
                style={{
                  backgroundColor: '#f0f0f0',
                  margin: '10px 0',
                  borderRadius: '8px',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                  transition: 'background-color 0.3s ease',
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e0e0e0'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
              >
                <ListItemText primary={game.game} />
              </ListItem>
            ))}
          </List>
        </>
      )}

      <Dialog open={joinDialogOpen} onClose={() => setJoinDialogOpen(false)}>
        <DialogTitle>Join Game</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Do you want to join this game?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setJoinDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleJoinGame} color="primary">
            Join
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={taskDialogOpen} onClose={() => setTaskDialogOpen(false)}>
        <DialogTitle>{taskDialogType === 'complete' ? 'Complete Task' : 'Remove Task Completion'}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {taskDialogType === 'complete' ? 'Are you sure you have completed this task?' : 'Are you sure you want to remove this task from your completed list?'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTaskDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={taskDialogType === 'complete' ? handleConfirmTaskCompletion : handleConfirmTaskRemoval} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Home;
