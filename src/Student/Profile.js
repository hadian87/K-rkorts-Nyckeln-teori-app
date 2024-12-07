import React, { useEffect, useState } from 'react';
import { Card, Layout, Typography, Spin, Divider, Row, Col, Avatar, Button, Tooltip, message } from 'antd';
import { ArrowLeftOutlined, MailOutlined, PhoneOutlined, IdcardOutlined, GlobalOutlined } from '@ant-design/icons';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { Content } = Layout;

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({});
  const [registrationDate, setRegistrationDate] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (currentUser) {
          const userDoc = doc(db, 'users', currentUser.uid);
          const userSnapshot = await getDoc(userDoc);
          if (userSnapshot.exists()) {
            const data = userSnapshot.data();
            setUserData(data);

            // الحصول على تاريخ التسجيل من metadata
            const creationTime = currentUser.metadata.creationTime;
            if (creationTime) {
              const formattedDate = new Date(creationTime).toLocaleDateString('sv-SE');
              setRegistrationDate(formattedDate);
            } else {
              setRegistrationDate('Ingen information tillgänglig');
            }
          } else {
            setUserData({});
            message.warning('Ingen användardata hittades.');
          }
        } else {
          message.error('Ingen användare är inloggad.');
        }
      } catch (error) {
        console.error('Fel vid hämtning av användardata:', error);
        message.error('Ett fel uppstod vid hämtning av användardata.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <Layout style={styles.layout}>
        <Content style={styles.content}>
          <Spin size="large" />
        </Content>
      </Layout>
    );
  }

  // الحصول على الحرف الأول من الاسم الأول
  const firstLetter = userData.firstName ? userData.firstName.charAt(0).toUpperCase() : '';

  return (
    <Layout style={styles.layout}>
      <Content style={styles.content}>
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          style={styles.backButton}
        >
          Tillbaka
        </Button>

        <Card style={styles.profileCard} bordered={false}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={6} style={styles.avatarCol}>
              <Tooltip title="Klicka för att uppdatera profilbild">
                <Avatar
                  style={styles.avatar}
                  size={150}
                  src={userData.profileImage || null}
                >
                  {!userData.profileImage && firstLetter}
                </Avatar>
              </Tooltip>
            </Col>
            <Col xs={24} md={18}>
              <Title level={2} style={styles.userName}>
                {userData.firstName} {userData.lastName}
              </Title>
              <Divider />
              <Row gutter={[8, 8]}>
                <Col span={24} style={styles.infoRow}>
                  <MailOutlined style={styles.icon} />
                  <Text style={styles.infoText}>{userData.email}</Text>
                </Col>
                <Col span={24} style={styles.infoRow}>
                  <PhoneOutlined style={styles.icon} />
                  <Text style={styles.infoText}>{userData.phoneNumber}</Text>
                </Col>
                <Col span={24} style={styles.infoRow}>
                  <IdcardOutlined style={styles.icon} />
                  <Text style={styles.infoText}>{userData.idNumber}</Text>
                </Col>
                <Col span={24} style={styles.infoRow}>
                  <GlobalOutlined style={styles.icon} />
                  <Text style={styles.infoText}>{userData.language}</Text>
                </Col>
                <Col span={24} style={styles.infoRow}>
                  <Text style={styles.label}>Registreringsdatum:</Text>
                  <Text style={styles.infoText}>{registrationDate}</Text>
                </Col>
              </Row>
            </Col>
          </Row>
        </Card>
      </Content>
    </Layout>
  );
};

const styles = {
  layout: {
    minHeight: '100vh',
    background: '#f0f2f5',
    padding: '24px',
  },
  content: {
    width: '100%',
    maxWidth: '900px',
    margin: 'auto',
    padding: '24px',
  },
  backButton: {
    marginBottom: '16px',
    fontSize: '16px',
    color: '#1890ff',
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: '15px',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
    padding: '24px',
  },
  avatarCol: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#1890ff',
    color: '#ffffff',
    fontSize: '48px',
    cursor: 'pointer',
    transition: 'transform 0.3s',
  },
  userName: {
    textAlign: 'center',
    color: '#003a8c',
    marginBottom: '0',
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '8px',
  },
  icon: {
    fontSize: '18px',
    color: '#1890ff',
    marginRight: '8px',
  },
  label: {
    fontWeight: 'bold',
    marginRight: '8px',
    color: '#003a8c',
  },
  infoText: {
    fontSize: '16px',
    color: '#555555',
  },
};

export default Profile;
