import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  MenuItem,
  IconButton,
  Typography,
} from "@mui/material";
import { Add, Remove, Close } from "@mui/icons-material";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebaseConfig";

const QuestionManager = () => {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({
    mainSection: "",
    subSection: "",
    category: "",
    questionText: "",
    options: [""],
    correctAnswer: "",
    images: [],  // This holds the images for the question
    explanation: "",
    explanationImages: [], // This holds the images for the explanation
  });
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchMainCategories();
    fetchCategories();
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    const questionsCollection = collection(db, "questions");
    const questionsSnapshot = await getDocs(questionsCollection);
    const questionsList = questionsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setQuestions(questionsList);
  };

  const fetchMainCategories = async () => {
    const mainCatCollection = collection(db, "mainCategories");
    const mainCatSnapshot = await getDocs(mainCatCollection);
    const mainCatList = mainCatSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setMainCategories(mainCatList);
  };

  const fetchSubCategories = async (mainCategoryId) => {
    const subCatCollection = collection(db, "subCategories");
    const subCatQuery = query(subCatCollection, where("mainCategory", "==", mainCategoryId));
    const subCatSnapshot = await getDocs(subCatQuery);
    const subCatList = subCatSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setSubCategories(subCatList);
  };

  const fetchCategories = async () => {
    const categoriesCollection = collection(db, "categories");
    const categoriesSnapshot = await getDocs(categoriesCollection);
    const categoriesList = categoriesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setCategories(categoriesList);
  };

  const handleMainCategoryChange = (e) => {
    const selectedMainCategory = e.target.value;
    setNewQuestion({ ...newQuestion, mainSection: selectedMainCategory, subSection: "" });
    fetchSubCategories(selectedMainCategory);
  };

  const handleSubCategoryChange = (e) => {
    const selectedSubCategory = e.target.value;
    setNewQuestion({ ...newQuestion, subSection: selectedSubCategory, category: "" });
    fetchCategoriesForSubCategory(selectedSubCategory);
  };

  const fetchCategoriesForSubCategory = async (subCategoryId) => {
    const categoryQuery = query(collection(db, "categories"), where("subCategory", "==", subCategoryId));
    const categorySnapshot = await getDocs(categoryQuery);
    const categoryList = categorySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setCategories(categoryList);
  };

  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    setNewQuestion({ ...newQuestion, category: selectedCategory });
  };

  // Image upload handlers
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const newImages = files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setNewQuestion({
      ...newQuestion,
      images: [...newQuestion.images, ...newImages],
    });
  };

  const handleRemoveImage = (index) => {
    const updatedImages = [...newQuestion.images];
    updatedImages.splice(index, 1);
    setNewQuestion({ ...newQuestion, images: updatedImages });
  };

  const handleExplanationImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const newExplanationImages = files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setNewQuestion({ ...newQuestion, explanationImages: [...newQuestion.explanationImages, ...newExplanationImages] });
  };

  const handleRemoveExplanationImage = (index) => {
    const updatedExplanationImages = [...newQuestion.explanationImages];
    updatedExplanationImages.splice(index, 1);
    setNewQuestion({ ...newQuestion, explanationImages: updatedExplanationImages });
  };

  const handleAddOption = () => {
    setNewQuestion({ ...newQuestion, options: [...newQuestion.options, ""] });
  };

  const handleRemoveOption = () => {
    if (newQuestion.options.length > 1) {
      setNewQuestion({ ...newQuestion, options: newQuestion.options.slice(0, -1) });
    }
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...newQuestion.options];
    updatedOptions[index] = value;
    setNewQuestion({ ...newQuestion, options: updatedOptions });
  };

  const uploadImagesToStorage = async (images) => {
    const urls = await Promise.all(images.map(async (image) => {
      const storageRef = ref(storage, `images/${image.file.name}`);
      await uploadBytes(storageRef, image.file);
      return await getDownloadURL(storageRef);
    }));
    return urls;
  };

  const handleAddQuestion = async () => {
    if (!newQuestion.questionText || !newQuestion.correctAnswer || !newQuestion.category) {
      alert("Alla fält måste fyllas i!");
      return;
    }

    try {
      const imageUrls = await uploadImagesToStorage(newQuestion.images);
      const explanationImageUrls = await uploadImagesToStorage(newQuestion.explanationImages);

      const docRef = await addDoc(collection(db, "questions"), {
        ...newQuestion,
        images: imageUrls,
        explanationImages: explanationImageUrls,
      });
      setQuestions([...questions, { ...newQuestion, images: imageUrls, explanationImages: explanationImageUrls, id: docRef.id }]);
    } catch (error) {
      console.error("Error adding question: ", error);
    }

    setNewQuestion({
      mainSection: "",
      subSection: "",
      category: "",
      questionText: "",
      options: [""],
      correctAnswer: "",
      images: [],
      explanation: "",
      explanationImages: [],
    });
  };

  return (
    <div style={{ padding: "20px" }}>
      <Typography variant="h5">Frågehanterare</Typography>

      <TextField
        label="Huvudsektion"
        value={newQuestion.mainSection}
        onChange={(e) => handleMainCategoryChange(e)}
        select
        fullWidth
        margin="normal"
      >
        {mainCategories.map((category) => (
          <MenuItem key={category.id} value={category.id}>
            {category.name}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        label="Undersektion"
        value={newQuestion.subSection}
        onChange={(e) => handleSubCategoryChange(e)}
        select
        fullWidth
        margin="normal"
      >
        {subCategories.map((category) => (
          <MenuItem key={category.id} value={category.id}>
            {category.name}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        label="Kategori"
        value={newQuestion.category}
        onChange={(e) => handleCategoryChange(e)}
        select
        fullWidth
        margin="normal"
      >
        {categories.map((category) => (
          <MenuItem key={category.id} value={category.id}>
            {category.name}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        label="Fråga"
        value={newQuestion.questionText}
        onChange={(e) => setNewQuestion({ ...newQuestion, questionText: e.target.value })}
        fullWidth
        margin="normal"
      />

      {newQuestion.options.map((option, index) => (
        <TextField
          key={index}
          label={`Alternativ ${index + 1}`}
          value={option}
          onChange={(e) => handleOptionChange(index, e.target.value)}
          fullWidth
          margin="normal"
        />
      ))}

      <Button onClick={handleAddOption} variant="outlined" startIcon={<Add />}>Lägg till alternativ</Button>
      <Button onClick={handleRemoveOption} variant="outlined" startIcon={<Remove />}>Ta bort alternativ</Button>

      <TextField
        label="Rätt svar"
        select
        value={newQuestion.correctAnswer}
        onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })}
        fullWidth
        margin="normal"
      >
        {newQuestion.options.map((option, index) => (
          <MenuItem key={index} value={option}>
            {option}
          </MenuItem>
        ))}
      </TextField>

      <div>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageUpload}
        />
        {newQuestion.images.length > 0 && (
          <div style={{ marginTop: "10px" }}>
            {newQuestion.images.map((image, index) => (
              <div key={index} style={{ display: "inline-block", marginRight: "10px" }}>
                <img
                  src={image.previewUrl}
                  alt={`Uploaded ${index}`}
                  style={{ width: "100px", height: "100px", objectFit: "cover" }}
                />
                <IconButton onClick={() => handleRemoveImage(index)}><Close /></IconButton>
              </div>
            ))}
          </div>
        )}
      </div>

      <TextField
        label="Förklaring"
        value={newQuestion.explanation}
        onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
        fullWidth
        margin="normal"
        multiline
      />

      <div>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleExplanationImageUpload}
        />
        {newQuestion.explanationImages.length > 0 && (
          <div style={{ marginTop: "10px" }}>
            {newQuestion.explanationImages.map((image, index) => (
              <div key={index} style={{ display: "inline-block", marginRight: "10px" }}>
                <img
                  src={image.previewUrl}
                  alt={`Explanation ${index}`}
                  style={{ width: "100px", height: "100px", objectFit: "cover" }}
                />
                <IconButton onClick={() => handleRemoveExplanationImage(index)}><Close /></IconButton>
              </div>
            ))}
          </div>
        )}
      </div>

      <Button
        variant="contained"
        color="primary"
        onClick={handleAddQuestion}
        style={{ marginTop: "20px" }}
      >
        Lägg till fråga
      </Button>
    </div>
  );
};

export default QuestionManager;
