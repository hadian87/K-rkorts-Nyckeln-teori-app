import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { List, Typography, Card, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const notificationsRef = collection(db, 'notifications');
    const q = query(notificationsRef, orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotifications(notificationsData);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Card
      title={
        <>
          <Button
            type="link"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            style={{ marginBottom: '16px' }}
          >
            Tillbaka
          </Button>
          <Title level={3} style={{ display: 'inline-block', marginLeft: '16px' }}>Notifikationer</Title>
        </>
      }
      style={{
        margin: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        backgroundColor: '#f9fafb',
      }}
    >
      <List
        dataSource={notifications}
        renderItem={(item) => (
          <List.Item
            style={{
              backgroundColor: '#fff',
              borderRadius: '8px',
              padding: '15px',
              marginBottom: '10px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
            }}
          >
            <List.Item.Meta
              title={<Title level={5} style={{ margin: 0 }}>{item.title}</Title>}
              description={
                <>
                  <Text style={{ fontSize: '14px' }}>{item.content}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {new Date(item.timestamp?.seconds * 1000).toLocaleString()}
                  </Text>
                </>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default Notifications;
