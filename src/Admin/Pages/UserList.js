import React, { useState, useEffect } from "react";

import { db } from "../../firebaseConfig";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Box, Avatar } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { styled } from "@mui/material/styles";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.primary.dark,
  color: theme.palette.common.white,
  fontWeight: "bold",
}));

function UserList() {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsers(usersList);
    } catch (error) {
      console.error("Error fetching users: ", error);
    }
  };

  const handleDeleteUser = async (userId) => {
    const confirmDelete = window.confirm("Är du säker på att du vill ta bort denna användare?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "users", userId));
      alert("Användaren har raderats framgångsrikt!");
      fetchUsers();
    } catch (error) {
      alert("Misslyckades med att radera användare: " + error.message);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("sv-SE"); // Format the date to Swedish format (e.g., "yyyy-MM-dd")
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <Box sx={{ width: "100%", padding: 4, backgroundColor: "#f7f8fa" }}>
      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3, color: "#333" }} align="center">
        Användarhantering
      </Typography>
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>Avatar</StyledTableCell>
              <StyledTableCell>Förnamn</StyledTableCell>
              <StyledTableCell>Efternamn</StyledTableCell>
              <StyledTableCell>E-post</StyledTableCell>
              <StyledTableCell>Telefonnummer</StyledTableCell>
              <StyledTableCell>Personnummer</StyledTableCell>
              <StyledTableCell>Roll</StyledTableCell>
              <StyledTableCell>Registreringsdatum</StyledTableCell> {/* New Column for Date */}
              <StyledTableCell>Åtgärder</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} sx={{ "&:nth-of-type(odd)": { backgroundColor: "#f1f1f1" } }}>
                <TableCell>
                  <Avatar sx={{ bgcolor: "#2196f3", color: "#fff" }}>{user.firstName.charAt(0)}</Avatar>
                </TableCell>
                <TableCell>{user.firstName}</TableCell>
                <TableCell>{user.lastName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phoneNumber}</TableCell>
                <TableCell>{user.idNumber}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{formatDate(user.createdAt)}</TableCell> {/* Display the formatted date */}
                <TableCell>
                  <IconButton color="error" onClick={() => handleDeleteUser(user.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default UserList;
