// ManageNotifications.js
import React, { useState } from 'react';
import { Button, Input, Select, Card, Typography, message } from 'antd';
import { sendNotificationToFirebase } from '../../utils/firebaseUtils'; // Vi kommer att lägga till den här funktionen senare för att skicka meddelandet till Firebase

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const ManageNotifications = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [target, setTarget] = useState('all'); // standard: skicka till alla studenter

  const handleSendNotification = async () => {
    if (!title || !content) {
      message.error('Vänligen fyll i alla fält innan du skickar ett meddelande.');
      return;
    }

    try {
      await sendNotificationToFirebase({ title, content, target });
      message.success('Meddelandet skickades framgångsrikt!');
    } catch (error) {
      console.error('Fel vid skickning av meddelande:', error);
      message.error('Misslyckades med att skicka meddelandet.');
    }
  };

  return (
    <Card title={<Title level={3}>Hantera Meddelanden</Title>} style={{ margin: '20px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <Input
        placeholder="Meddelandets titel"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ marginBottom: '15px' }}
      />
      <TextArea
        placeholder="Meddelandets innehåll"
        rows={4}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        style={{ marginBottom: '15px' }}
      />
      <Select
        defaultValue="all"
        onChange={(value) => setTarget(value)}
        style={{ width: '100%', marginBottom: '15px' }}
      >
        <Option value="all">Alla Studenter</Option>
        <Option value="specific">Specifik Student</Option>
      </Select>
      <Button type="primary" onClick={handleSendNotification} style={{ width: '100%' }}>
        Skicka Meddelande
      </Button>
    </Card>
  );
};

export default ManageNotifications;
