import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Typography, Box, Paper, Button, TextField, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { Edit, Delete, Save, ArrowBack } from "@mui/icons-material";

const QuestionDetails = () => {
  const { state } = useLocation();
  const { question } = state || {};
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [editedQuestion, setEditedQuestion] = useState(question);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  if (!question) {
    return <Typography variant="h5">Ingen frågedetaljer tillgängliga.</Typography>;
  }

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    // Placeholder logic to save the edited question (you would update Firebase here)
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setEditedQuestion((prev) => ({ ...prev, [field]: value }));
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    // Placeholder logic to delete the question (you would delete it from Firebase here)
    setDeleteDialogOpen(false);
    navigate("/admin/question-list"); // Navigate back to the question list after deletion
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const handleBackClick = () => {
    navigate("/admin/question-list"); // Navigate back to the question list
  };

  return (
    <Paper
      style={{
        padding: "40px",
        margin: "20px",
        backgroundColor: "#f9f9f9",
        borderRadius: "10px",
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Typography variant="h4" gutterBottom style={{ color: "#3f51b5", fontWeight: "bold" }}>
        Frågedetaljer
      </Typography>

      <Box marginBottom="20px">
        <Typography variant="h6" style={{ color: "#333" }}>Fråga:</Typography>
        {isEditing ? (
          <TextField
            fullWidth
            value={editedQuestion.questionText}
            onChange={(e) => handleInputChange("questionText", e.target.value)}
            variant="outlined"
            style={{ backgroundColor: "#fff" }}
          />
        ) : (
          <Typography variant="body1" style={{ padding: "10px 0", fontSize: "1.1rem" }}>{editedQuestion.questionText}</Typography>
        )}
      </Box>

      <Box marginBottom="20px">
        <Typography variant="h6" style={{ color: "#333" }}>Alternativ:</Typography>
        {isEditing ? (
          editedQuestion.options.map((option, index) => (
            <TextField
              key={index}
              fullWidth
              value={option}
              onChange={(e) => {
                const updatedOptions = [...editedQuestion.options];
                updatedOptions[index] = e.target.value;
                handleInputChange("options", updatedOptions);
              }}
              variant="outlined"
              style={{ marginBottom: "10px", backgroundColor: "#fff" }}
            />
          ))
        ) : (
          <ul style={{ paddingLeft: "20px" }}>
            {editedQuestion.options.map((option, index) => (
              <li key={index} style={{ marginBottom: "5px" }}>
                <Typography variant="body1" style={{ fontSize: "1rem" }}>{option}</Typography>
              </li>
            ))}
          </ul>
        )}
      </Box>

      <Box marginBottom="20px">
        <Typography variant="h6" style={{ color: "#333" }}>Rätt svar:</Typography>
        {isEditing ? (
          <TextField
            fullWidth
            value={editedQuestion.correctAnswer}
            onChange={(e) => handleInputChange("correctAnswer", e.target.value)}
            variant="outlined"
            style={{ backgroundColor: "#fff" }}
          />
        ) : (
          <Typography variant="body1" style={{ padding: "10px 0", fontSize: "1.1rem" }}>{editedQuestion.correctAnswer}</Typography>
        )}
      </Box>

      {editedQuestion.images && (
        <Box marginBottom="20px">
          <Typography variant="h6" style={{ color: "#333" }}>Bilder:</Typography>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {editedQuestion.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Question Image ${index}`}
                style={{ width: "120px", height: "120px", objectFit: "cover", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)" }}
              />
            ))}
          </div>
        </Box>
      )}

      {editedQuestion.explanationImages && (
        <Box marginBottom="20px">
          <Typography variant="h6" style={{ color: "#333" }}>Förklaringsbilder:</Typography>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {editedQuestion.explanationImages.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Explanation Image ${index}`}
                style={{ width: "120px", height: "120px", objectFit: "cover", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)" }}
              />
            ))}
          </div>
        </Box>
      )}

      <Box display="flex" gap="10px">
        <Button
          variant="contained"
          color="primary"
          onClick={handleBackClick}
          startIcon={<ArrowBack />}
          style={{ backgroundColor: "#1976d2" }}
        >
          Tillbaka
        </Button>

        {isEditing ? (
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveClick}
            startIcon={<Save />}
            style={{ backgroundColor: "#4caf50" }}
          >
            Spara
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={handleEditClick}
            startIcon={<Edit />}
            style={{ backgroundColor: "#1976d2" }}
          >
            Redigera
          </Button>
        )}

        <Button
          variant="contained"
          color="error"
          onClick={handleDeleteClick}
          startIcon={<Delete />}
          style={{ backgroundColor: "#f44336" }}
        >
          Ta bort
        </Button>
      </Box>

      {/* Ta bort bekräftelsedialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Bekräftelse på borttagning</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Är du säker på att du vill ta bort denna fråga?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Avbryt
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Ta bort
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default QuestionDetails;
