import React, { useState } from 'react';
import axios from 'axios';
import { db } from '../../firebaseConfig';
import { setDoc, doc } from 'firebase/firestore';
import { Box, TextField, Button, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

function CreateUser() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('student');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [personNumber, setPersonNumber] = useState('');

  // دالة لتوليد كلمة مرور عشوائية
  const generatePassword = () => {
    return Math.random().toString(36).slice(-8);
  };

  const handleAddUser = async () => {
    if (!firstName || !lastName || !email || !phoneNumber || !personNumber) {
      alert('Vänligen fyll i alla fält.');
      return;
    }

    // التحقق من رقم الهاتف (يجب أن يتكون من 9 خانات ويبدأ بالرقم 7)
    const phoneRegex = /^7\d{8}$/;
    if (!phoneRegex.test(phoneNumber)) {
      alert('Telefonnummer måste bestå av 9 siffror och börja med 7.');
      return;
    }

    // التحقق من رقم الهوية (يجب أن يتكون من 12 خانة)
    if (personNumber.length !== 12) {
      alert('Personnummer måste bestå av exakt 12 siffror.');
      return;
    }

    try {
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

      alert(`Användarkonto har skapats framgångsrikt!\nLösenord: ${password}`);

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
        alert(`Misslyckades med att skapa användare: ${error.response.data.error.message}`);
      } else if (error.request) {
        // لم يتم استلام استجابة
        alert('Misslyckades med att skapa användare: Inget svar från servern');
      } else {
        // خطأ في إعداد الطلب
        alert(`Misslyckades med att skapa användare: ${error.message}`);
      }
    }
  };

  return (
    <Box sx={{ width: '100%', padding: 4, maxWidth: 600, margin: 'auto', backgroundColor: '#f7f8fa' }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3, color: '#333' }} align="center">
        Skapa Användarkonto
      </Typography>
      <TextField
        label="Förnamn"
        variant="outlined"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
        required
      />
      <TextField
        label="Efternamn"
        variant="outlined"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
        required
      />
      <TextField
        type="email"
        label="E-postadress"
        variant="outlined"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
        required
      />
      <TextField
        label="Telefonnummer (9 siffror, börjar med 7)"
        variant="outlined"
        value={phoneNumber}
        onChange={(e) => {
          const value = e.target.value;
          if (value.length <= 9) setPhoneNumber(value);
        }}
        placeholder="712345678"
        fullWidth
        sx={{ mb: 2 }}
        required
      />
      <TextField
        label="Personnummer (12 siffror)"
        variant="outlined"
        value={personNumber}
        onChange={(e) => {
          const value = e.target.value;
          if (value.length <= 12) setPersonNumber(value);
        }}
        placeholder="ååååmmddxxxx"
        fullWidth
        sx={{ mb: 2 }}
        required
      />
      <FormControl fullWidth sx={{ mb: 2 }}>
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
      <Button variant="contained" color="primary" onClick={handleAddUser} fullWidth>
        Skapa Användarkonto
      </Button>
    </Box>
  );
}

export default CreateUser;
