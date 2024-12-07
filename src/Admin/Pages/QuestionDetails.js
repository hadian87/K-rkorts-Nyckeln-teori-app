import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Typography,
  Box,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { Edit, Delete, Save, ArrowBack } from "@mui/icons-material";

const QuestionDetails = () => {
  const { state } = useLocation();
  const { question } = state || {};
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [editedQuestion, setEditedQuestion] = useState(question);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newImages, setNewImages] = useState([]);
  const [newExplanationImages, setNewExplanationImages] = useState([]);

  if (!question) {
    return <Typography variant="h5">Ingen frågedetaljer tillgängliga.</Typography>;
  }

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    // Save updated data to database
    const updatedQuestion = {
      ...editedQuestion,
      images: newImages.length > 0 ? newImages : editedQuestion.images,
      explanationImages:
        newExplanationImages.length > 0 ? newExplanationImages : editedQuestion.explanationImages,
    };

    console.log("Saving question:", updatedQuestion);
    // Implement Firebase save logic here

    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setEditedQuestion((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const fileUrls = files.map((file) => URL.createObjectURL(file)); // Replace with Firebase upload logic
    setNewImages(fileUrls);
  };

  const handleExplanationImageChange = (e) => {
    const files = Array.from(e.target.files);
    const fileUrls = files.map((file) => URL.createObjectURL(file)); // Replace with Firebase upload logic
    setNewExplanationImages(fileUrls);
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    // Implement delete logic here
    setDeleteDialogOpen(false);
    navigate("/admin/question-list");
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const handleBackClick = () => {
    navigate("/admin/question-list");
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
      <Typography
        variant="h4"
        gutterBottom
        style={{ color: "#3f51b5", fontWeight: "bold" }}
      >
        Frågedetaljer
      </Typography>

      {/* Question Text */}
      <Box marginBottom="20px">
        <Typography variant="h6" style={{ color: "#333" }}>Fråga:</Typography>
        {isEditing ? (
          <TextField
            fullWidth
            value={editedQuestion.questionText}
            onChange={(e) => handleInputChange("questionText", e.target.value)}
            variant="outlined"
          />
        ) : (
          <Typography variant="body1">{editedQuestion.questionText}</Typography>
        )}
      </Box>

      {/* Options */}
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
              style={{ marginBottom: "10px" }}
            />
          ))
        ) : (
          <ul>
            {editedQuestion.options.map((option, index) => (
              <li key={index}>{option}</li>
            ))}
          </ul>
        )}
      </Box>

      {/* Correct Answer */}
      <Box marginBottom="20px">
        <Typography variant="h6" style={{ color: "#333" }}>Rätt svar:</Typography>
        {isEditing ? (
          <TextField
            fullWidth
            value={editedQuestion.correctAnswer}
            onChange={(e) => handleInputChange("correctAnswer", e.target.value)}
            variant="outlined"
          />
        ) : (
          <Typography variant="body1">{editedQuestion.correctAnswer}</Typography>
        )}
      </Box>

      {/* Question Images */}
      <Box marginBottom="20px">
        <Typography variant="h6" style={{ color: "#333" }}>Bilder:</Typography>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {(newImages.length > 0 ? newImages : editedQuestion.images || []).map(
            (image, index) => (
              <img
                key={index}
                src={image}
                alt={`Bild ${index + 1}`}
                style={{
                  width: "120px",
                  height: "120px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  marginBottom: "10px",
                }}
              />
            )
          )}
        </div>
        {isEditing && <input type="file" accept="image/*" multiple onChange={handleImageChange} />}
      </Box>

      {/* Explanation Images */}
      <Box marginBottom="20px">
        <Typography variant="h6" style={{ color: "#333" }}>Förklaringsbilder:</Typography>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {(newExplanationImages.length > 0
            ? newExplanationImages
            : editedQuestion.explanationImages || []).map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Förklaringsbild ${index + 1}`}
              style={{
                width: "120px",
                height: "120px",
                objectFit: "cover",
                borderRadius: "8px",
                marginBottom: "10px",
              }}
            />
          ))}
        </div>
        {isEditing && <input type="file" accept="image/*" multiple onChange={handleExplanationImageChange} />}
      </Box>

      <Box display="flex" gap="10px">
        <Button
          variant="contained"
          color="primary"
          onClick={handleBackClick}
          startIcon={<ArrowBack />}
        >
          Tillbaka
        </Button>
        {isEditing ? (
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveClick}
            startIcon={<Save />}
          >
            Spara
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={handleEditClick}
            startIcon={<Edit />}
          >
            Redigera
          </Button>
        )}
        <Button
          variant="contained"
          color="error"
          onClick={handleDeleteClick}
          startIcon={<Delete />}
        >
          Ta bort
        </Button>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Bekräftelse på borttagning</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Är du säker på att du vill ta bort denna fråga?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Avbryt</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Ta bort
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default QuestionDetails;