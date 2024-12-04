import React, { useEffect, useState } from 'react';
import { Card, Form, Button, Layout, Typography, Spin, Divider, Row, Col, Upload, message } from 'antd';
import { UploadOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { db, storage } from '../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { Content } = Layout;

const Profile = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({});
  const [profileImage, setProfileImage] = useState('https://via.placeholder.com/150');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (currentUser) {
          const userDoc = doc(db, 'users', currentUser.uid); // Use the current user's UID
          const userSnapshot = await getDoc(userDoc);
          if (userSnapshot.exists()) {
            const data = userSnapshot.data();
            setUserData(data);
            form.setFieldsValue(data);
            if (data.profileImage) {
              setProfileImage(data.profileImage);
            }
          } else {
            setUserData({});
          }
        } else {
          message.error('Ingen användare inloggad.');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        message.error('Ett fel uppstod vid hämtning av användardata.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [form]);

  const handleUpload = async ({ file }) => {
    const isImage = file.type.startsWith('image/');
    const isCorrectSize = file.size <= 5 * 1024 * 1024; // 5MB max size

    if (!isImage) {
      message.error('Vänligen välj en bildfil');
      return;
    }

    if (!isCorrectSize) {
      message.error('Bildfilen får inte vara större än 5MB');
      return;
    }

    try {
      // Upload image to Firebase Storage
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (currentUser) {
        const storageRef = ref(storage, `profileImages/${currentUser.uid}/${file.name}`);
        await uploadBytes(storageRef, file); // Uploading the image to Firebase Storage
        const downloadURL = await getDownloadURL(storageRef); // Get the URL of the uploaded image
        setProfileImage(downloadURL);

        // Update user profile image URL in Firestore
        const userDoc = doc(db, 'users', currentUser.uid); // Use the current user's UID
        await updateDoc(userDoc, { profileImage: downloadURL });
        message.success('Profilbilden har uppdaterats framgångsrikt!');
      } else {
        message.error('Ingen användare inloggad.');
      }
    } catch (error) {
      console.error('Error uploading profile image:', error);
      message.error('Ett fel uppstod vid uppladdning av profilbilden.');
    }
  };

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh', background: '#f0f2f5', padding: '24px' }}>
        <Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Spin size="large" />
        </Content>
      </Layout>
    );
  }

  // Format registration date correctly (convert string to Date)
  const formattedDate = userData.createdAt
    ? new Date(userData.createdAt).toLocaleDateString('sv-SE')
    : 'Ingen information tillgänglig';

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5', padding: '24px' }}>
      <Content
        style={{
          maxWidth: '1200px',
          margin: 'auto',
          padding: '24px',
          background: '#ffffff',
          borderRadius: '15px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
        }}
      >
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          style={{ marginBottom: '16px', fontSize: '18px' }}
        >
          Tillbaka
        </Button>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={16}>
            <Title level={2} style={{ color: '#003a8c', marginBottom: '24px', fontWeight: 'bold' }}>
              {userData.firstName} {userData.lastName}
            </Title>
            <Divider style={{ margin: '20px 0' }} />

            <Card style={{ marginBottom: '20px', padding: '16px' }} bordered={false}>
              <Form form={form} layout="vertical" initialValues={userData} style={{ width: '100%' }}>
                <Form.Item label="Förnamn">
                  <Text style={{ fontSize: '16px', color: '#555' }}>{userData.firstName}</Text>
                </Form.Item>
                <Form.Item label="Efternamn">
                  <Text style={{ fontSize: '16px', color: '#555' }}>{userData.lastName}</Text>
                </Form.Item>
                <Form.Item label="E-postadress">
                  <Text style={{ fontSize: '16px', color: '#555' }}>{userData.email}</Text>
                </Form.Item>
                <Form.Item label="ID-nummer">
                  <Text style={{ fontSize: '16px', color: '#555' }}>{userData.idNumber}</Text>
                </Form.Item>
                <Form.Item label="Telefonnummer">
                  <Text style={{ fontSize: '16px', color: '#555' }}>{userData.phoneNumber}</Text>
                </Form.Item>
                <Form.Item label="Språk">
                  <Text style={{ fontSize: '16px', color: '#555' }}>{userData.language}</Text>
                </Form.Item>
                <Form.Item label="Registreringsdatum">
                  <Text style={{ fontSize: '16px', color: '#555' }}>{formattedDate}</Text>
                </Form.Item>
              </Form>
            </Card>
          </Col>

          <Col xs={24} md={8} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <img
                src={profileImage}
                alt="Profile"
                style={{
                  borderRadius: '50%',
                  width: '200px',
                  height: '200px',
                  objectFit: 'cover',
                  border: '4px solid #f0f2f5',
                  marginBottom: '16px',
                }}
              />
              <Upload showUploadList={false} customRequest={handleUpload}>
                <Button
                  icon={<UploadOutlined />}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#003a8c',
                    color: '#fff',
                    borderRadius: '5px',
                    border: 'none',
                    fontSize: '16px',
                    cursor: 'pointer',
                  }}
                >
                  Byt bild
                </Button>
              </Upload>
            </div>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default Profile;
