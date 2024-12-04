import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { doc, collection, query, where, getDoc, getDocs, addDoc } from 'firebase/firestore';
import { Button, Card, Typography, Layout, Progress, Divider, Modal, message } from 'antd';
import { StarOutlined, StarFilled, ExclamationCircleOutlined } from '@ant-design/icons';
import { getAuth } from 'firebase/auth';

const { Title, Text } = Typography;
const { Content } = Layout;
const { confirm } = Modal;

const TestPage = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [testSettings, setTestSettings] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(() => parseInt(localStorage.getItem('currentQuestionIndex')) || 0);
  const [selectedAnswer, setSelectedAnswer] = useState(() => JSON.parse(localStorage.getItem('selectedAnswers')) || {});
  const [correctAnswers, setCorrectAnswers] = useState(() => parseInt(localStorage.getItem('correctAnswers')) || 0);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(() => parseInt(localStorage.getItem('timeLeft')) || null);
  const [timer, setTimer] = useState(null);
  const [markedQuestions, setMarkedQuestions] = useState([]);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [isExplanationVisible, setIsExplanationVisible] = useState(false);

  useEffect(() => {
    const fetchTestData = async () => {
      try {
        const testRef = doc(db, 'tests', testId);
        const testSnapshot = await getDoc(testRef);
        if (testSnapshot.exists()) {
          const data = testSnapshot.data();
          setTestSettings(data);
          if (!timeLeft) {
            setTimeLeft(data.duration * 60); // Set timer duration
          }

          // Fetch questions related to the main section, sub-section, and category
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

          // Randomize and slice questions
          questionsData = questionsData.sort(() => Math.random() - 0.5).slice(0, data.totalQuestions);
          setQuestions(questionsData);
        }
      } catch (error) {
        console.error("Error fetching test data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestData();
  }, [testId]);

  useEffect(() => {
    if (timeLeft !== null) {
      const countdown = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime === 0) {
            clearInterval(countdown);
            handleFinishTest(); // Time is up
            return 0;
          }
          localStorage.setItem('timeLeft', prevTime - 1);
          return prevTime - 1;
        });
      }, 1000);
      setTimer(countdown);
    }

    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    localStorage.setItem('currentQuestionIndex', currentQuestionIndex);
    localStorage.setItem('correctAnswers', correctAnswers);
    localStorage.setItem('selectedAnswers', JSON.stringify(selectedAnswer));
  }, [currentQuestionIndex, correctAnswers, selectedAnswer]);

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

  const handleFinishTest = async () => {
    localStorage.removeItem('currentQuestionIndex');
    localStorage.removeItem('correctAnswers');
    localStorage.removeItem('timeLeft');
    localStorage.removeItem('selectedAnswers');

    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (currentUser) {
        const testResultsRef = collection(db, 'testResults');
        await addDoc(testResultsRef, {
          userId: currentUser.uid,
          correctAnswers: correctAnswers,
          totalQuestions: questions.length,
          resultPercentage: Math.round((correctAnswers / questions.length) * 100),
          success: Math.round((correctAnswers / questions.length) * 100) >= 50,
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
            images: question.images || [], // Add images to the results
          })),
        });
        console.log('Test result saved!');
        message.success('Test result saved!');
      } else {
        console.error('No user logged in.');
        message.error('No user logged in.');
      }
    } catch (error) {
      console.error('Error saving test result:', error);
      message.error('Error saving test result.');
    }

    navigate('/student/result', {
      state: {
        correctAnswers: correctAnswers,
        totalQuestions: questions.length,
        resultPercentage: Math.round((correctAnswers / questions.length) * 100),
        success: Math.round((correctAnswers / questions.length) * 100) >= 50,
        mainCategoryName: testSettings.mainSection,
        subCategoryName: testSettings.subSection,
        categoryName: testSettings.category,
        testName: testSettings.name,
      },
    });
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
      title: 'Are you sure you want to exit the test?',
      icon: <ExclamationCircleOutlined />,
      content: 'If you leave now, the test will be considered incomplete and your progress will not be saved.',
      okText: 'Yes, exit',
      okType: 'danger',
      cancelText: 'No, stay',
      onOk() {
        localStorage.removeItem('currentQuestionIndex');
        localStorage.removeItem('correctAnswers');
        localStorage.removeItem('timeLeft');
        localStorage.removeItem('selectedAnswers');
        navigate('/student/tests/oW4IpZqamd9SI8V6muPC/EE46IZydsuJYtF6Lpdov');
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

  if (loading) return <p>Loading...</p>;
  if (!testSettings || questions.length === 0) return <p>No test settings or questions found.</p>;

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <Layout style={{ minHeight: '100vh', background: '#e6f7ff', padding: '24px' }}>
      <Content style={{ background: '#f0f5ff', padding: '24px', borderRadius: '10px', boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)' }}>
        <Title level={2} style={{ color: '#003a8c', textAlign: 'center', marginBottom: '20px' }}>{testSettings.name}</Title>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <Text style={{ fontSize: '16px', color: '#0050b3' }}>⏳ Time left: {Math.floor(timeLeft / 60)}:{timeLeft % 60}</Text>
          <Text style={{ fontSize: '16px', color: '#0050b3' }}>🏆 Passing score: {testSettings.passingScore}%</Text>
          <Text style={{ fontSize: '16px', color: '#0050b3' }}>📋 Question {currentQuestionIndex + 1} of {questions.length}</Text>
          <Button type="primary" danger onClick={handleExitTest}>
            Exit Test
          </Button>
        </div>

        <Divider />

        <Progress percent={progress} status="active" strokeColor="#1890ff" showInfo={false} />

        {currentQuestion && (
          <Card style={{ position: 'relative', marginTop: '20px', padding: '20px', borderRadius: '15px', boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)' }}>
            <Button
              type="text"
              icon={markedQuestions.includes(currentQuestionIndex) ? <StarFilled style={{ color: '#ffd700' }} /> : <StarOutlined />}
              onClick={toggleMarkQuestion}
              style={{ position: 'absolute', top: '15px', right: '15px', fontSize: '24px', color: '#0050b3' }}
            />
            <Title level={4} style={{ color: '#003a8c' }}>
              {currentQuestionIndex + 1}. {currentQuestion.questionText}
            </Title>

            {currentQuestion.images && currentQuestion.images.length > 0 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '10px',
                flexWrap: 'wrap',
                marginBottom: '15px'
              }}>
                {currentQuestion.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Question ${index + 1}`}
                    style={{
                      width: '100%',
                      maxWidth: '250px',
                      objectFit: 'contain',
                      borderRadius: '8px',
                      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleImageClick(image)}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ))}
              </div>
            )}

            {currentQuestion.options.map((option, index) => (
              <Button
                key={index}
                onClick={() => handleAnswerSelection(option)}
                disabled={!!selectedAnswer[currentQuestionIndex]}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  textAlign: 'left',
                  marginTop: '10px',
                  padding: '15px',
                  backgroundColor: selectedAnswer[currentQuestionIndex]
                    ? option === currentQuestion.correctAnswer
                      ? '#4caf50'
                      : option === selectedAnswer[currentQuestionIndex]
                      ? '#f5222d'
                      : '#fff'
                    : '#fff',
                  color: selectedAnswer[currentQuestionIndex] === option ? '#fff' : '#003a8c',
                  border: '2px solid #d9d9d9',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease',
                  paddingLeft: '40px',
                  boxShadow: selectedAnswer[currentQuestionIndex] && option === currentQuestion.correctAnswer ? '0 0 10px rgba(72, 201, 176, 0.6)' : 'none',
                }}
              >
                <span style={{ fontWeight: 'bold', color: '#666', position: 'absolute', left: '10px' }}>
                  {index + 1}
                </span>
                {option}
                {selectedAnswer[currentQuestionIndex] && option === currentQuestion.correctAnswer && (
                  <span style={{ marginLeft: '10px', color: 'green' }}>✅</span>
                )}
                {selectedAnswer[currentQuestionIndex] && option !== currentQuestion.correctAnswer && option === selectedAnswer[currentQuestionIndex] && (
                  <span style={{ marginLeft: '10px', color: 'white' }}>❌</span>
                )}
              </Button>
            ))}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
              <Button onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0}>
                Previous
              </Button>
              {currentQuestion.explanation && selectedAnswer[currentQuestionIndex] && (
                <Button type="default" onClick={handleExplanationClick} style={{ backgroundColor: '#ffeb3b' }}>
                  Explanation
                </Button>
              )}
              <Button type="primary" onClick={handleNextQuestion}>
                {currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next'}
              </Button>
            </div>
          </Card>
        )}
      </Content>

      <Modal visible={isImageModalVisible} footer={null} onCancel={handleCloseModal} centered>
        <img src={modalImage} alt="Enlarged" style={{ width: '100%' }} />
      </Modal>

      <Modal visible={isExplanationVisible} footer={null} onCancel={handleCloseExplanation} centered>
        <div style={{ padding: '20px' }}>
          <Title level={4}>Explanation</Title>
          <Text>{currentQuestion.explanation}</Text>
          {currentQuestion.explanationImages && currentQuestion.explanationImages.length > 0 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '10px',
              flexWrap: 'wrap',
              marginTop: '15px'
            }}>
              {currentQuestion.explanationImages.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Explanation ${index + 1}`}
                  style={{
                    width: '100%',
                    maxWidth: '250px',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                  }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ))}
            </div>
          )}
        </div>
      </Modal>
    </Layout>
  );
};

export default TestPage;
