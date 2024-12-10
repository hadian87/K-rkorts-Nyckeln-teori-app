import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, Button, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebaseConfig';
import { collection, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import LogoutIcon from '@mui/icons-material/Logout';
import PeopleIcon from '@mui/icons-material/People';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SchoolIcon from '@mui/icons-material/School';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import AssignmentIcon from '@mui/icons-material/Assignment';

const Dashboard = () => {
  const navigate = useNavigate();
  const [userCount, setUserCount] = useState(0);
  const [adminCount, setAdminCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [testCount, setTestCount] = useState(0);

  // Funktion för att hämta räknare från Firestore
  const fetchCounts = async () => {
    try {
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
    } catch (error) {
      console.error('Fel vid hämtning av räknare: ', error);
    }
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
      console.error('Fel vid utloggning:', error);
    }
  };

  // Definiera en array med dashboard-kort för enkelhet och återanvändbarhet
  const dashboardCards = [
    {
      title: 'Totalt antal användare',
      count: userCount,
      icon: <PeopleIcon fontSize="large" />,
      color: '#1e88e5',
    },
    {
      title: 'Totalt antal administratörer',
      count: adminCount,
      icon: <AdminPanelSettingsIcon fontSize="large" />,
      color: '#43a047',
    },
    {
      title: 'Totalt antal studenter',
      count: studentCount,
      icon: <SchoolIcon fontSize="large" />,
      color: '#ef5350',
    },
    {
      title: 'Totalt antal frågor',
      count: questionCount,
      icon: <QuestionAnswerIcon fontSize="large" />,
      color: '#ffa726',
    },
    {
      title: 'Totalt antal tester',
      count: testCount,
      icon: <AssignmentIcon fontSize="large" />,
      color: '#ab47bc',
    },
  ];

  return (
    <Box sx={{ p: 4, backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header med titel och utloggningsknapp */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
          Instrumentbräda
        </Typography>
        <Tooltip title="Logga ut">
          <Button
            variant="contained"
            color="secondary"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{ fontWeight: 'bold' }}
          >
            Logga ut
          </Button>
        </Tooltip>
      </Box>

      {/* Grid med dashboard-kort */}
      <Grid container spacing={4}>
        {dashboardCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                display: 'flex',
                alignItems: 'center',
                p: 2,
                background: `linear-gradient(135deg, ${card.color} 30%, ${shadeColor(card.color, -10)} 90%)`,
                color: '#fff',
                boxShadow: 3,
                borderRadius: 2,
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: 6,
                },
              }}
            >
              <Box sx={{ mr: 2 }}>
                {card.icon}
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: '500' }}>
                  {card.title}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {card.count}
                </Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

// Funktion för att mörkna en färg
function shadeColor(color, percent) {
  let R = parseInt(color.substring(1, 3), 16);
  let G = parseInt(color.substring(3, 5), 16);
  let B = parseInt(color.substring(5, 7), 16);

  R = parseInt(R * (100 + percent) / 100);
  G = parseInt(G * (100 + percent) / 100);
  B = parseInt(B * (100 + percent) / 100);

  R = (R < 255) ? R : 255;
  G = (G < 255) ? G : 255;
  B = (B < 255) ? B : 255;

  const RR = ((R.toString(16).length === 1) ? '0' + R.toString(16) : R.toString(16));
  const GG = ((G.toString(16).length === 1) ? '0' + G.toString(16) : G.toString(16));
  const BB = ((B.toString(16).length === 1) ? '0' + B.toString(16) : B.toString(16));

  return '#' + RR + GG + BB;
}

export default Dashboard;
