// src/Home.js
import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { Container, Typography, List, ListItem, ListItemText, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, Tabs, Tab, Box } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getDocs, collection, doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { firestore } from './firebaseConfig';
import TaskManager from './TaskManager';
import Leaderboard from './Leaderboard';  // Import Leaderboard component
import darkTheme from './theme'; // Import dark theme

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
    <ThemeProvider theme={darkTheme}>
      <Container style={{ padding: '10px', backgroundColor: darkTheme.palette.background.default, minHeight: '100vh' }}>
        {selectedGame ? (
          <Box>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <IconButton onClick={handleBackClick} style={{ color: '#ffffff' }}>
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h5" style={{ flexGrow: 1, textAlign: 'center', color: '#ffffff' }}>
                {selectedGame.name}
              </Typography>
              <Box width="48px"></Box> {/* Empty box to balance the back icon */}
            </Box>
            <Tabs
              value={selectedTab}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
              style={{ marginTop: '10px' }}
            >
              <Tab label="Tasks" style={{ color: 'white' }} />
              <Tab label="Leaderboard" style={{ color: 'white' }} />
            </Tabs>
            {selectedTab === 0 && (
              <List style={{ marginTop: '10px' }}>
                {tasks.map((task) => (
                  <ListItem
                    button
                    key={task.id}
                    onClick={() => handleTaskClick(task)}
                    style={{
                      backgroundColor: '#1d1d1d',
                      margin: '10px 0',
                      borderRadius: '8px',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
                      transition: 'background-color 0.3s ease',
                      textDecoration: completedTasks.includes(task.id) ? 'line-through' : 'none',
                      color: completedTasks.includes(task.id) ? '#888' : 'inherit'
                    }}
                  >
                    <ListItemText
                      primary={task.task}
                      primaryTypographyProps={{ style: { color: 'white' } }}
                      secondaryTypographyProps={{ style: { color: 'gray' } }}
                    />
                  </ListItem>
                ))}
              </List>
            )}
            {selectedTab === 1 && (
              <Leaderboard gameId={selectedGame.id} />
            )}
          </Box>
        ) : (
          <Box textAlign="center" mt={2}>
            <Typography variant="h4">Hello, {username}</Typography>
            {username === 'Manager' && <TaskManager username={username} />}
            <Typography variant="h5" mt={2}>Games</Typography>
            <List style={{ marginTop: '10px' }}>
              {games.map((game) => (
                <ListItem
                  button
                  key={game.id}
                  onClick={() => handleGameClick(game.id, game.game)}
                  style={{
                    backgroundColor: '#1d1d1d',
                    margin: '10px 0',
                    borderRadius: '8px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
                    transition: 'background-color 0.3s ease',
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#333333'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1d1d1d'}
                >
                  <ListItemText
                    primary={game.game}
                    primaryTypographyProps={{ style: { color: 'white' } }}
                    secondaryTypographyProps={{ style: { color: 'gray' } }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
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
    </ThemeProvider>
  );
};

export default Home;
