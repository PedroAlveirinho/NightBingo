// src/Leaderboard.js
import React, { useEffect, useState } from 'react';
import { Typography, List, ListItem, ListItemText, Collapse, Container, Paper } from '@mui/material';
import { doc, getDoc, getDocs, collection } from 'firebase/firestore';
import { firestore } from './firebaseConfig';

const Leaderboard = ({ gameId }) => {
  const [participants, setParticipants] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [expandedUser, setExpandedUser] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      const querySnapshot = await getDocs(collection(firestore, 'Tasks'));
      const tasksList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTasks(tasksList);
    };

    fetchTasks();
  }, []);

  useEffect(() => {
    const fetchParticipants = async () => {
      if (gameId) {
        const gameDocRef = doc(firestore, 'Games', gameId);
        const gameDoc = await getDoc(gameDocRef);
        const gameData = gameDoc.data();

        if (gameData && gameData.participants) {
          const participantsWithTasks = gameData.participants.map(participant => ({
            username: participant,
            completedTasks: gameData.completedTasks && gameData.completedTasks[participant] ? gameData.completedTasks[participant] : []
          }));

          participantsWithTasks.sort((a, b) => b.completedTasks.length - a.completedTasks.length);

          setParticipants(participantsWithTasks);
        }
      }
    };

    fetchParticipants();
  }, [gameId]);

  const handleUserClick = (username) => {
    setExpandedUser(expandedUser === username ? null : username);
  };

  const getTaskNameById = (taskId) => {
    const task = tasks.find(task => task.id === taskId);
    return task ? task.task : 'Unknown Task';
  };

  return (
    <Container component={Paper} style={{ padding: '20px', backgroundColor: '#1d1d1d', color: '#ffffff', marginTop: '20px' }}>
      <Typography variant="h6" style={{ marginTop: '20px', textAlign: 'center' }}>
        Leaderboard
      </Typography>
      <List style={{ marginTop: '10px' }}>
        {participants.map((participant, index) => (
          <div key={index}>
            <ListItem button onClick={() => handleUserClick(participant.username)}>
              <ListItemText primary={participant.username} />
              <Typography variant="body2">{participant.completedTasks.length}</Typography>
            </ListItem>
            <Collapse in={expandedUser === participant.username} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {participant.completedTasks.map((taskId, idx) => (
                  <ListItem key={idx} style={{ paddingLeft: '30px' }}>
                    <ListItemText primary={getTaskNameById(taskId)} />
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </div>
        ))}
      </List>
    </Container>
  );
};

export default Leaderboard;
