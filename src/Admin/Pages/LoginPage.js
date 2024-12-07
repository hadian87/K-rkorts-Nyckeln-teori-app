import React, { useState } from 'react';
import { auth, db } from '../../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, Paper, Avatar } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (userData.role === 'student') {
          navigate('/student/övningstest');
        } else {
          setError('Okänd användarroll. Kontrollera att rollfältet är korrekt inställt i databasen.');
        }
      } else {
        setError('Inget användardokument hittades i databasen.');
      }
    } catch (error) {
      setError('Inloggningsfel. Kontrollera din e-postadress och lösenord.');
      console.error('Fel vid inloggning:', error);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: '#f4f6f8',
        padding: 2,
      }}
    >
      <Paper
        elevation={10}
        sx={{
          padding: 4,
          maxWidth: 400,
          borderRadius: 4,
          textAlign: 'center',
          bgcolor: '#1976d2',
          color: '#fff',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
          width: '100%', // يضمن ملاءمة الشاشة الصغيرة
        }}
      >
        <Avatar sx={{ m: '0 auto', bgcolor: '#ffffff', color: '#1976d2', width: 56, height: 56 }}>
          <LockOutlinedIcon fontSize="large" />
        </Avatar>
        <Typography component="h1" variant="h5" sx={{ fontWeight: 'bold', mt: 2 }}>
          Körkorts Nyckeln Teori Portal
        </Typography>
        <Typography component="h2" variant="h6" sx={{ fontWeight: 'bold', mt: 1, fontSize: '1rem' }}>
          Logga in
        </Typography>
        <Box component="form" onSubmit={handleLogin} sx={{ mt: 3 }}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="E-postadress"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputLabelProps={{
              style: { color: '#fff' },
            }}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: 1,
              input: { color: '#fff' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#ffffff',
                },
                '&:hover fieldset': {
                  borderColor: '#ffeb3b',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#ffeb3b',
                },
              },
            }}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Lösenord"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputLabelProps={{
              style: { color: '#fff' },
            }}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: 1,
              input: { color: '#fff' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#ffffff',
                },
                '&:hover fieldset': {
                  borderColor: '#ffeb3b',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#ffeb3b',
                },
              },
            }}
          />
          {error && (
            <Typography color="error" variant="body2" sx={{ fontSize: '0.8rem', mt: 1 }}>
              {error}
            </Typography>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 3,
              mb: 2,
              padding: 1,
              fontSize: '1rem',
              bgcolor: '#ffeb3b',
              color: '#1976d2',
              '&:hover': {
                bgcolor: '#ffd600',
              },
            }}
          >
            Logga in
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
