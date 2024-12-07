import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, Typography, Button, Card, Progress, Row, Col } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Content } = Layout;

const ResultPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    correctAnswers,
    totalQuestions,
  } = location.state || {};

  // التأكد من وجود البيانات
  if (totalQuestions === 0) {
    navigate('/student/övningstest');
    return null;
  }

  // حساب النسبة المئوية للنتيجة
  const resultPercentage = Math.round((correctAnswers / totalQuestions) * 100);
  const success = resultPercentage >= 50; // شرط النجاح، يمكن تعديله حسب الحاجة

  // حساب عدد الإجابات الخاطئة
  const incorrectAnswers = totalQuestions - correctAnswers;

  // تعريف الأنماط المضمنة
  const styles = {
    layout: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    },
    content: {
      width: '100%',
      maxWidth: '800px',
    },
    card: {
      padding: '40px 30px',
      borderRadius: '20px',
      backgroundColor: '#ffffff',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
    },
    icon: {
      fontSize: '80px',
    },
    successIcon: {
      color: '#52c41a',
      animation: 'bounce 1s infinite',
    },
    failureIcon: {
      color: '#ff4d4f',
      animation: 'shake 0.5s infinite',
    },
    title: {
      marginTop: '20px',
    },
    successTitle: {
      color: '#52c41a',
    },
    failureTitle: {
      color: '#ff4d4f',
    },
    text: {
      marginTop: '10px',
      fontSize: '18px',
    },
    successText: {
      color: '#0050b3',
    },
    failureText: {
      color: '#ff4d4f',
    },
    progress: {
      marginTop: '30px',
      height: '20px',
      borderRadius: '10px',
    },
    summary: {
      marginTop: '30px',
    },
    summaryCard: {
      textAlign: 'center',
      border: 'none',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    },
    correctCard: {
      backgroundColor: '#e6fffb',
    },
    incorrectCard: {
      backgroundColor: '#fff1f0',
    },
    summaryTitle: {
      color: '#0050b3',
    },
    summaryText: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#0050b3',
    },
    buttons: {
      display: 'flex',
      justifyContent: 'center',
      marginTop: '40px',
    },
    button: {
      backgroundColor: '#1890ff',
      borderColor: '#1890ff',
      borderRadius: '10px',
      padding: '0 30px',
      fontWeight: 'bold',
      fontSize: '18px',
      transition: 'background-color 0.3s ease, transform 0.3s ease',
    },
  };

  return (
    <Layout style={styles.layout}>
      <Content style={styles.content}>
        <Card style={styles.card} bordered={false}>
          <Row gutter={[16, 16]} justify="center" align="middle">
            <Col xs={24} sm={24} md={8} lg={6} xl={6}>
              {success ? (
                <CheckCircleOutlined style={{ ...styles.icon, ...styles.successIcon }} />
              ) : (
                <CloseCircleOutlined style={{ ...styles.icon, ...styles.failureIcon }} />
              )}
            </Col>
            <Col xs={24} sm={24} md={16} lg={18} xl={18}>
              {success ? (
                <>
                  <Title level={2} style={{ ...styles.title, ...styles.successTitle }}>
                    Grattis! 🎉
                  </Title>
                  <Text style={{ ...styles.text, ...styles.successText }}>
                    Du klarade provet med <b>{resultPercentage}%</b> rätt svar.
                  </Text>
                </>
              ) : (
                <>
                  <Title level={2} style={{ ...styles.title, ...styles.failureTitle }}>
                    Tyvärr, du klarade inte provet 😔
                  </Title>
                  <Text style={{ ...styles.text, ...styles.failureText }}>
                    Du svarade rätt på <b>{correctAnswers}</b> av <b>{totalQuestions}</b> frågor.
                  </Text>
                </>
              )}
            </Col>
          </Row>

          <Progress
            percent={resultPercentage}
            status={success ? "success" : "exception"}
            strokeColor={success ? "#52c41a" : "#ff4d4f"}
            style={styles.progress}
          />

          <div style={styles.summary}>
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                <Card style={{ ...styles.summaryCard, ...styles.correctCard }}>
                  <Title level={4} style={{ ...styles.summaryTitle, color: '#52c41a' }}>Rätt Svar</Title>
                  <Text style={styles.summaryText}>{correctAnswers}</Text>
                </Card>
              </Col>
              <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                <Card style={{ ...styles.summaryCard, ...styles.incorrectCard }}>
                  <Title level={4} style={{ ...styles.summaryTitle, color: '#ff4d4f' }}>Fel Svar</Title>
                  <Text style={styles.summaryText}>{incorrectAnswers}</Text>
                </Card>
              </Col>
            </Row>
          </div>

          <div style={styles.buttons}>
            <Button
              type="primary"
              size="large"
              style={styles.button}
              onClick={() => navigate('/student/övningstest')}
            >
              övningstest
            </Button>
          </div>
        </Card>
      </Content>
    </Layout>
  );
};

export default ResultPage;
