import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Divider,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import GroupIcon from "@mui/icons-material/Group";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CategoryIcon from "@mui/icons-material/Category";
import NotificationsIcon from "@mui/icons-material/Notifications"; // Notification Icon

const MainLayout = () => {
  return (
    <Box sx={{ display: "flex" }}>
      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: 240,
            boxSizing: "border-box",
            backgroundColor: "#1B2631", // Mörk bakgrund
            color: "#ECF0F1", // Vit text
            borderRight: "1px solid #34495E",
          },
        }}
      >
        {/* Sidebar Header */}
        <Box
          sx={{
            padding: "20px",
            textAlign: "center",
            backgroundColor: "#34495E", // Lättare nyans för headern
            color: "#ECF0F1", // Vit text
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            Admin Panel
          </Typography>
        </Box>

        {/* Sidebar Navigation */}
        <List>
          <ListItem
            button
            component={NavLink}
            to="/admin/dashboard"
            sx={{
              "&:hover": {
                backgroundColor: "#34495E", // Hover-effekt
              },
              "&.active": {
                backgroundColor: "#2ECC71", // Grön aktiv länk
                color: "#fff",
              },
            }}
          >
            <ListItemIcon>
              <HomeIcon sx={{ color: "#ECF0F1" }} /> {/* Ikonfärg */}
            </ListItemIcon>
            <ListItemText
              primary="Instrumentpanel"
              sx={{ color: "#ECF0F1" }} // Textfärg
            />
          </ListItem>
          <Divider sx={{ borderColor: "#34495E" }} />

          <ListItem
            button
            component={NavLink}
            to="/admin/create-user"
            sx={{
              "&:hover": {
                backgroundColor: "#34495E",
              },
              "&.active": {
                backgroundColor: "#2ECC71",
                color: "#fff",
              },
            }}
          >
            <ListItemIcon>
              <PersonAddIcon sx={{ color: "#ECF0F1" }} />
            </ListItemIcon>
            <ListItemText primary="Skapa Användare" sx={{ color: "#ECF0F1" }} />
          </ListItem>
          <Divider sx={{ borderColor: "#34495E" }} />

          <ListItem
            button
            component={NavLink}
            to="/admin/user-list"
            sx={{
              "&:hover": {
                backgroundColor: "#34495E",
              },
              "&.active": {
                backgroundColor: "#2ECC71",
                color: "#fff",
              },
            }}
          >
            <ListItemIcon>
              <GroupIcon sx={{ color: "#ECF0F1" }} />
            </ListItemIcon>
            <ListItemText primary="Användarlista" sx={{ color: "#ECF0F1" }} />
          </ListItem>
          <Divider sx={{ borderColor: "#34495E" }} />

          <ListItem
            button
            component={NavLink}
            to="/admin/add-question"
            sx={{
              "&:hover": {
                backgroundColor: "#34495E",
              },
              "&.active": {
                backgroundColor: "#2ECC71",
                color: "#fff",
              },
            }}
          >
            <ListItemIcon>
              <QuestionAnswerIcon sx={{ color: "#ECF0F1" }} />
            </ListItemIcon>
            <ListItemText primary="Lägg till Fråga" sx={{ color: "#ECF0F1" }} />
          </ListItem>
          <Divider sx={{ borderColor: "#34495E" }} />

          {/* New Link Added for Question List */}
          <ListItem
            button
            component={NavLink}
            to="/admin/question-list"
            sx={{
              "&:hover": {
                backgroundColor: "#34495E",
              },
              "&.active": {
                backgroundColor: "#2ECC71",
                color: "#fff",
              },
            }}
          >
            <ListItemIcon>
              <QuestionAnswerIcon sx={{ color: "#ECF0F1" }} />
            </ListItemIcon>
            <ListItemText primary="Frågelista" sx={{ color: "#ECF0F1" }} />
          </ListItem>
          <Divider sx={{ borderColor: "#34495E" }} />

          <ListItem
            button
            component={NavLink}
            to="/admin/manage-tests"
            sx={{
              "&:hover": {
                backgroundColor: "#34495E",
              },
              "&.active": {
                backgroundColor: "#2ECC71",
                color: "#fff",
              },
            }}
          >
            <ListItemIcon>
              <AssignmentIcon sx={{ color: "#ECF0F1" }} />
            </ListItemIcon>
            <ListItemText primary="Hantera Tester" sx={{ color: "#ECF0F1" }} />
          </ListItem>
          <Divider sx={{ borderColor: "#34495E" }} />

          <ListItem
            button
            component={NavLink}
            to="/admin/category-management"
            sx={{
              "&:hover": {
                backgroundColor: "#34495E",
              },
              "&.active": {
                backgroundColor: "#2ECC71",
                color: "#fff",
              },
            }}
          >
            <ListItemIcon>
              <CategoryIcon sx={{ color: "#ECF0F1" }} />
            </ListItemIcon>
            <ListItemText
              primary="Kategori Hantering"
              sx={{ color: "#ECF0F1" }}
            />
          </ListItem>
          <Divider sx={{ borderColor: "#34495E" }} />

          {/* Manage Notifications Link */}
          <ListItem
            button
            component={NavLink}
            to="/admin/manage-notifications"
            sx={{
              "&:hover": {
                backgroundColor: "#34495E",
              },
              "&.active": {
                backgroundColor: "#2ECC71",
                color: "#fff",
              },
            }}
          >
            <ListItemIcon>
              <NotificationsIcon sx={{ color: "#ECF0F1" }} />
            </ListItemIcon>
            <ListItemText
              primary="Hantera Notifikationer"
              sx={{ color: "#ECF0F1" }}
            />
          </ListItem>
          <Divider sx={{ borderColor: "#34495E" }} />
        </List>
      </Drawer>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 5,
          backgroundColor: "#F4F6F7",
          height: "100vh",
          overflow: "auto",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
