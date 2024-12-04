// firebaseUtils.js
import { db } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export const sendNotificationToFirebase = async ({ title, content, target }) => {
  try {
    const notificationsRef = collection(db, 'notifications');
    await addDoc(notificationsRef, {
      title,
      content,
      target,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    throw new Error('Failed to send notification: ' + error.message);
  }
};
