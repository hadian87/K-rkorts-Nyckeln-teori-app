import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { CssBaseline } from "@mui/material";
import { ConfigProvider } from "antd";

// استيراد مكونات التطبيق الأخرى
import Profile from "./Student/Profile";
import SimulationTests from "./Student/SimulationTests";
import CreateUser from "./Admin/Pages/CreateUser";
import UserList from "./Admin/Pages/UserList";
import MainLayout from "./MainLayout";
import AddQuestion from "./Admin/Pages/AddQuestion";
import ManageTests from "./Admin/Pages/ManageTests";
import LoginPage from "./Admin/Pages/LoginPage";
import Dashboard from "./Admin/Pages/Dashboard";
import StudentDashboard from './Student/StudentDashboard';
import TheoryContent from "./Student/TheoryContent";
import PerformanceAnalysis from "./Student/PerformanceAnalysis";
import Notifications from "./Student/Notifications";
import SubCategories from "./Student/SubCategories";
import TestsPage from "./Student/TestsPage";
import TestPage from "./Student/TestPage";
import ResultPage from "./Student/ResultPage";
import TestReviewPage from "./Student/TestReviewPage.js"; // استيراد صفحة مراجعة الاختبار
import CategoryManagement from "./Admin/Pages/CategoryManagement";
import ProtectedRoute from "./components/ProtectedRoute";
import ManageNotifications from "./Admin/Pages/ManageNotifications";
import QuestionList from "./Admin/Pages/QuestionList";
import QuestionDetails from "./Admin/Pages/QuestionDetails";

const App = () => {
  return (
    <ConfigProvider prefixCls="ant">
      <Router>
        <CssBaseline />
        <Routes>
          {/* مسار تسجيل الدخول */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* مسارات المشرف */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute role="admin">
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="create-user" element={<CreateUser />} />
            <Route path="user-list" element={<UserList />} />
            <Route path="add-question" element={<AddQuestion />} />
            <Route path="question-list" element={<QuestionList />} />
            <Route path="manage-tests" element={<ManageTests />} />
            <Route path="category-management" element={<CategoryManagement />} />
            <Route path="manage-notifications" element={<ManageNotifications />} />
            <Route path="question-details/:id" element={<QuestionDetails />} />
          </Route>

          {/* مسارات الطالب */}
          <Route
            path="/student/övningstest"
            element={
              <ProtectedRoute role="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/simulation-tests"
            element={
              <ProtectedRoute role="student">
                <SimulationTests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/theory-content"
            element={
              <ProtectedRoute role="student">
                <TheoryContent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/performance-analysis"
            element={
              <ProtectedRoute role="student">
                <PerformanceAnalysis />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/notifications"
            element={
              <ProtectedRoute role="student">
                <Notifications />
              </ProtectedRoute>
            }
          />

          {/* مسار الملف الشخصي الخاص بالطالب */}
          <Route
            path="/student/profile"
            element={
              <ProtectedRoute role="student">
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* مسار الأقسام الفرعية */}
          <Route
            path="/student/subcategories/:mainCategoryId"
            element={
              <ProtectedRoute role="student">
                <SubCategories />
              </ProtectedRoute>
            }
          />

          {/* مسار صفحة الاختبارات لعرض الاختبارات حسب القسم الفرعي */}
          <Route
            path="/student/tests/:mainSectionId/:subSectionId"
            element={
              <ProtectedRoute role="student">
                <TestsPage />
              </ProtectedRoute>
            }
          />

          {/* مسار صفحة الاختبار الفردي */}
          <Route
            path="/student/test/:testId"
            element={
              <ProtectedRoute role="student">
                <TestPage />
              </ProtectedRoute>
            }
          />

          {/* مسار صفحة النتيجة */}
          <Route
            path="/student/result"
            element={
              <ProtectedRoute role="student">
                <ResultPage />
              </ProtectedRoute>
            }
          />

          {/* مسار صفحة مراجعة الاختبار */}
          <Route
            path="/student/test-review/:testResultId"
            element={
              <ProtectedRoute role="student">
                <TestReviewPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </ConfigProvider>
  );
};

export default App;
