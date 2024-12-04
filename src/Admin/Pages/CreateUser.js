// CreateUser.js

import React, { useState } from "react";
import { auth, db } from "../../firebaseConfig";
import { createUserWithEmailAndPassword, fetchSignInMethodsForEmail } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Grid from "@mui/material/Grid";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import BadgeIcon from "@mui/icons-material/Badge";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";

function CreateUser() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [role, setRole] = useState("student");

  // Dator för att generera ett slumpmässigt lösenord
  const generatePassword = () => Math.random().toString(36).slice(-8);

  const handleAddUser = async () => {
    if (!firstName || !lastName || !email || !phoneNumber || !idNumber) {
      alert("Vänligen fyll i alla fält.");
      return;
    }

    if (idNumber.length !== 12) {
      alert("ID-nummer måste vara 12 siffror.");
      return;
    }

    if (!/^\d{9}$/.test(phoneNumber)) {
      alert("Telefonnummer måste vara 9 siffror utan ledande nolla och med landskod +46.");
      return;
    }

    try {
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      if (signInMethods.length > 0) {
        alert("Den här e-postadressen används redan. Vänligen använd en annan e-postadress.");
        return;
      }

      // Generera ett slumpmässigt lösenord för användaren
      const password = generatePassword();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Spara användardata i Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        firstName,
        lastName,
        email: user.email,
        phoneNumber: `+46${phoneNumber}`,
        idNumber,
        role,
        password, // Lagra lösenordet
        createdAt: new Date().toISOString(),
      });

      // Visa lösenordet för användaren
      alert(`Användarkonto har skapats framgångsrikt!\nLösenord: ${password}`);
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhoneNumber("");
      setIdNumber("");
      setRole("student");
    } catch (error) {
      alert("Misslyckades med att lägga till användare: " + error.message);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 5, width: "90%" }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
        Lägg till användare
      </Typography>
      <Grid container spacing={2} sx={{ maxWidth: 800 }}>
        <Grid item xs={12}>
          <TextField
            label="Förnamn"
            variant="outlined"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            fullWidth
            InputProps={{ startAdornment: <PersonIcon sx={{ marginRight: 1 }} />, sx: { height: 40 } }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Efternamn"
            variant="outlined"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            fullWidth
            InputProps={{ startAdornment: <PersonIcon sx={{ marginRight: 1 }} />, sx: { height: 40 } }}
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
            InputProps={{ startAdornment: <EmailIcon sx={{ marginRight: 1 }} />, sx: { height: 40 } }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            type="tel"
            label="Telefonnummer (9 siffror utan ledande nolla)"
            variant="outlined"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            fullWidth
            inputProps={{ maxLength: 9 }}
            InputProps={{
              startAdornment: (
                <>
                  <Typography sx={{ marginRight: 1 }}>+46</Typography>
                  <PhoneIcon sx={{ marginRight: 1 }} />
                </>
              ),
              sx: { height: 40 },
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="ID-nummer (12 siffror)"
            variant="outlined"
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
            fullWidth
            inputProps={{ maxLength: 12 }}
            InputProps={{ startAdornment: <BadgeIcon sx={{ marginRight: 1 }} />, sx: { height: 40 } }}
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
              startAdornment={<AssignmentIndIcon sx={{ marginRight: 1 }} />}
              sx={{ height: 40 }}
            >
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="manager">Manager</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Button variant="contained" onClick={handleAddUser} fullWidth sx={{ height: 40 }}>
            Skapa användarkonto
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}

export default CreateUser;
