import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Button,
  Typography,
  Paper,
} from "@mui/material";
import { db } from "../../firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const QuestionList = () => {
  const [questions, setQuestions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedMainSection, setSelectedMainSection] = useState("");
  const [selectedSubSection, setSelectedSubSection] = useState("");
  const [categories, setCategories] = useState([]);
  const [mainSections, setMainSections] = useState([]);
  const [subSections, setSubSections] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuestions();
    fetchMainSections();
    fetchSubSections();
  }, []);

  useEffect(() => {
    if (selectedSubSection) {
      fetchCategories(selectedSubSection);
    } else {
      setCategories([]);
    }
  }, [selectedSubSection]);

  const fetchQuestions = async () => {
    const questionsCollection = collection(db, "questions");
    const questionsSnapshot = await getDocs(questionsCollection);
    const questionsList = questionsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setQuestions(questionsList);
  };

  const fetchMainSections = async () => {
    const mainSectionsCollection = collection(db, "mainCategories");
    const mainSectionsSnapshot = await getDocs(mainSectionsCollection);
    const mainSectionsList = mainSectionsSnapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
    }));
    setMainSections(mainSectionsList);
  };

  const fetchSubSections = async () => {
    const subSectionsCollection = collection(db, "subCategories");
    const subSectionsSnapshot = await getDocs(subSectionsCollection);
    const subSectionsList = subSectionsSnapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
      mainCategory: doc.data().mainCategory,
    }));
    setSubSections(subSectionsList);
  };

  const fetchCategories = async (subSectionId) => {
    const categoriesCollection = collection(db, "categories");
    const q = query(categoriesCollection, where("subCategory", "==", subSectionId));
    const categoriesSnapshot = await getDocs(q);
    const categoriesList = categoriesSnapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
    }));
    setCategories(categoriesList);
  };

  const filteredQuestions = questions.filter((question) => {
    if (selectedCategory && question.category !== selectedCategory) {
      return false;
    }
    if (selectedMainSection && question.mainSection !== selectedMainSection) {
      return false;
    }
    if (selectedSubSection && question.subSection !== selectedSubSection) {
      return false;
    }
    return true;
  });

  const handleViewQuestionDetails = (question) => {
    navigate(`/admin/question-details/${question.id}`, { state: { question } });
  };

  const getNameFromId = (id, list) => {
    const item = list.find((item) => item.id === id);
    return item ? item.name : "";
  };

  return (
    <Box
      sx={{
        padding: "50px",
        backgroundColor: "#f1f1f1",
        minHeight: "100vh",
        maxWidth: "1200px",
        margin: "auto",
        borderRadius: "15px",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Typography
        variant="h3"
        gutterBottom
        sx={{
          fontWeight: "bold",
          color: "#1e88e5",
          textAlign: "center",
          marginBottom: "30px",
          fontSize: "2rem",
        }}
      >
        Frågelista
      </Typography>

      <Box display="flex" gap="20px" marginBottom="30px" flexWrap="wrap">
        <FormControl variant="outlined" sx={{ minWidth: "250px" }}>
          <InputLabel>Huvudsektion</InputLabel>
          <Select
            value={selectedMainSection}
            onChange={(e) => {
              setSelectedMainSection(e.target.value);
              setSelectedSubSection("");
            }}
            label="Huvudsektion"
          >
            <MenuItem value="">
              <em>Alla huvudsektioner</em>
            </MenuItem>
            {mainSections.map((section) => (
              <MenuItem key={section.id} value={section.id}>
                {section.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl variant="outlined" sx={{ minWidth: "250px" }}>
          <InputLabel>Undersektion</InputLabel>
          <Select
            value={selectedSubSection}
            onChange={(e) => {
              setSelectedSubSection(e.target.value);
              setSelectedCategory("");
            }}
            label="Undersektion"
          >
            <MenuItem value="">
              <em>Alla undersektioner</em>
            </MenuItem>
            {subSections
              .filter((sub) => sub.mainCategory === selectedMainSection)
              .map((sub) => (
                <MenuItem key={sub.id} value={sub.id}>
                  {sub.name}
                </MenuItem>
              ))}
          </Select>
        </FormControl>

        <FormControl variant="outlined" sx={{ minWidth: "250px" }}>
          <InputLabel>Kategori</InputLabel>
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            label="Kategori"
            disabled={!selectedSubSection}
          >
            <MenuItem value="">
              <em>Alla kategorier</em>
            </MenuItem>
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: "10px" }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#1e88e5" }}>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Nr</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Huvudsektion</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Undersektion</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Kategori</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Fråga</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredQuestions.length > 0 ? (
              filteredQuestions.map((question, index) => (
                <TableRow key={question.id} hover>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{getNameFromId(question.mainSection, mainSections)}</TableCell>
                  <TableCell>{getNameFromId(question.subSection, subSections)}</TableCell>
                  <TableCell>{getNameFromId(question.category, categories)}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      onClick={() => handleViewQuestionDetails(question)}
                    >
                      {question.questionText}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} sx={{ textAlign: "center", color: "#999" }}>
                  Inga frågor tillgängliga
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default QuestionList;
