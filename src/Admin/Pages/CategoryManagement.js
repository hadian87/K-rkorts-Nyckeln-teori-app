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
} from "@mui/material";
import { db } from "../../firebaseConfig";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";

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

  // دالة لتوليد slug من الاسم
  function generateSlug(name) {
    return name.trim().toLowerCase().replace(/\s+/g, '-');
  }

  const handleUploadImage = async (file) => {
    if (!file) return null;
    const storage = getStorage();
    const fileRef = ref(storage, `categories/${file.name}`);
    await uploadBytes(fileRef, file);
    return await getDownloadURL(fileRef);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const mainCategoriesSnapshot = await getDocs(collection(db, "mainCategories"));
        const mainCategoriesData = mainCategoriesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMainCategories(mainCategoriesData);

        const subCategoriesSnapshot = await getDocs(collection(db, "subCategories"));
        const subCategoriesData = {};
        subCategoriesSnapshot.docs.forEach((doc) => {
          const subCategory = { id: doc.id, ...doc.data() };
          const mainCategory = subCategory.mainCategory;
          if (!subCategoriesData[mainCategory]) subCategoriesData[mainCategory] = [];
          subCategoriesData[mainCategory].push(subCategory);
        });
        setSubCategories(subCategoriesData);

        const categoriesSnapshot = await getDocs(collection(db, "categories"));
        const categoriesData = {};
        categoriesSnapshot.docs.forEach((doc) => {
          const category = { id: doc.id, ...doc.data() };
          const subCategory = category.subCategory;
          if (!categoriesData[subCategory]) categoriesData[subCategory] = [];
          categoriesData[subCategory].push(category);
        });
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching categories data:", error);
      }
    };

    fetchData();
  }, []);

  const handleAddMainCategory = async () => {
    if (mainCategoryInput) {
      try {
        const iconUrl = mainCategoryImage ? await handleUploadImage(mainCategoryImage) : null;
        const slug = generateSlug(mainCategoryInput); // إنشاء slug
        const docRef = await addDoc(collection(db, "mainCategories"), { name: mainCategoryInput, iconUrl, slug });
        setMainCategories([...mainCategories, { id: docRef.id, name: mainCategoryInput, iconUrl, slug }]);
        setMainCategoryInput("");
        setMainCategoryImage(null);
      } catch (error) {
        console.error("Error adding main category:", error);
      }
    }
  };

  const handleAddSubCategory = async () => {
    if (subCategoryInput && selectedMainCategory) {
      try {
        const iconUrl = subCategoryImage ? await handleUploadImage(subCategoryImage) : null;
        const slug = generateSlug(subCategoryInput); // إنشاء slug
        const docRef = await addDoc(collection(db, "subCategories"), {
          name: subCategoryInput,
          mainCategory: selectedMainCategory,
          iconUrl,
          slug,
        });
        const updatedSubCategories = { ...subCategories };
        if (!updatedSubCategories[selectedMainCategory]) updatedSubCategories[selectedMainCategory] = [];
        updatedSubCategories[selectedMainCategory].push({ id: docRef.id, name: subCategoryInput, iconUrl, slug });
        setSubCategories(updatedSubCategories);
        setSubCategoryInput("");
        setSubCategoryImage(null);
      } catch (error) {
        console.error("Error adding sub-category:", error);
      }
    }
  };

  const handleAddCategory = async () => {
    if (categoryInput && selectedMainCategory && selectedSubCategory) {
      try {
        const iconUrl = categoryImage ? await handleUploadImage(categoryImage) : null;
        const slug = generateSlug(categoryInput); // إنشاء slug
        const docRef = await addDoc(collection(db, "categories"), {
          name: categoryInput,
          subCategory: selectedSubCategory,
          iconUrl,
          slug,
        });
        const updatedCategories = { ...categories };
        if (!updatedCategories[selectedSubCategory]) updatedCategories[selectedSubCategory] = [];
        updatedCategories[selectedSubCategory].push({ id: docRef.id, name: categoryInput, iconUrl, slug });
        setCategories(updatedCategories);
        setCategoryInput("");
        setCategoryImage(null);
      } catch (error) {
        console.error("Error adding category:", error);
      }
    }
  };

  const handleDeleteItem = async (type, id, parentId = null) => {
    const confirmed = window.confirm("Är du säker på att du vill ta bort detta objekt?");
    if (!confirmed) {
      return;
    }

    try {
      if (type === "main") {
        await deleteDoc(doc(db, "mainCategories", id));
        setMainCategories((prev) => prev.filter((main) => main.id !== id));
        const updatedSubCategories = { ...subCategories };
        delete updatedSubCategories[id];
        setSubCategories(updatedSubCategories);
      } else if (type === "sub") {
        await deleteDoc(doc(db, "subCategories", id));
        const updatedSubCategories = { ...subCategories };
        updatedSubCategories[parentId] = updatedSubCategories[parentId].filter((sub) => sub.id !== id);
        setSubCategories(updatedSubCategories);
        const updatedCategories = { ...categories };
        delete updatedCategories[id];
        setCategories(updatedCategories);
      } else if (type === "category") {
        await deleteDoc(doc(db, "categories", id));
        const updatedCategories = { ...categories };
        updatedCategories[parentId] = updatedCategories[parentId].filter((cat) => cat.id !== id);
        setCategories(updatedCategories);
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleToggle = (category) => {
    setOpen((prevState) => ({ ...prevState, [category]: !prevState[category] }));
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Kategorihantering
      </Typography>
      <Grid container spacing={2}>
        {/* Main Category Section */}
        <Grid item xs={12} md={4}>
          <TextField
            label="Lägg till huvudkategori"
            variant="outlined"
            value={mainCategoryInput}
            onChange={(e) => setMainCategoryInput(e.target.value)}
            fullWidth
          />
          <TextField
            type="file"
            onChange={(e) => setMainCategoryImage(e.target.files[0])}
            fullWidth
            sx={{ marginTop: 2 }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddMainCategory}
            sx={{ marginTop: 2 }}
          >
            Lägg till huvudkategori
          </Button>
        </Grid>

        {/* Sub Category Section */}
        <Grid item xs={12} md={4}>
          <FormControl variant="outlined" fullWidth>
            <InputLabel>Välj huvudkategori</InputLabel>
            <Select value={selectedMainCategory} onChange={(e) => setSelectedMainCategory(e.target.value)}>
              {mainCategories.map((main) => (
                <MenuItem key={main.id} value={main.id}>
                  {main.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Lägg till underkategori"
            variant="outlined"
            value={subCategoryInput}
            onChange={(e) => setSubCategoryInput(e.target.value)}
            fullWidth
            sx={{ marginTop: 2 }}
            disabled={!selectedMainCategory}
          />
          <TextField
            type="file"
            onChange={(e) => setSubCategoryImage(e.target.files[0])}
            fullWidth
            sx={{ marginTop: 2 }}
            disabled={!selectedMainCategory}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddSubCategory}
            sx={{ marginTop: 2 }}
            disabled={!selectedMainCategory}
          >
            Lägg till underkategori
          </Button>
        </Grid>

        {/* Category Section */}
        <Grid item xs={12} md={4}>
          <FormControl variant="outlined" fullWidth>
            <InputLabel>Välj underkategori</InputLabel>
            <Select value={selectedSubCategory} onChange={(e) => setSelectedSubCategory(e.target.value)}>
              {(subCategories[selectedMainCategory] || []).map((sub) => (
                <MenuItem key={sub.id} value={sub.id}>
                  {sub.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Lägg till kategori"
            variant="outlined"
            value={categoryInput}
            onChange={(e) => setCategoryInput(e.target.value)}
            fullWidth
            sx={{ marginTop: 2 }}
            disabled={!selectedSubCategory}
          />
          <TextField
            type="file"
            onChange={(e) => setCategoryImage(e.target.files[0])}
            fullWidth
            sx={{ marginTop: 2 }}
            disabled={!selectedSubCategory}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddCategory}
            sx={{ marginTop: 2 }}
            disabled={!selectedSubCategory}
          >
            Lägg till kategori
          </Button>
        </Grid>
      </Grid>

      {/* Displaying Hierarchy with Delete and Edit Buttons */}
      <Box sx={{ marginTop: 4 }}>
        <Typography variant="h5" gutterBottom>
          Kategorier Översikt
        </Typography>
        <List>
          {mainCategories.map((main) => (
            <Box key={main.id}>
              <ListItem>
                {main.iconUrl && (
                  <img
                    src={main.iconUrl}
                    alt={`${main.name} icon`}
                    style={{ width: 40, height: 40, marginRight: 10 }}
                  />
                )}
                <ListItemText primary={main.name} />
                <IconButton onClick={() => handleToggle(main.id)}>
                  {open[main.id] ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
                <IconButton color="secondary" onClick={() => handleDeleteItem("main", main.id)}>
                  <DeleteIcon />
                </IconButton>
              </ListItem>
              <Collapse in={open[main.id]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding sx={{ paddingLeft: 4 }}>
                  {(subCategories[main.id] || []).map((sub) => (
                    <Box key={sub.id}>
                      <ListItem>
                        {sub.iconUrl && (
                          <img
                            src={sub.iconUrl}
                            alt={`${sub.name} icon`}
                            style={{ width: 30, height: 30, marginRight: 10 }}
                          />
                        )}
                        <ListItemText primary={sub.name} />
                        <IconButton onClick={() => handleToggle(sub.id)}>
                          {open[sub.id] ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                        <IconButton color="secondary" onClick={() => handleDeleteItem("sub", sub.id, main.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </ListItem>
                      <Collapse in={open[sub.id]} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding sx={{ paddingLeft: 4 }}>
                          {(categories[sub.id] || []).map((cat) => (
                            <ListItem key={cat.id}>
                              {cat.iconUrl && (
                                <img
                                  src={cat.iconUrl}
                                  alt={`${cat.name} icon`}
                                  style={{ width: 20, height: 20, marginRight: 10 }}
                                />
                              )}
                              <ListItemText primary={cat.name} />
                              <IconButton color="secondary" onClick={() => handleDeleteItem("category", cat.id, sub.id)}>
                                <DeleteIcon />
                              </IconButton>
                            </ListItem>
                          ))}
                        </List>
                      </Collapse>
                    </Box>
                  ))}
                </List>
              </Collapse>
            </Box>
          ))}
        </List>
      </Box>
    </Box>
  );
}

export default CategoryManagement;
