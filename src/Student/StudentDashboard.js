import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Menu, Card, Row, Col, Typography, Modal, Button } from 'antd';
import { HomeOutlined, UserOutlined, BellOutlined, LineChartOutlined, LogoutOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import logo from '../assets/logo.png';
import { db } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

const { Header, Content } = Layout;
const { confirm } = Modal;
const { Title } = Typography;

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [mainCategories, setMainCategories] = useState([]);

  useEffect(() => {
    const fetchMainCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'mainCategories'));
        const categories = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMainCategories(categories);
      } catch (error) {
        console.error("Error fetching main categories:", error);
      }
    };

    fetchMainCategories();
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    confirm({
      title: 'Är du säker på att du vill logga ut?',
      icon: <ExclamationCircleOutlined />,
      content: 'Du kommer att omdirigeras till inloggningssidan.',
      okText: 'Ja',
      okType: 'danger',
      cancelText: 'Nej',
      onOk() {
        navigate('/login');
      },
    });
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      {/* Header */}
      <Header style={{ background: '#fff', padding: '0 16px', display: 'flex', alignItems: 'center', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ marginRight: 'auto' }}>
          <img src={logo} alt="Logotyp" style={{ height: '65px' }} />
        </div>
        <Menu mode="horizontal" defaultSelectedKeys={['övningstest']} style={{ flexGrow: 1, justifyContent: 'center', borderBottom: 'none' }}>
          <Menu.Item key="övningstest" icon={<HomeOutlined />} onClick={() => handleNavigation('/student/övningstest')}>
            Övningstest
          </Menu.Item>
          <Menu.Item key="profile" icon={<UserOutlined />} onClick={() => handleNavigation('/student/profile')}>
            Profil
          </Menu.Item>
          <Menu.Item key="notifications" icon={<BellOutlined />} onClick={() => handleNavigation('/student/notifications')}>
            Notifikationer
          </Menu.Item>
          <Menu.Item key="performance-analysis" icon={<LineChartOutlined />} onClick={() => handleNavigation('/student/performance-analysis')}>
            Prestandaanalys
          </Menu.Item>
        </Menu>
        <Button
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          style={{ backgroundColor: 'transparent', color: '#ff4d4f', border: 'none', cursor: 'pointer', marginLeft: '16px' }}
        >
          Logga ut
        </Button>
      </Header>

      {/* Övningstest Content */}
      <Content style={{ margin: '16px', padding: '24px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
        <Row gutter={[16, 16]} justify="center">
          {mainCategories.map((category) => (
            <Col key={category.id} xs={24} sm={12} md={8}>
              <Card
                hoverable
                style={{
                  textAlign: 'center',
                  borderRadius: '8px',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
                  backgroundColor: '#f7f7f7',
                  padding: '20px',
                }}
                onClick={() => handleNavigation(`/student/subcategories/${category.id}`)}
              >
                <div style={{ marginBottom: '15px' }}>
                  <img
                    src={category.iconUrl || logo} // Use iconUrl from the database if available
                    alt={`${category.name} icon`}
                    style={{ height: '60px', marginBottom: '10px' }}
                  />
                </div>
                <Title level={4} style={{ color: '#333', fontWeight: 'bold' }}>
                  {category.name}
                </Title>
              </Card>
            </Col>
          ))}
        </Row>
      </Content>
    </Layout>
  );
};

export default StudentDashboard;
