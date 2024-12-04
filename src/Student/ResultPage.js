import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, Typography, Button, Card } from 'antd';
import { SmileOutlined, FrownOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Content } = Layout;

const ResultPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    correctAnswers,
    totalQuestions,
    mainCategoryName,
    subCategoryName,
    categoryName,
    testName,
  } = location.state || {};

  // Calculating the result as a percentage
  const resultPercentage = Math.round((correctAnswers / totalQuestions) * 100);
  const success = resultPercentage >= 50; // Success condition, can be adjusted as desired

  return (
    <Layout
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(to right, #6a11cb, #2575fc)',
        padding: '24px',
      }}
    >
      <Content
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
        }}
      >
        <Card
          style={{
            maxWidth: '600px',
            width: '100%',
            padding: '40px',
            borderRadius: '20px',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
            backgroundColor: '#ffffff',
          }}
        >
          {success ? (
            <>
              <SmileOutlined
                style={{ fontSize: '80px', color: '#52c41a', marginBottom: '20px' }}
              />
              <Title level={2} style={{ color: '#003a8c' }}>
                Grattis! 🎉
              </Title>
              <Text style={{ fontSize: '18px', color: '#0050b3' }}>
                Du klarade provet! <br />
                Du svarade rätt på <b>{correctAnswers}</b> av <b>{totalQuestions}</b> frågor.
              </Text>
            </>
          ) : (
            <>
              <FrownOutlined
                style={{ fontSize: '80px', color: '#ff4d4f', marginBottom: '20px' }}
              />
              <Title level={2} style={{ color: '#ff4d4f' }}>
                Tyvärr, du klarade inte provet 😔
              </Title>
              <Text style={{ fontSize: '18px', color: '#0050b3' }}>
                Du svarade rätt på <b>{correctAnswers}</b> av <b>{totalQuestions}</b> frågor.
              </Text>
            </>
          )}
          <Button
            type="primary"
            size="large"
            style={{
              marginTop: '40px',
              backgroundColor: '#2575fc',
              borderColor: '#2575fc',
              borderRadius: '10px',
              padding: '0 30px',
              fontWeight: 'bold',
            }}
            onClick={() => navigate('/student/övningstest')}
          >
            Gå till dashboard
          </Button>
        </Card>
      </Content>
    </Layout>
  );
};

export default ResultPage;
