// استيراد الوظائف المطلوبة من Firebase SDKs
import { initializeApp } from "firebase/app"; // استيراد تهيئة التطبيق
import { getAuth } from "firebase/auth"; // استيراد المصادقة (Authentication)
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore"; // استيراد Firestore
import { getStorage } from "firebase/storage"; // استيراد وحدة التخزين (Storage)

// تهيئة إعدادات Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAq9O-RUuA1aVEjx6P_sP-lroYv8ClxRSM",
  authDomain: "korkortsnyckeln-teoriapp.firebaseapp.com",
  projectId: "korkortsnyckeln-teoriapp",
  storageBucket: "korkortsnyckeln-teoriapp.firebasestorage.app",
  messagingSenderId: "475825735988",
  appId: "1:475825735988:web:fcded88bcd6a938346bd61",
  measurementId: "G-YVH89GKSZ8"
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig); // تهيئة تطبيق Firebase

// تهيئة الخدمات الأخرى
const auth = getAuth(app); // تهيئة المصادقة (Authentication)
const storage = getStorage(app); // تهيئة التخزين (Storage)

// تهيئة Firestore مع تمكين التخزين المؤقت
const db = getFirestore(app); // تهيئة Firestore
enableIndexedDbPersistence(db) // تفعيل التخزين المؤقت في Firestore
  .then(() => {
    console.log("تم تفعيل التخزين المؤقت لـ Firestore بنجاح");
  })
  .catch((err) => {
    if (err.code === "failed-precondition") {
      // إذا كان المتصفح يحتوي على عدة نوافذ مفتوحة.
      console.error("فشل في تفعيل التخزين المؤقت بسبب وجود نوافذ متعددة مفتوحة.");
    } else if (err.code === "unimplemented") {
      // إذا كان المتصفح لا يدعم التخزين المؤقت.
      console.error("المتصفح لا يدعم التخزين المؤقت.");
    }
  });

// تصدير الخدمات لاستخدامها في أجزاء أخرى من التطبيق
export { app, auth, db, storage }; 
