import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const ProtectedRoute = ({ children, role }) => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Current user:", user);
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log("User data:", userData);
            setUserRole(userData.role);
          } else {
            console.log("No such document for user role.");
            setUserRole(null); // إذا لم يتم العثور على دور المستخدم
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setUserRole(null);
        }
      } else {
        console.log("No authenticated user.");
        setUserRole(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    console.log("Loading user role...");
    return <p>Loading...</p>;
  }

  if (!userRole) {
    console.log("User is not authenticated or role is not found, redirecting to login.");
    return <Navigate to="/login" />;
  }

  if (userRole !== role) {
    console.log(`User role (${userRole}) does not match required role (${role}), redirecting to login.`);
    return <Navigate to="/login" />;
  }

  console.log("Access granted to user with role:", userRole);
  return children;
};

export default ProtectedRoute;
