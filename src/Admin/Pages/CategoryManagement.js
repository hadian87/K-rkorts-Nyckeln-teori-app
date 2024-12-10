import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Collapse,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { db, storage } from "../../firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { ThemeProvider, createTheme } from "@mui/material/styles";

function CategoryManagement() {
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState({});
  const [categories, setCategories] = useState({});
  const [mainCategoryInput, setMainCategoryInput] = useState("");
  const [mainCategoryImage, setMainCategoryImage] = useState(null);
  const [subCategoryInput, setSubCategoryInput] = useState("");
  const [subCategoryImage, setSubCategoryImage] = useState(null);
  const [categoryInput, setCategoryInput] = useState("");
  const [categoryImage, setCategoryImage] = useState(null);
  const [selectedMainCategory, setSelectedMainCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [open, setOpen] = useState({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // Funktion för att generera slug från namn
  function generateSlug(name) {
    return name.trim().toLowerCase().replace(/\s+/g, "-");
  }

  // Funktion för att ladda upp bild till Firebase Storage och få URL
  const handleUploadImage = async (file) => {
    if (!file) return null;

    // Begränsa till vissa filtyper
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setSnackbar({ open: true, message: "Endast JPEG, PNG och GIF filer är tillåtna.", severity: "warning" });
      return null;
    }

    // Begränsa filstorleken till 5MB
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setSnackbar({ open: true, message: "Filen är för stor. Max 5MB.", severity: "warning" });
      return null;
    }

    try {
      const fileRef = ref(storage, `categories/${file.name}-${Date.now()}`);
      const snapshot = await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error("خطأ في تحميل الصورة:", error);
      setSnackbar({ open: true, message: "Kunde inte ladda upp bilden.", severity: "error" });
      return null;
    }
  };

  // Funktion för att hämta och sortera data från Firestore
  const fetchCategoriesData = async () => {
    setLoading(true);
    try {
      // Hämta och sortera huvudkategorier
      const mainCategoriesQuery = query(
        collection(db, "mainCategories"),
        orderBy("name", "asc")
      );
      const mainCategoriesSnapshot = await getDocs(mainCategoriesQuery);
      const mainCategoriesData = mainCategoriesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMainCategories(mainCategoriesData);

      // Hämta och sortera underkategorier
      const subCategoriesQuery = query(
        collection(db, "subCategories"),
        orderBy("name", "asc")
      );
      const subCategoriesSnapshot = await getDocs(subCategoriesQuery);
      const subCategoriesData = {};
      subCategoriesSnapshot.docs.forEach((doc) => {
        const subCategory = { id: doc.id, ...doc.data() };
        const mainCategory = subCategory.mainCategory;
        if (!subCategoriesData[mainCategory]) subCategoriesData[mainCategory] = [];
        subCategoriesData[mainCategory].push(subCategory);
      });

      // Sortera underkategorier för varje huvudkategori
      for (let key in subCategoriesData) {
        subCategoriesData[key].sort((a, b) => a.name.localeCompare(b.name));
      }
      setSubCategories(subCategoriesData);

      // Hämta och sortera kategorier
      const categoriesQuery = query(
        collection(db, "categories"),
        orderBy("name", "asc")
      );
      const categoriesSnapshot = await getDocs(categoriesQuery);
      const categoriesData = {};
      categoriesSnapshot.docs.forEach((doc) => {
        const category = { id: doc.id, ...doc.data() };
        const subCategory = category.subCategory;
        if (!categoriesData[subCategory]) categoriesData[subCategory] = [];
        categoriesData[subCategory].push(category);
      });

      // Sortera kategorier för varje underkategori
      for (let key in categoriesData) {
        categoriesData[key].sort((a, b) => a.name.localeCompare(b.name));
      }
      setCategories(categoriesData);
    } catch (error) {
      console.error("خطأ في جلب بيانات الأقسام:", error);
      setSnackbar({ open: true, message: "Kunde inte hämta kategoridata.", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoriesData();
  }, []);

  // Funktion för att lägga till en ny huvudkategori
  const handleAddMainCategory = async () => {
    if (mainCategoryInput.trim() === "") {
      setSnackbar({ open: true, message: "Vänligen ange namnet på huvudkategorin.", severity: "warning" });
      return;
    }
    setLoading(true);
    try {
      const iconUrl = mainCategoryImage ? await handleUploadImage(mainCategoryImage) : null;
      console.log("URL för ikon (Huvudkategori):", iconUrl); // För felsökning
      const slug = generateSlug(mainCategoryInput); // Generera slug
      const docRef = await addDoc(collection(db, "mainCategories"), {
        name: mainCategoryInput,
        iconUrl,
        slug,
      });
      const newMainCategory = {
        id: docRef.id,
        name: mainCategoryInput,
        iconUrl,
        slug,
      };
      // Lägg till den nya huvudkategorin och sortera listan
      const updatedMainCategories = [...mainCategories, newMainCategory].sort((a, b) => a.name.localeCompare(b.name));
      setMainCategories(updatedMainCategories);
      setMainCategoryInput("");
      setMainCategoryImage(null);
      setSnackbar({ open: true, message: "Huvudkategori tillagd framgångsrikt!", severity: "success" });
    } catch (error) {
      console.error("خطأ في إضافة القسم الرئيسي:", error);
      setSnackbar({ open: true, message: "Kunde inte lägga till huvudkategorin.", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Funktion för att lägga till en ny underkategori
  const handleAddSubCategory = async () => {
    if (subCategoryInput.trim() === "" || selectedMainCategory === "") {
      setSnackbar({ open: true, message: "Vänligen ange namnet på underkategorin och välj huvudkategori.", severity: "warning" });
      return;
    }
    setLoading(true);
    try {
      const iconUrl = subCategoryImage ? await handleUploadImage(subCategoryImage) : null;
      console.log("URL för ikon (Underkategori):", iconUrl); // För felsökning
      const slug = generateSlug(subCategoryInput); // Generera slug
      const docRef = await addDoc(collection(db, "subCategories"), {
        name: subCategoryInput,
        mainCategory: selectedMainCategory,
        iconUrl,
        slug,
      });
      const newSubCategory = {
        id: docRef.id,
        name: subCategoryInput,
        iconUrl,
        slug,
      };
      const updatedSubCategories = { ...subCategories };
      if (!updatedSubCategories[selectedMainCategory]) updatedSubCategories[selectedMainCategory] = [];
      updatedSubCategories[selectedMainCategory].push(newSubCategory);
      // Sortera underkategorier efter tillägg
      updatedSubCategories[selectedMainCategory].sort((a, b) => a.name.localeCompare(b.name));
      setSubCategories(updatedSubCategories);
      setSubCategoryInput("");
      setSubCategoryImage(null);
      setSnackbar({ open: true, message: "Underkategori tillagd framgångsrikt!", severity: "success" });
    } catch (error) {
      console.error("خطأ في إضافة القسم الفرعي:", error);
      setSnackbar({ open: true, message: "Kunde inte lägga till underkategorin.", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Funktion för att lägga till en ny kategori
  const handleAddCategory = async () => {
    if (
      categoryInput.trim() === "" ||
      selectedMainCategory === "" ||
      selectedSubCategory === ""
    ) {
      setSnackbar({ open: true, message: "Vänligen ange namnet på kategorin och välj huvud- samt underkategori.", severity: "warning" });
      return;
    }
    setLoading(true);
    try {
      const iconUrl = categoryImage ? await handleUploadImage(categoryImage) : null;
      console.log("URL för ikon (Kategori):", iconUrl); // För felsökning
      const slug = generateSlug(categoryInput); // Generera slug
      const docRef = await addDoc(collection(db, "categories"), {
        name: categoryInput,
        subCategory: selectedSubCategory,
        iconUrl,
        slug,
      });
      const newCategory = {
        id: docRef.id,
        name: categoryInput,
        iconUrl,
        slug,
      };
      const updatedCategories = { ...categories };
      if (!updatedCategories[selectedSubCategory]) updatedCategories[selectedSubCategory] = [];
      updatedCategories[selectedSubCategory].push(newCategory);
      // Sortera kategorier efter tillägg
      updatedCategories[selectedSubCategory].sort((a, b) => a.name.localeCompare(b.name));
      setCategories(updatedCategories);
      setCategoryInput("");
      setCategoryImage(null);
      setSnackbar({ open: true, message: "Kategori tillagd framgångsrikt!", severity: "success" });
    } catch (error) {
      console.error("خطأ في إضافة الفئة:", error);
      setSnackbar({ open: true, message: "Kunde inte lägga till kategorin.", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Funktion för att ta bort huvudkategori, underkategori eller kategori
  const handleDeleteItem = async (type, id, parentId = null) => {
    const confirmed = window.confirm("Är du säker på att du vill ta bort detta objekt?");
    if (!confirmed) return;

    setLoading(true);
    try {
      if (type === "main") {
        // Ta bort huvudkategori
        await deleteDoc(doc(db, "mainCategories", id));
        setMainCategories((prev) => prev.filter((main) => main.id !== id));
        const updatedSubCategories = { ...subCategories };
        delete updatedSubCategories[id];
        setSubCategories(updatedSubCategories);
        // Ta bort underkategorier och deras kategorier
        const subCategoriesToDelete = await getDocs(
          query(collection(db, "subCategories"), where("mainCategory", "==", id))
        );
        for (const subDoc of subCategoriesToDelete.docs) {
          await deleteDoc(doc(db, "subCategories", subDoc.id));
          // Ta bort kategorier som tillhör underkategorin
          const categoriesToDelete = await getDocs(
            query(collection(db, "categories"), where("subCategory", "==", subDoc.id))
          );
          for (const catDoc of categoriesToDelete.docs) {
            await deleteDoc(doc(db, "categories", catDoc.id));
          }
        }
        setSnackbar({ open: true, message: "Huvudkategori raderad framgångsrikt!", severity: "success" });
      } else if (type === "sub") {
        // Ta bort underkategori
        await deleteDoc(doc(db, "subCategories", id));
        const updatedSubCategories = { ...subCategories };
        updatedSubCategories[parentId] = updatedSubCategories[parentId].filter(
          (sub) => sub.id !== id
        );
        setSubCategories(updatedSubCategories);
        // Ta bort kategorier som tillhör underkategorin
        const categoriesToDelete = await getDocs(
          query(collection(db, "categories"), where("subCategory", "==", id))
        );
        for (const catDoc of categoriesToDelete.docs) {
          await deleteDoc(doc(db, "categories", catDoc.id));
        }
        setSnackbar({ open: true, message: "Underkategori raderad framgångsrikt!", severity: "success" });
      } else if (type === "category") {
        // Ta bort kategori
        await deleteDoc(doc(db, "categories", id));
        const updatedCategories = { ...categories };
        updatedCategories[parentId] = updatedCategories[parentId].filter(
          (cat) => cat.id !== id
        );
        setCategories(updatedCategories);
        setSnackbar({ open: true, message: "Kategori raderad framgångsrikt!", severity: "success" });
      }
    } catch (error) {
      console.error("خطأ في حذف العنصر:", error);
      setSnackbar({ open: true, message: "Kunde inte radera objektet.", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Funktion för att toggla collapse
  const handleToggle = (category) => {
    setOpen((prevState) => ({ ...prevState, [category]: !prevState[category] }));
  };

  // Funktion för att stänga Snackbar
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  // Skapa anpassat tema
  const theme = createTheme({
    palette: {
      primary: {
        main: "#1976d2", // blå
      },
      secondary: {
        main: "#dc004e", // rosa
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ padding: 4, backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
        <Typography variant="h4" gutterBottom align="center" color="primary">
          Hantering av Kategorier
        </Typography>
        <Grid container spacing={3}>
          {/* Avsnitt för att lägga till huvudkategorier */}
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ padding: 3 }}>
              <Typography variant="h6" gutterBottom color="secondary">
                Lägg till Huvudkategori
              </Typography>
              <TextField
                label="Namn på huvudkategori"
                variant="outlined"
                value={mainCategoryInput}
                onChange={(e) => setMainCategoryInput(e.target.value)}
                fullWidth
                sx={{ marginBottom: 2 }}
              />
              <Button
                variant="contained"
                component="label"
                startIcon={<UploadFileIcon />}
                fullWidth
                sx={{ marginBottom: 2 }}
              >
                Ladda upp ikon
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => setMainCategoryImage(e.target.files[0])}
                />
              </Button>
              {mainCategoryImage && (
                <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                  <img
                    src={URL.createObjectURL(mainCategoryImage)}
                    alt="Förhandsvisning"
                    style={{ width: 50, height: 50, marginRight: 8, borderRadius: "50%" }}
                  />
                  <Typography variant="body2">{mainCategoryImage.name}</Typography>
                </Box>
              )}
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddMainCategory}
                fullWidth
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Lägg till"}
              </Button>
            </Paper>
          </Grid>

          {/* Avsnitt för att lägga till underkategorier */}
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ padding: 3 }}>
              <Typography variant="h6" gutterBottom color="secondary">
                Lägg till Underkategori
              </Typography>
              <FormControl variant="outlined" fullWidth sx={{ marginBottom: 2 }}>
                <InputLabel>Välj huvudkategori</InputLabel>
                <Select
                  value={selectedMainCategory}
                  onChange={(e) => {
                    setSelectedMainCategory(e.target.value);
                    setSelectedSubCategory(""); // Återställ underkategori vid huvudkategoriändring
                  }}
                  label="Välj huvudkategori"
                >
                  {mainCategories.map((main) => (
                    <MenuItem key={main.id} value={main.id}>
                      {main.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Namn på underkategori"
                variant="outlined"
                value={subCategoryInput}
                onChange={(e) => setSubCategoryInput(e.target.value)}
                fullWidth
                sx={{ marginBottom: 2 }}
                disabled={!selectedMainCategory}
              />
              <Button
                variant="contained"
                component="label"
                startIcon={<UploadFileIcon />}
                fullWidth
                sx={{ marginBottom: 2 }}
                disabled={!selectedMainCategory}
              >
                Ladda upp ikon
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => setSubCategoryImage(e.target.files[0])}
                />
              </Button>
              {subCategoryImage && (
                <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                  <img
                    src={URL.createObjectURL(subCategoryImage)}
                    alt="Förhandsvisning"
                    style={{ width: 50, height: 50, marginRight: 8, borderRadius: "50%" }}
                  />
                  <Typography variant="body2">{subCategoryImage.name}</Typography>
                </Box>
              )}
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddSubCategory}
                fullWidth
                disabled={!selectedMainCategory || loading}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Lägg till"}
              </Button>
            </Paper>
          </Grid>

          {/* Avsnitt för att lägga till kategorier */}
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ padding: 3 }}>
              <Typography variant="h6" gutterBottom color="secondary">
                Lägg till Kategori
              </Typography>
              <FormControl variant="outlined" fullWidth sx={{ marginBottom: 2 }}>
                <InputLabel>Välj underkategori</InputLabel>
                <Select
                  value={selectedSubCategory}
                  onChange={(e) => setSelectedSubCategory(e.target.value)}
                  label="Välj underkategori"
                  disabled={!selectedMainCategory}
                >
                  {(subCategories[selectedMainCategory] || []).map((sub) => (
                    <MenuItem key={sub.id} value={sub.id}>
                      {sub.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Namn på kategori"
                variant="outlined"
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
                fullWidth
                sx={{ marginBottom: 2 }}
                disabled={!selectedSubCategory}
              />
              <Button
                variant="contained"
                component="label"
                startIcon={<UploadFileIcon />}
                fullWidth
                sx={{ marginBottom: 2 }}
                disabled={!selectedSubCategory}
              >
                Ladda upp ikon
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => setCategoryImage(e.target.files[0])}
                />
              </Button>
              {categoryImage && (
                <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                  <img
                    src={URL.createObjectURL(categoryImage)}
                    alt="Förhandsvisning"
                    style={{ width: 50, height: 50, marginRight: 8, borderRadius: "50%" }}
                  />
                  <Typography variant="body2">{categoryImage.name}</Typography>
                </Box>
              )}
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddCategory}
                fullWidth
                disabled={!selectedSubCategory || loading}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Lägg till"}
              </Button>
            </Paper>
          </Grid>
        </Grid>

        {/* Visa huvudkategorier, underkategorier och kategorier */}
        <Box sx={{ marginTop: 6 }}>
          <Typography variant="h5" gutterBottom align="center" color="primary">
            Översikt över Kategorier
          </Typography>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <List>
              {mainCategories.map((main) => (
                <Card key={main.id} sx={{ marginBottom: 2 }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      {main.iconUrl && (
                        <img
                          src={main.iconUrl}
                          alt={`${main.name} ikon`}
                          style={{ width: 50, height: 50, marginRight: 16, borderRadius: "50%" }}
                        />
                      )}
                      <Typography variant="h6" color="text.primary">
                        {main.name}
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions>
                    <IconButton onClick={() => handleToggle(main.id)}>
                      {open[main.id] ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteItem("main", main.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                  <Collapse in={open[main.id]} timeout="auto" unmountOnExit>
                    <CardContent sx={{ paddingLeft: 4 }}>
                      <List>
                        {(subCategories[main.id] || []).map((sub) => (
                          <Box key={sub.id} sx={{ marginBottom: 1 }}>
                            <ListItem>
                              <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                                {sub.iconUrl && (
                                  <img
                                    src={sub.iconUrl}
                                    alt={`${sub.name} ikon`}
                                    style={{ width: 40, height: 40, marginRight: 12, borderRadius: "50%" }}
                                  />
                                )}
                                <ListItemText primary={sub.name} />
                                <IconButton onClick={() => handleToggle(sub.id)}>
                                  {open[sub.id] ? <ExpandLess /> : <ExpandMore />}
                                </IconButton>
                                <IconButton
                                  color="error"
                                  onClick={() => handleDeleteItem("sub", sub.id, main.id)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Box>
                            </ListItem>
                            <Collapse in={open[sub.id]} timeout="auto" unmountOnExit>
                              <List component="div" disablePadding sx={{ paddingLeft: 6 }}>
                                {(categories[sub.id] || []).map((cat) => (
                                  <ListItem key={cat.id} sx={{ display: "flex", alignItems: "center" }}>
                                    {cat.iconUrl && (
                                      <img
                                        src={cat.iconUrl}
                                        alt={`${cat.name} ikon`}
                                        style={{ width: 30, height: 30, marginRight: 8, borderRadius: "50%" }}
                                      />
                                    )}
                                    <ListItemText primary={cat.name} />
                                    <IconButton
                                      color="error"
                                      onClick={() => handleDeleteItem("category", cat.id, sub.id)}
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </ListItem>
                                ))}
                              </List>
                            </Collapse>
                          </Box>
                        ))}
                      </List>
                    </CardContent>
                  </Collapse>
                </Card>
              ))}
            </List>
          )}
        </Box>

        {/* Snackbar för meddelanden */}
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

// Funktion för att mörkna en färg
function shadeColor(color, percent) {
  let R = parseInt(color.substring(1, 3), 16);
  let G = parseInt(color.substring(3, 5), 16);
  let B = parseInt(color.substring(5, 7), 16);

  R = parseInt(R * (100 + percent) / 100);
  G = parseInt(G * (100 + percent) / 100);
  B = parseInt(B * (100 + percent) / 100);

  R = (R < 255) ? R : 255;
  G = (G < 255) ? G : 255;
  B = (B < 255) ? B : 255;

  const RR = ((R.toString(16).length === 1) ? '0' + R.toString(16) : R.toString(16));
  const GG = ((G.toString(16).length === 1) ? '0' + G.toString(16) : G.toString(16));
  const BB = ((B.toString(16).length === 1) ? '0' + B.toString(16) : B.toString(16));

  return '#' + RR + GG + BB;
}

export default CategoryManagement;
