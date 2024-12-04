import React from "react";
import { Box, List, ListItem, ListItemText, ListItemIcon, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import HomeIcon from "@mui/icons-material/Home";
import CategoryIcon from "@mui/icons-material/Category";
import AssignmentIcon from "@mui/icons-material/Assignment";
import GroupIcon from "@mui/icons-material/Group";
import NotificationsIcon from "@mui/icons-material/Notifications"; // Importera notification icon

function Sidebar() {
  return (
    <Box
      sx={{
        width: 240,
        backgroundColor: "#1B2631",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        color: "#ECF0F1",
        boxShadow: "2px 0 10px rgba(0,0,0,0.3)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Sidebar Header */}
      <Box
        sx={{
          padding: "20px",
          textAlign: "center",
          backgroundColor: "#34495E",
          color: "#ECF0F1",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          Adminpanel
        </Typography>
      </Box>

      {/* Sidebar Menu */}
      <List sx={{ flexGrow: 1, mt: 2 }}>
        {/* Dashboard */}
        <ListItem
          button
          component={Link}
          to="/admin/dashboard"
          sx={{
            "&:hover": {
              backgroundColor: "#34495E",
            },
            color: "inherit",
          }}
        >
          <ListItemIcon>
            <HomeIcon sx={{ color: "#ECF0F1", fontSize: 30 }} />
          </ListItemIcon>
          <ListItemText primary="Instrumentpanel" />
        </ListItem>

        {/* Create User */}
        <ListItem
          button
          component={Link}
          to="/admin/create-user"
          sx={{
            "&:hover": {
              backgroundColor: "#34495E",
            },
            color: "inherit",
          }}
        >
          <ListItemIcon>
            <PersonAddIcon sx={{ color: "#ECF0F1", fontSize: 30 }} />
          </ListItemIcon>
          <ListItemText primary="Skapa Användare" />
        </ListItem>

        {/* User List */}
        <ListItem
          button
          component={Link}
          to="/admin/user-list"
          sx={{
            "&:hover": {
              backgroundColor: "#34495E",
            },
            color: "inherit",
          }}
        >
          <ListItemIcon>
            <GroupIcon sx={{ color: "#ECF0F1", fontSize: 30 }} />
          </ListItemIcon>
          <ListItemText primary="Användarlista" />
        </ListItem>

        {/* Add Question */}
        <ListItem
          button
          component={Link}
          to="/admin/add-question"
          sx={{
            "&:hover": {
              backgroundColor: "#34495E",
            },
            color: "inherit",
          }}
        >
          <ListItemIcon>
            <QuestionAnswerIcon sx={{ color: "#ECF0F1", fontSize: 30 }} />
          </ListItemIcon>
          <ListItemText primary="Lägg till Fråga" />
        </ListItem>

        {/* Question List */}
        <ListItem
          button
          component={Link}
          to="/admin/question-list"
          sx={{
            "&:hover": {
              backgroundColor: "#34495E",
            },
            color: "inherit",
          }}
        >
          <ListItemIcon>
            <QuestionAnswerIcon sx={{ color: "#ECF0F1", fontSize: 30 }} />
          </ListItemIcon>
          <ListItemText primary="Frågelista" />
        </ListItem>

        {/* Category Management */}
        <ListItem
          button
          component={Link}
          to="/admin/category-management"
          sx={{
            "&:hover": {
              backgroundColor: "#34495E",
            },
            color: "inherit",
          }}
        >
          <ListItemIcon>
            <CategoryIcon sx={{ color: "#ECF0F1", fontSize: 30 }} />
          </ListItemIcon>
          <ListItemText primary="Kategori Hantering" />
        </ListItem>

        {/* Manage Tests */}
        <ListItem
          button
          component={Link}
          to="/admin/manage-tests"
          sx={{
            "&:hover": {
              backgroundColor: "#34495E",
            },
            color: "inherit",
          }}
        >
          <ListItemIcon>
            <AssignmentIcon sx={{ color: "#ECF0F1", fontSize: 30 }} />
          </ListItemIcon>
          <ListItemText primary="Hantera Tester" />
        </ListItem>

        {/* Manage Notifications */}
        <ListItem
          button
          component={Link}
          to="/admin/manage-notifications"
          sx={{
            "&:hover": {
              backgroundColor: "#34495E",
            },
            color: "inherit",
          }}
        >
          <ListItemIcon>
            <NotificationsIcon sx={{ color: "#ECF0F1", fontSize: 30 }} />
          </ListItemIcon>
          <ListItemText primary="Hantera Notifikationer" />
        </ListItem>
      </List>

      {/* Footer */}
      <Box
        sx={{
          textAlign: "center",
          padding: "10px",
          backgroundColor: "#2C3E50",
          color: "#BDC3C7",
          fontSize: "14px",
        }}
      >
        &copy; 2024 Adminpanel
      </Box>
    </Box>
  );
}

export default Sidebar;
