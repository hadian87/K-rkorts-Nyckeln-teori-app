// TestPage.js
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { doc, collection, query, where, getDoc, getDocs, addDoc } from 'firebase/firestore';
import { Button, Card, Typography, Layout, Progress, Divider, Modal, message, Spin, Tooltip, Alert } from 'antd';
import {
  StarOutlined,
  StarFilled,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  FileImageOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { getAuth } from 'firebase/auth';
import styled, { createGlobalStyle } from 'styled-components';
import Navbar from './Navbar';

const { Title, Text } = Typography;
const { Content } = Layout;
const { confirm } = Modal;

// Global Styles
const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'Roboto', sans-serif;
    background: linear-gradient(135deg, #e6f7ff, #ffffff);
    margin: 0;
    padding: 0;
  }
`;

// Styled Components for Custom Styling
const StyledLayout = styled(Layout)`
  min-height: 100vh;
`;

const ContentContainer = styled(Content)`
  padding: 40px;
  background: #ffffff;
  margin: 32px;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
`;

const HeaderTitle = styled(Title)`
  color: #1890ff;
  text-align: center;
  margin-bottom: 40px;
  font-family: 'Roboto', sans-serif;
`;

const SpinnerContainer = styled.div`
  text-align: center;
  padding: 50px;
`;

const NoTestsMessage = styled(Text)`
  text-align: center;
  color: #555;
  font-size: 18px;
`;

// StyledCard remains unchanged
const StyledCard = styled(Card)`
  border-radius: 15px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background: linear-gradient(135deg, #f0f4f8, #d9e2ec);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  }
`;

// Components for displaying test info
const TimeText = styled(Text)`
  font-size: 16px;
  color: #1890ff;
  display: flex;
  align-items: center;
`;

const PassingScoreText = styled(Text)`
  font-size: 16px;
  color: #1890ff;
  display: flex;
  align-items: center;
`;

const QuestionCounterText = styled(Text)`
  font-size: 16px;
  color: #1890ff;
  display: flex;
  align-items: center;
`;

// Mark Button remains unchanged
const MarkButton = styled(Button)`
  position: absolute;
  top: 15px;
  right: 15px;
  font-size: 24px;
  color: #0050b3;
`;

// **مكون زر الإجابة (Answer Button) المعدل**
const AnswerButton = styled(Button)`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  text-align: left;
  margin-top: 10px;
  padding: 15px;
  background-color: ${({ isAnswered, isCorrect, isSelected }) => {
    if (isAnswered) {
      if (isSelected && isCorrect) return '#52c41a'; // أخضر للإجابة الصحيحة المختارة
      if (isSelected && !isCorrect) return '#f5222d'; // أحمر للإجابة الخاطئة المختارة
      if (isCorrect) return '#52c41a'; // أخضر للإجابة الصحيحة غير المختارة
    }
    return '#fff'; // الأبيض لباقي الإجابات
  }};
  color: ${({ isAnswered, isSelected }) => {
    if (isAnswered) {
      if (isSelected) return '#fff'; // النص أبيض للإجابات المختارة
      return '#fff'; // النص أبيض للإجابة الصحيحة غير المختارة
    }
    return '#003a8c'; // النص الأزرق للخيارات الافتراضية
  }};
  border: 2px solid #d9d9d9;
  border-radius: 8px;
  font-weight: bold;
  transition: all 0.3s ease;
  padding-left: 40px;
  position: relative;

  &:hover {
    border-color: #40a9ff;
  }
`;

// مكون لعرض الصور في نافذة منبثقة
const ImageModal = styled.img`
  width: 100%;
  max-height: 80vh;
  object-fit: contain;
  border-radius: 8px;
`;

// مكون لعرض نص الشرح
const ExplanationText = styled(Text)`
  font-size: 16px;
  color: #555;
`;

// مكون لعرض صور الشرح
const ExplanationImage = styled.img`
  width: 100%;
  max-width: 250px;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  margin-top: 15px;
`;

const TestPage = () => {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [testSettings, setTestSettings] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState({});
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null); // Time left in seconds
  const timerRef = useRef(null); // Timer reference
  const [markedQuestions, setMarkedQuestions] = useState([]);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [isExplanationVisible, setIsExplanationVisible] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Array of option letters A, B, C, D, E
  const optionLetters = ['A', 'B', 'C', 'D', 'E'];

  // Function to finish the test
  const handleFinishTest = useCallback(async () => {
    try {
      const authInstance = getAuth(); // استخدام getAuth بشكل صحيح
      const currentUser = authInstance.currentUser;

      if (currentUser) {
        const testResultsRef = collection(db, 'testResults');
        await addDoc(testResultsRef, {
          userId: currentUser.uid,
          correctAnswers: correctAnswers,
          totalQuestions: questions.length,
          resultPercentage: Math.round((correctAnswers / questions.length) * 100),
          success: Math.round((correctAnswers / questions.length) * 100) >= testSettings.passingScore,
          date: new Date().toISOString(),
          mainCategoryName: testSettings.mainSection,
          subCategoryName: testSettings.subSection,
          categoryName: testSettings.category,
          testName: testSettings.name,
          questions: questions.map((question, index) => ({
            questionText: question.questionText,
            options: question.options,
            correctAnswer: question.correctAnswer,
            selectedAnswer: selectedAnswer[index] || null,
            images: question.images || [],
            explanation: question.explanation || '',
            explanationImages: question.explanationImages || []
          })),
        });
        message.success('Ditt resultat har sparats!');
      } else {
        message.error('Ingen användare inloggad.');
      }
    } catch (error) {
      console.error('Fel vid sparning av resultat:', error);
      message.error('Fel vid sparning av resultat.');
    }

    navigate('/student/result', {
      state: {
        correctAnswers: correctAnswers,
        totalQuestions: questions.length,
        resultPercentage: Math.round((correctAnswers / questions.length) * 100),
        success: Math.round((correctAnswers / questions.length) * 100) >= testSettings.passingScore,
        mainCategoryName: testSettings.mainSection,
        subCategoryName: testSettings.subSection,
        categoryName: testSettings.category,
        testName: testSettings.name,
      },
    });
  }, [correctAnswers, questions, selectedAnswer, testSettings, navigate]);

  // Function to fetch test data
  const fetchTestData = useCallback(async () => {
    try {
      const testRef = doc(db, 'tests', testId);
      const testSnapshot = await getDoc(testRef);
      if (testSnapshot.exists()) {
        const data = testSnapshot.data();
        setTestSettings(data);

        setTimeLeft(data.duration * 60); // Set time left based on test settings

        const questionsRef = collection(db, 'questions');
        const q = query(
          questionsRef,
          where('mainSection', '==', data.mainSection),
          where('subSection', '==', data.subSection),
          where('category', '==', data.category)
        );
        const querySnapshot = await getDocs(q);
        let questionsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const shuffledQuestions = questionsData.sort(() => Math.random() - 0.5).slice(0, data.totalQuestions);
        setQuestions(shuffledQuestions);
      } else {
        message.error('Testet hittades inte.');
      }
    } catch (error) {
      console.error('Fel vid hämtning av testdata:', error);
      message.error('Fel vid hämtning av testdata.');
    } finally {
      setLoading(false);
    }
  }, [testId]);

  useEffect(() => {
    fetchTestData();
  }, [fetchTestData]);

  // Setup timer
  useEffect(() => {
    if (timeLeft !== null && timerRef.current === null) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime === 0) {
            clearInterval(timerRef.current);
            timerRef.current = null;
            handleFinishTest();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [handleFinishTest, timeLeft]);

  const handleAnswerSelection = (answer) => {
    if (!selectedAnswer[currentQuestionIndex]) {
      setSelectedAnswer((prevAnswers) => ({
        ...prevAnswers,
        [currentQuestionIndex]: answer,
      }));
      const currentQuestion = questions[currentQuestionIndex];
      if (answer === currentQuestion.correctAnswer) {
        setCorrectAnswers((prevCorrect) => prevCorrect + 1);
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    } else {
      handleFinishTest();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
    }
  };

  const toggleMarkQuestion = () => {
    if (markedQuestions.includes(currentQuestionIndex)) {
      setMarkedQuestions(markedQuestions.filter((index) => index !== currentQuestionIndex));
    } else {
      setMarkedQuestions([...markedQuestions, currentQuestionIndex]);
    }
  };

  const handleExitTest = () => {
    confirm({
      title: 'Är du säker på att du vill avsluta testet?',
      icon: <ExclamationCircleOutlined />,
      content: 'Om du lämnar nu kommer testet att betraktas som ofullständigt och dina framsteg sparas inte.',
      okText: 'Ja, avsluta',
      okType: 'danger',
      cancelText: 'Nej, stanna',
      onOk() {
        // Clean up timer if running
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        const mainSectionId = testSettings.mainSection; 
        const subSectionId = testSettings.subSection;
        navigate(`/student/tests/${mainSectionId}/${subSectionId}`);
      },
    });
  };

  const handleImageClick = (image) => {
    setModalImage(image);
    setIsImageModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsImageModalVisible(false);
    setModalImage(null);
  };

  const handleExplanationClick = () => {
    setIsExplanationVisible(true);
  };

  const handleCloseExplanation = () => {
    setIsExplanationVisible(false);
  };

  // Function to close Snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) return (
    <StyledLayout>
      <Navbar />
      <Layout style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' }}>
        <SpinnerContainer>
          <Spin size="large" tip="Laddar test..." />
        </SpinnerContainer>
      </Layout>
    </StyledLayout>
  );

  if (!testSettings || questions.length === 0) return (
    <StyledLayout>
      <Navbar />
      <Layout style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' }}>
        <NoTestsMessage>Inga testinställningar eller frågor hittades.</NoTestsMessage>
      </Layout>
    </StyledLayout>
  );

  const currentQuestion = questions[currentQuestionIndex];
  const isAnswered = selectedAnswer[currentQuestionIndex] !== undefined;
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <>
      <GlobalStyle />
      <StyledLayout>
        <Navbar />

        <Layout style={{ padding: '24px', background: '#f0f2f5' }}>
          <ContentContainer>
            <HeaderTitle level={2}>{testSettings.name}</HeaderTitle>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              {/* Display remaining time */}
              <TimeText>
                <ClockCircleOutlined style={{ marginRight: '8px' }} />
                Tid kvar: {timeLeft !== null ? Math.floor(timeLeft / 60) : 0}:{timeLeft !== null ? String(timeLeft % 60).padStart(2, '0') : '00'}
              </TimeText>
              {/* Display passing score */}
              <PassingScoreText>
                <CheckCircleOutlined style={{ marginRight: '8px' }} />
                Godkänd: {testSettings.passingScore}%
              </PassingScoreText>
              {/* Display question counter */}
              <QuestionCounterText>
                <InfoCircleOutlined style={{ marginRight: '8px' }} />
                Fråga {currentQuestionIndex + 1} av {questions.length}
              </QuestionCounterText>
              {/* Exit Test Button */}
              <Button type="primary" danger onClick={handleExitTest} icon={<ExclamationCircleOutlined />}>
                Avsluta test
              </Button>
            </div>

            <Divider />

            {/* Progress Bar */}
            <Progress percent={progress} status="active" strokeColor="#1890ff" showInfo={false} />

            {/* Current Question Card */}
            {currentQuestion && (
              <StyledCard bordered={false}>
                {/* Mark as Favorite Button */}
                <Tooltip title={markedQuestions.includes(currentQuestionIndex) ? "Avmarkera fråga" : "Markera fråga"}>
                  <MarkButton
                    type="text"
                    icon={markedQuestions.includes(currentQuestionIndex) ? <StarFilled style={{ color: '#ffd700' }} /> : <StarOutlined />}
                    onClick={toggleMarkQuestion}
                  />
                </Tooltip>

                {/* Question Title */}
                <Title level={4} style={{ color: '#1890ff' }}>
                  {currentQuestionIndex + 1}. {currentQuestion.questionText}
                </Title>

                {/* Question Images */}
                {currentQuestion.images && currentQuestion.images.length > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
                    {currentQuestion.images.map((image, index) => (
                      <div key={index} style={{ position: 'relative' }}>
                        <img
                          src={image}
                          alt={`Fråga ${index + 1}`}
                          style={{
                            width: '100%',
                            maxWidth: '250px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            cursor: 'pointer',
                          }}
                          onClick={() => handleImageClick(image)}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                        <FileImageOutlined style={{ position: 'absolute', top: '8px', left: '8px', color: '#fff', fontSize: '24px', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '50%' }} />
                      </div>
                    ))}
                  </div>
                )}

                {/* Answer Options */}
                {currentQuestion.options.map((option, idx) => {
                  const letter = optionLetters[idx];
                  const isSelected = selectedAnswer[currentQuestionIndex] === option;
                  const isCorrect = option === currentQuestion.correctAnswer;

                  return (
                    <AnswerButton
                      key={idx}
                      onClick={() => handleAnswerSelection(option)}
                      disabled={isAnswered}
                      isAnswered={isAnswered}
                      isCorrect={isCorrect}
                      isSelected={isSelected}
                      type="text" // Use type="text" to allow custom background colors
                    >
                      {/* Conditionally render icons based on answer state */}
                      {isAnswered && isCorrect && (
                        <CheckCircleOutlined style={{ marginRight: '10px', fontSize: '20px' }} />
                      )}
                      {isAnswered && isSelected && !isCorrect && (
                        <ExclamationCircleOutlined style={{ marginRight: '10px', fontSize: '20px' }} />
                      )}
                      <span style={{
                        fontWeight: 'bold',
                        color: isAnswered && isSelected ? '#fff' : '#1890ff',
                        marginRight: '10px',
                      }}>
                        {letter}
                      </span>
                      {option}
                    </AnswerButton>
                  );
                })}

                {/* Navigation Buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', flexWrap: 'wrap', gap: '10px' }}>
                  <Button 
                    onClick={handlePreviousQuestion} 
                    disabled={currentQuestionIndex === 0} 
                    icon={<ArrowLeftOutlined />}
                  >
                    Föregående
                  </Button>
                  {currentQuestion.explanation && isAnswered && (
                    <Button 
                      type="default" 
                      onClick={handleExplanationClick} 
                      style={{ backgroundColor: '#fffb8f' }} 
                      icon={<InfoCircleOutlined />}
                    >
                      Förklaring
                    </Button>
                  )}
                  <Button 
                    type="primary" 
                    onClick={handleNextQuestion} 
                    icon={<ArrowRightOutlined />}
                  >
                    {currentQuestionIndex === questions.length - 1 ? 'Avsluta' : 'Nästa'}
                  </Button>
                </div>
              </StyledCard>
            )}

            {/* Image Modal */}
            <Modal
              visible={isImageModalVisible}
              onCancel={handleCloseModal}
              footer={null}
              centered
              width={800}
              bodyStyle={{ padding: '0' }}
            >
              <ImageModal src={modalImage} alt="Förstorad" />
            </Modal>

            {/* Explanation Modal */}
            <Modal
              visible={isExplanationVisible}
              onCancel={handleCloseExplanation}
              footer={null}
              centered
              width={800}
            >
              <div style={{ padding: '20px' }}>
                <Title level={4} style={{ color: '#1890ff' }}>Förklaring</Title>
                <ExplanationText>{currentQuestion.explanation}</ExplanationText>
                {currentQuestion.explanationImages && currentQuestion.explanationImages.length > 0 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '10px',
                    flexWrap: 'wrap',
                    marginTop: '15px'
                  }}>
                    {currentQuestion.explanationImages.map((img, idx) => (
                      <ExplanationImage
                        key={idx}
                        src={img}
                        alt={`Förklaring ${idx + 1}`}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </Modal>

            {/* Snackbar for messages */}
            <Modal
              visible={snackbar.open}
              onCancel={handleCloseSnackbar}
              footer={null}
              centered
              destroyOnClose
            >
              <Alert 
                onClose={handleCloseSnackbar} 
                type={snackbar.severity} 
                showIcon
              >
                {snackbar.message}
              </Alert>
            </Modal>
          </ContentContainer>
        </Layout>
      </StyledLayout>
    </>
  );
};

export default TestPage;
