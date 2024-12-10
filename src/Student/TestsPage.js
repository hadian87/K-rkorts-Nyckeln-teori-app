import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Button, Card, Col, Row, Typography, Layout, Spin, message } from 'antd';
import {
  ClockCircleOutlined,
  QuestionCircleOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';
import Navbar from './Navbar'; // Include common navbar

const { Title, Text } = Typography;
const { Content } = Layout;

// Styled Components for Custom Styling
const StyledCard = styled(Card)`
  border-radius: 15px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background: linear-gradient(135deg, #f0f4f8, #d9e2ec);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
  }
`;

const StartButton = styled(Button)`
  width: 100%;
  border-radius: 8px;
  background-color: #1890ff;
  border-color: #1890ff;
  &:hover {
    background-color: #40a9ff;
    border-color: #40a9ff;
  }
  &:focus {
    background-color: #40a9ff;
    border-color: #40a9ff;
  }
`;

// Background for the page
const PageBackground = styled.div`
  background: linear-gradient(135deg, #e6f7ff, #ffffff);
  min-height: 100vh;
`;

// Container for the content
const ContentContainer = styled(Content)`
  padding: 40px;
  background: #ffffff;
  margin: 32px;
  border-radius: 16px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
`;

// Header Title
const HeaderTitle = styled(Title)`
  color: #1890ff;
  text-align: center;
  margin-bottom: 40px;
`;

// Loading Spinner Container
const SpinnerContainer = styled.div`
  text-align: center;
  padding: 50px;
`;

// No Tests Message
const NoTestsMessage = styled(Text)`
  text-align: center;
  color: #555;
  font-size: 18px;
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

  return (
    <PageBackground>
      <Layout style={{ minHeight: '100vh' }}>
        {/* Common navbar */}
        <Navbar />

        {/* Test page content */}
        <Layout>
          <ContentContainer>
            <HeaderTitle level={2}>Översikt över Tester</HeaderTitle>
            {loading ? (
              <SpinnerContainer>
                <Spin size="large" tip="Laddar tester..." />
              </SpinnerContainer>
            ) : (
              <Row gutter={[24, 24]} justify="center">
                {tests.length > 0 ? (
                  tests.map((test) => (
                    <Col key={test.id} xs={24} sm={24} md={12} lg={8}>
                      <StyledCard
                        hoverable
                        cover={
                          test.iconUrl ? (
                            <img
                              alt={`${test.name} ikon`}
                              src={test.iconUrl}
                              style={{ height: '200px', objectFit: 'cover', borderTopLeftRadius: '15px', borderTopRightRadius: '15px' }}
                            />
                          ) : (
                            <div style={{ height: '200px', background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <TrophyOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
                            </div>
                          )
                        }
                      >
                        <Title level={4} style={{ color: '#1890ff' }}>
                          {test.name}
                        </Title>
                        <Row gutter={[8, 8]}>
                          <Col span={24}>
                            <Text>
                              <ClockCircleOutlined style={{ color: '#1890ff', marginRight: '4px' }} />
                              Varaktighet: {test.duration} minuter
                            </Text>
                          </Col>
                          <Col span={24}>
                            <Text>
                              <QuestionCircleOutlined style={{ color: '#1890ff', marginRight: '4px' }} />
                              Frågor: {test.totalQuestions}
                            </Text>
                          </Col>
                          <Col span={24}>
                            <Text>
                              <CheckCircleOutlined style={{ color: '#1890ff', marginRight: '4px' }} />
                              Godkänd poäng: {test.passingScore}%
                            </Text>
                          </Col>
                        </Row>
                        <StartButton
                          type="primary"
                          icon={<TrophyOutlined />}
                          onClick={() => handleStartTest(test.id)}
                        >
                          Starta nu
                        </StartButton>
                      </StyledCard>
                    </Col>
                  ))
                ) : (
                  <NoTestsMessage>Inga tester finns för den valda kategorin.</NoTestsMessage>
                )}
              </Row>
            )}
          </ContentContainer>
        </Layout>
      </Layout>
    </PageBackground>
  );
};

export default TestsPage;
