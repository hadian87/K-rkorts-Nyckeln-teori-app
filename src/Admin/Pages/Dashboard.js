import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebaseConfig';
import { collection, getDocs, onSnapshot, query, where } from 'firebase/firestore';

const Dashboard = () => {
  const navigate = useNavigate();
  const [userCount, setUserCount] = useState(0);
  const [adminCount, setAdminCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [testCount, setTestCount] = useState(0);

  // Funktion för att hämta räknare från Firestore
  const fetchCounts = async () => {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    setUserCount(usersSnapshot.size);

    const adminsQuery = query(collection(db, 'users'), where('role', '==', 'admin'));
    const adminsSnapshot = await getDocs(adminsQuery);
    setAdminCount(adminsSnapshot.size);

    const studentsQuery = query(collection(db, 'users'), where('role', '==', 'student'));
    const studentsSnapshot = await getDocs(studentsQuery);
    setStudentCount(studentsSnapshot.size);

    const questionsSnapshot = await getDocs(collection(db, 'questions'));
    setQuestionCount(questionsSnapshot.size);

    const testsSnapshot = await getDocs(collection(db, 'tests'));
    setTestCount(testsSnapshot.size);
  };

  useEffect(() => {
    fetchCounts();
    const unsubscribeUsers = onSnapshot(collection(db, 'users'), fetchCounts);
    const unsubscribeQuestions = onSnapshot(collection(db, 'questions'), snapshot => {
      setQuestionCount(snapshot.size);
    });
    const unsubscribeTests = onSnapshot(collection(db, 'tests'), snapshot => {
      setTestCount(snapshot.size);
    });

    return () => {
      unsubscribeUsers();
      unsubscribeQuestions();
      unsubscribeTests();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ color: '#1976d2', fontWeight: 'bold' }}>Instrumentbräda</Typography>
        <Button variant="contained" color="secondary" onClick={handleLogout} sx={{ fontWeight: 'bold' }}>
          Logga ut
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{
            p: 3,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #1e88e5 30%, #42a5f5)',
            color: '#fff',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            borderRadius: 2
          }}>
            <Typography variant="h6" sx={{ fontWeight: '500' }}>Totalt antal användare</Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold' }}>{userCount}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{
            p: 3,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #43a047 30%, #66bb6a)',
            color: '#fff',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            borderRadius: 2
          }}>
            <Typography variant="h6" sx={{ fontWeight: '500' }}>Totalt antal administratörer</Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold' }}>{adminCount}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{
            p: 3,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #ef5350 30%, #e57373)',
            color: '#fff',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            borderRadius: 2
          }}>
            <Typography variant="h6" sx={{ fontWeight: '500' }}>Totalt antal studenter</Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold' }}>{studentCount}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{
            p: 3,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #ffa726 30%, #ffb74d)',
            color: '#fff',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            borderRadius: 2
          }}>
            <Typography variant="h6" sx={{ fontWeight: '500' }}>Totalt antal frågor</Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold' }}>{questionCount}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{
            p: 3,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #ab47bc 30%, #ba68c8)',
            color: '#fff',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            borderRadius: 2
          }}>
            <Typography variant="h6" sx={{ fontWeight: '500' }}>Totalt antal tester</Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold' }}>{testCount}</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
