import React, { useState } from 'react';
import axios from 'axios';
import { db } from '../../firebaseConfig';
import { setDoc, doc } from 'firebase/firestore';
import {
  Box,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Grid,
  Snackbar,
  Alert,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
// إزالة استيراد UploadFileIcon لأنها غير مستخدمة
// import UploadFileIcon from '@mui/icons-material/UploadFile';

function CreateUser() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('student');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [personNumber, setPersonNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // دالة لتوليد كلمة مرور عشوائية
  const generatePassword = () => {
    return Math.random().toString(36).slice(-8);
  };

  const handleAddUser = async () => {
    if (!firstName || !lastName || !email || !phoneNumber || !personNumber) {
      setSnackbar({ open: true, message: 'Vänligen fyll i alla fält.', severity: 'warning' });
      return;
    }

    // إزالة التحقق من صحة رقم الهاتف

    // التحقق من رقم الهوية (يجب أن يتكون من 12 خانة)
    if (personNumber.length !== 12) {
      setSnackbar({ open: true, message: 'Personnummer måste bestå av exakt 12 siffror.', severity: 'warning' });
      return;
    }

    try {
      setLoading(true);
      // توليد كلمة مرور عشوائية
      const password = generatePassword();

      // إعداد بيانات المستخدم الجديد
      const newUser = {
        email: email,
        password: password,
        returnSecureToken: true,
      };

      // استخدام REST API لإنشاء المستخدم الجديد
      const apiKey = 'AIzaSyAq9O-RUuA1aVEjx6P_sP-lroYv8ClxRSM';
      const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`;

      const response = await axios.post(url, newUser);
      const userId = response.data.localId;

      // حفظ بيانات المستخدم في Firestore
      await setDoc(doc(db, 'users', userId), {
        uid: userId,
        firstName,
        lastName,
        email,
        role,
        phoneNumber,
        personNumber,
        password,
        createdAt: new Date().toISOString(),
      });

      setSnackbar({ open: true, message: `Användarkonto har skapats framgångsrikt!\nLösenord: ${password}`, severity: 'success' });

      // إعادة تعيين الحقول
      setFirstName('');
      setLastName('');
      setEmail('');
      setRole('student');
      setPhoneNumber('');
      setPersonNumber('');
    } catch (error) {
      if (error.response) {
        // تفاصيل الخطأ من الاستجابة
        setSnackbar({ open: true, message: `Misslyckades med att skapa användare: ${error.response.data.error.message}`, severity: 'error' });
      } else if (error.request) {
        // لم يتم استلام استجابة
        setSnackbar({ open: true, message: 'Misslyckades med att skapa användare: Inget svar från servern', severity: 'error' });
      } else {
        // خطأ في إعداد الطلب
        setSnackbar({ open: true, message: `Misslyckades med att skapa användare: ${error.message}`, severity: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  // دالة لإغلاق Snackbar
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  // إنشاء ثيم مخصص
  const theme = createTheme({
    palette: {
      primary: {
        main: '#1976d2', // أزرق
      },
      secondary: {
        main: '#dc004e', // وردي
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ width: '100%', padding: 4, maxWidth: 800, margin: 'auto', backgroundColor: '#f7f8fa', minHeight: '100vh' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4, color: 'primary.main' }} align="center">
          Skapa Användarkonto
        </Typography>
        <Paper elevation={3} sx={{ padding: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Förnamn"
                variant="outlined"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Efternamn"
                variant="outlined"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                type="email"
                label="E-postadress"
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Telefonnummer"
                variant="outlined"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Exempel: 0701234567"
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Personnummer (12 siffror)"
                variant="outlined"
                value={personNumber}
                onChange={(e) => setPersonNumber(e.target.value)}
                placeholder="ååååmmddxxxx"
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl variant="outlined" fullWidth>
                <InputLabel id="role-label">Roll</InputLabel>
                <Select
                  labelId="role-label"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  label="Roll"
                >
                  <MenuItem value="student">Student</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddUser}
                fullWidth
                disabled={loading}
                size="large"
              >
                {loading ? 'Skapar...' : 'Skapa Användarkonto'}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Snackbar للإشعارات */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

export default CreateUser;
