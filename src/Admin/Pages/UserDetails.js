import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../firebaseConfig';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import axios from 'axios';
import {
  Typography,
  Box,
  TextField,
  Button,
  Avatar,
  IconButton,
  CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

function UserDetails() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    personNumber: '', // تم تغيير idNumber إلى personNumber
    password: '',
    createdAt: '',
    language: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // جلب تفاصيل المستخدم من قاعدة البيانات
  const fetchUserDetails = useCallback(async () => {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUser(docSnap.data());
      } else {
        console.log('Ingen sådan dokument!');
      }
    } catch (error) {
      console.error('Fel vid hämtning av användardetaljer: ', error);
    }
  }, [userId]);

  // استخدام useEffect لجلب البيانات عند تحميل الصفحة
  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  // حفظ التعديلات (تجاهل كلمة المرور)
  const handleSave = async () => {
    try {
      if (!user.firstName || !user.lastName || !user.email || !user.phoneNumber || !user.personNumber) {
        alert('Var god fyll i alla obligatoriska fält.');
        return;
      }

      if (!user.language) {
        user.language = 'default';
      }

      const docRef = doc(db, 'users', userId);

      await updateDoc(docRef, {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        personNumber: user.personNumber, // تم تغيير idNumber إلى personNumber
        language: user.language,
      });

      alert('Användardetaljer har sparats framgångsrikt!');
      setIsEditing(false);
    } catch (error) {
      alert('Misslyckades med att spara användardetaljer: ' + error.message);
    }
  };

  // حذف المستخدم
  const handleDelete = async () => {
    const confirmDelete = window.confirm('Är du säker på att du vill ta bort denna användare?');
    if (confirmDelete) {
      setLoading(true);
      try {
        await deleteDoc(doc(db, 'users', userId));
        alert('Användaren har raderats från databasen.');

        try {
          await axios.post('https://us-central1-korkortsnyckeln-teoriapp.cloudfunctions.net/deleteUser', { uid: userId });
          alert('Användaren har raderats från Firebase Authentication.');

          // التنقل إلى قائمة المستخدمين بعد الحذف
          navigate('/admin/user-list');
        } catch (authError) {
          alert('Ett fel inträffade vid radering av användaren från Firebase Authentication: ' + authError.message);

          // التنقل على أي حال إلى قائمة المستخدمين
          navigate('/admin/user-list');
        }
      } catch (dbError) {
        alert('Ett fel inträffade vid radering av användaren från databasen: ' + dbError.message);
      } finally {
        setLoading(false);
      }
    }
  };

  if (!user) return <Typography>Laddar...</Typography>;

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
        Användardetaljer
      </Typography>
      <Avatar sx={{ bgcolor: '#2196f3', color: '#fff', width: 100, height: 100, mb: 2 }}>
        {user.firstName ? user.firstName.charAt(0) : 'A'}
      </Avatar>
      <TextField
        label="Förnamn"
        value={user.firstName}
        onChange={(e) => setUser({ ...user, firstName: e.target.value })}
        fullWidth
        sx={{ mb: 2 }}
        disabled={!isEditing}
      />
      <TextField
        label="Efternamn"
        value={user.lastName}
        onChange={(e) => setUser({ ...user, lastName: e.target.value })}
        fullWidth
        sx={{ mb: 2 }}
        disabled={!isEditing}
      />
      <TextField
        label="E-post"
        value={user.email}
        fullWidth
        sx={{ mb: 2, backgroundColor: !isEditing ? '#f0f0f0' : 'white' }}
        disabled
      />
      <TextField
        label="Telefonnummer"
        value={user.phoneNumber}
        onChange={(e) => setUser({ ...user, phoneNumber: e.target.value })}
        fullWidth
        sx={{ mb: 2 }}
        inputProps={{ maxLength: 9 }}
        disabled={!isEditing}
      />
      <TextField
        label="Personnummer"
        value={user.personNumber}
        onChange={(e) => setUser({ ...user, personNumber: e.target.value })}
        fullWidth
        sx={{ mb: 2 }}
        inputProps={{ maxLength: 12 }}
        disabled={!isEditing}
      />
      <TextField
        label="Lösenord"
        value={user.password || ''}
        type="text"
        fullWidth
        sx={{ mb: 2, backgroundColor: '#f0f0f0' }}
        disabled
      />
      <TextField
        label="Registreringsdatum"
        value={user.createdAt ? new Date(user.createdAt).toLocaleDateString('sv-SE') : ''}
        fullWidth
        sx={{ mb: 2 }}
        disabled
      />
      {!isEditing ? (
        <Button variant="contained" color="primary" onClick={() => setIsEditing(true)} sx={{ mt: 2, mr: 2 }}>
          Redigera
        </Button>
      ) : (
        <>
          <Button variant="contained" color="primary" onClick={handleSave} sx={{ mt: 2, mr: 2 }}>
            Spara Ändringar
          </Button>
          <Button variant="outlined" color="secondary" onClick={() => setIsEditing(false)} sx={{ mt: 2, mr: 2 }}>
            Avbryt
          </Button>
        </>
      )}
      <IconButton color="error" onClick={handleDelete} sx={{ mt: 2 }} disabled={loading}>
        {loading ? <CircularProgress size={24} /> : <DeleteIcon />}
      </IconButton>
    </Box>
  );
}

export default UserDetails;
