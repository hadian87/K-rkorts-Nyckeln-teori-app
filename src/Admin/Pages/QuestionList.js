import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Select, MenuItem, FormControl, InputLabel, Box, Button, Typography, Paper } from "@mui/material";
import { db } from "../../firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { AppstoreOutlined } from '@ant-design/icons';  // Updated Icon import

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
    <div style={{ padding: "40px", backgroundColor: "#f9f9f9" }}>
      <Typography variant="h4" gutterBottom style={{ fontWeight: "bold", color: "#3f51b5", textAlign: "center" }}>
        Frågelista
      </Typography>

      <Box display="flex" gap="20px" marginBottom="30px" flexWrap="wrap">
        {/* Main Section Filter */}
        <FormControl variant="outlined" style={{ minWidth: "200px" }}>
          <InputLabel>Huvudsektion</InputLabel>
          <Select
            value={selectedMainSection}
            onChange={(e) => {
              setSelectedMainSection(e.target.value);
              setSelectedSubSection(""); // Reset sub-section when main section changes
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

        {/* Sub Section Filter */}
        <FormControl variant="outlined" style={{ minWidth: "200px" }}>
          <InputLabel>Undersektion</InputLabel>
          <Select
            value={selectedSubSection}
            onChange={(e) => {
              setSelectedSubSection(e.target.value);
              setSelectedCategory(""); // Reset category when sub section changes
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

        {/* Category Filter */}
        <FormControl variant="outlined" style={{ minWidth: "200px" }}>
          <InputLabel>Kategori</InputLabel>
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            label="Kategori"
            disabled={!selectedSubSection} // Disable category selection until sub-section is selected
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

      <TableContainer component={Paper} elevation={3} style={{ borderRadius: "10px" }}>
        <Table>
          <TableHead>
            <TableRow style={{ backgroundColor: "#3f51b5" }}>
              <TableCell style={{ color: "#fff", fontWeight: "bold" }}>Nr</TableCell>
              <TableCell style={{ color: "#fff", fontWeight: "bold" }}>Huvudsektion</TableCell>
              <TableCell style={{ color: "#fff", fontWeight: "bold" }}>Undersektion</TableCell>
              <TableCell style={{ color: "#fff", fontWeight: "bold" }}>Kategori</TableCell>
              <TableCell style={{ color: "#fff", fontWeight: "bold", textAlign: "left", paddingLeft: "50px" }}>Fråga</TableCell>
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
                  <TableCell style={{ textAlign: "left", paddingLeft: "50px" }}>
                    <Button variant="text" color="primary" onClick={() => handleViewQuestionDetails(question)}>
                      {question.questionText}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} style={{ textAlign: "center", color: "#999" }}>
                  Inga frågor tillgängliga
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default QuestionList;
