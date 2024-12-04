import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Button, Card, Col, Row, Typography, Layout, Spin, Tooltip, message, Menu } from 'antd';
import { HomeOutlined, UserOutlined, BellOutlined, BarChartOutlined, TrophyOutlined, ClockCircleOutlined, CheckCircleOutlined, QuestionCircleOutlined, LogoutOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import Navbar from './Navbar'; // Include common navbar

const { Title, Text } = Typography;
const { Content } = Layout;

// Styled Components for Custom Styling
const StyledCard = styled(Card)`
  border-radius: 15px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background: #ffffff;
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.3);
  }
`;

const TestsPage = () => {
  const { mainSectionId, subSectionId } = useParams();
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTests = async () => {
      setLoading(true);
      try {
        if (!mainSectionId || !subSectionId) {
          throw new Error('Saknar huvudsektion eller undersektion ID');
        }

        const testsRef = collection(db, 'tests');
        const q = query(
          testsRef,
          where('mainSection', '==', mainSectionId),
          where('subSection', '==', subSectionId)
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          message.warning('Inga tester hittades för denna kategori.');
        } else {
          let testsData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          // Sort the tests by name
          testsData = testsData.sort((a, b) => a.name.localeCompare(b.name));

          setTests(testsData);
        }
      } catch (error) {
        console.error('Fel vid hämtning av tester:', error);
        message.error('Fel vid hämtning av tester. Försök igen senare.');
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, [mainSectionId, subSectionId]);

  const handleStartTest = async (testId) => {
    try {
      const testRef = doc(db, 'tests', testId);
      const testSnap = await getDoc(testRef);
      if (testSnap.exists()) {
        const testData = testSnap.data();
        const questionsRef = collection(db, 'questions');
        const questionsQuery = query(
          questionsRef,
          where('mainSection', '==', testData.mainSection),
          where('subSection', '==', testData.subSection),
          where('category', '==', testData.category)
        );
        const questionsSnapshot = await getDocs(questionsQuery);
        let questions = questionsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        // Shuffle questions and pick the number of questions based on test settings
        questions = questions.sort(() => 0.5 - Math.random()).slice(0, testData.totalQuestions);

        // Navigate to the test page with selected questions and test settings
        navigate(`/student/test/${testId}`, { state: { questions, testSettings: testData } });
      } else {
        message.error('Testet hittades inte.');
      }
    } catch (error) {
      console.error('Fel vid start av test:', error);
      message.error('Fel vid start av test. Försök igen senare.');
    }
  };

  const handleLogout = () => {
    message.confirm({
      title: 'Är du säker på att du vill logga ut?',
      content: 'Du kommer att omdirigeras till inloggningssidan.',
      okText: 'Ja',
      cancelText: 'Nej',
      onOk: () => {
        navigate('/login');
      },
    });
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Common navbar */}
      <Navbar />

      {/* Test page content */}
      <Layout style={{ padding: '24px' }}>
        <Content
          style={{
            padding: '40px',
            background: '#f0f2f5',
            margin: '32px',
            borderRadius: '16px',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
          }}
        >
          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <Spin size="large" />
            </div>
          ) : (
            <Row gutter={[24, 24]} justify="center">
              {tests.length > 0 ? (
                tests.map((test) => (
                  <Col key={test.id} xs={24} sm={24} md={12} lg={8}>
                    <StyledCard
                      title={<Title level={4} style={{ color: '#003a8c', fontWeight: 'bold' }}>{test.name}</Title>}
                      bordered={false}
                      style={{
                        background: '#ffffff',
                        position: 'relative',
                        boxShadow: '0 12px 20px rgba(0, 0, 0, 0.1)',
                      }}
                      hoverable
                    >
                      <Text style={{ display: 'block', marginBottom: '10px', color: '#555' }}>
                        <ClockCircleOutlined /> Varaktighet: {test.duration} minuter
                      </Text>
                      <Text style={{ display: 'block', marginBottom: '10px', color: '#555' }}>
                        <QuestionCircleOutlined /> Frågor: {test.totalQuestions}
                      </Text>
                      <Text style={{ display: 'block', marginBottom: '15px', color: '#555' }}>
                        <CheckCircleOutlined /> Godkänd poäng: {test.passingScore}%
                      </Text>
                      <Button
                        type="primary"
                        icon={<TrophyOutlined />}
                        size="large"
                        style={{
                          width: '100%',
                          borderRadius: '8px',
                          backgroundColor: '#003a8c',
                          borderColor: '#003a8c',
                        }}
                        onClick={() => handleStartTest(test.id)}
                      >
                        Starta nu
                      </Button>
                    </StyledCard>
                  </Col>
                ))
              ) : (
                <Text style={{ textAlign: 'center', color: '#555', fontSize: '18px' }}>
                  Inga tester finns för den valda kategorin.
                </Text>
              )}
            </Row>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default TestsPage;
