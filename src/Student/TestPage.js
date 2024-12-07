import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { doc, collection, query, where, getDoc, getDocs, addDoc } from 'firebase/firestore';
import { Button, Card, Typography, Layout, Progress, Divider, Modal, message, Spin } from 'antd';
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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState({});
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null); // إعادة تعريف الوقت المتبقي
  const timerRef = useRef(null); // إعادة تعريف المرجع للمؤقت
  const [markedQuestions, setMarkedQuestions] = useState([]);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [isExplanationVisible, setIsExplanationVisible] = useState(false);

  // مصفوفة الأحرف للاختيارات A,B,C,D,E
  const optionLetters = ['A', 'B', 'C', 'D', 'E'];

  // دالة إنهاء الاختبار
  const handleFinishTest = useCallback(async () => {
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

  // دالة جلب بيانات الاختبار
  const fetchTestData = useCallback(async () => {
    try {
      const testRef = doc(db, 'tests', testId);
      const testSnapshot = await getDoc(testRef);
      if (testSnapshot.exists()) {
        const data = testSnapshot.data();
        setTestSettings(data);

        setTimeLeft(data.duration * 60); // ضبط الوقت المتبقي بناءً على إعدادات الاختبار

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

  // إعداد المؤقت
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
        // قم بتنظيف المؤقت إذا كان يعمل
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

  if (loading) return (
    <Layout style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center'}}>
      <Spin size="large" tip="Laddar test..."/>
    </Layout>
  );

  if (!testSettings || questions.length === 0) return <p>Inga testinställningar eller frågor hittades.</p>;

  const currentQuestion = questions[currentQuestionIndex];
  const isAnswered = selectedAnswer[currentQuestionIndex] !== undefined;
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5', padding: '24px' }}>
      <Content style={{ background: '#fff', padding: '24px', borderRadius: '10px', boxShadow: '0 6px 20px rgba(0,0,0,0.1)' }}>
        <Title level={2} style={{ color: '#003a8c', textAlign: 'center', marginBottom: '20px' }}>
          {testSettings.name}
        </Title>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          {/* عرض الوقت المتبقي */}
          <Text style={{ fontSize: '16px', color: '#0050b3' }}>
            ⏳ Tid kvar: {timeLeft !== null ? Math.floor(timeLeft / 60) : 0}:{timeLeft !== null ? String(timeLeft % 60).padStart(2, '0') : '00'}
          </Text>
          <Text style={{ fontSize: '16px', color: '#0050b3' }}>🏆 Godkänd: {testSettings.passingScore}%</Text>
          <Text style={{ fontSize: '16px', color: '#0050b3' }}>📋 Fråga {currentQuestionIndex + 1} av {questions.length}</Text>
          <Button type="primary" danger onClick={handleExitTest}>Avsluta test</Button>
        </div>

        <Divider />

        <Progress percent={progress} status="active" strokeColor="#1890ff" showInfo={false} />

        {currentQuestion && (
          <Card style={{ position: 'relative', marginTop: '20px', padding: '20px', borderRadius: '15px', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>
            <Button
              type="text"
              icon={markedQuestions.includes(currentQuestionIndex) ? <StarFilled style={{ color: '#ffd700' }} /> : <StarOutlined />}
              onClick={toggleMarkQuestion}
              style={{ position: 'absolute', top: '15px', right: '15px', fontSize: '24px', color: '#0050b3' }}
            />
            <Title level={4} style={{ color: '#003a8c' }}>{currentQuestionIndex + 1}. {currentQuestion.questionText}</Title>

            {currentQuestion.images && currentQuestion.images.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
                {currentQuestion.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Fråga ${index + 1}`}
                    style={{
                      width: '100%',
                      maxWidth: '250px',
                      objectFit: 'contain',
                      borderRadius: '8px',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleImageClick(image)}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ))}
              </div>
            )}

            {currentQuestion.options.map((option, idx) => {
              const letter = optionLetters[idx];
              const isSelected = selectedAnswer[currentQuestionIndex] === option;
              const isCorrect = option === currentQuestion.correctAnswer;

              return (
                <Button
                  key={idx}
                  onClick={() => handleAnswerSelection(option)}
                  disabled={isAnswered}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    textAlign: 'left',
                    marginTop: '10px',
                    padding: '15px',
                    backgroundColor: isAnswered
                      ? (isCorrect ? '#4caf50' : (isSelected ? '#f5222d' : '#fff'))
                      : '#fff',
                    color: (isAnswered && isSelected) ? '#fff' : '#003a8c',
                    border: '2px solid #d9d9d9',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease',
                    paddingLeft: '40px',
                    boxShadow: (isAnswered && isCorrect) ? '0 0 10px rgba(72,201,176,0.6)' : 'none',
                    position: 'relative'
                  }}
                >
                  <span style={{
                    fontWeight: 'bold',
                    color: '#666',
                    position: 'absolute',
                    left: '10px'
                  }}>
                    {letter}
                  </span>
                  {option}
                  {isAnswered && isSelected && isCorrect && (
                    <span style={{ marginLeft: '10px', color: 'green' }}>✅</span>
                  )}
                  {isAnswered && isSelected && !isCorrect && (
                    <span style={{ marginLeft: '10px', color: 'white' }}>❌</span>
                  )}
                </Button>
              );
            })}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
              <Button onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0}>Föregående</Button>
              {currentQuestion.explanation && isAnswered && (
                <Button type="default" onClick={handleExplanationClick} style={{ backgroundColor: '#ffeb3b' }}>
                  Förklaring
                </Button>
              )}
              <Button type="primary" onClick={handleNextQuestion}>
                {currentQuestionIndex === questions.length - 1 ? 'Avsluta' : 'Nästa'}
              </Button>
            </div>
          </Card>
        )}
      </Content>

      {/* مودال عرض الصورة المكبرة */}
      <Modal open={isImageModalVisible} footer={null} onCancel={handleCloseModal} centered>
        <img src={modalImage} alt="Förstorad" style={{ width: '100%' }} />
      </Modal>

      {/* مودال عرض الشرح */}
      <Modal open={isExplanationVisible} footer={null} onCancel={handleCloseExplanation} centered>
        <div style={{ padding: '20px' }}>
          <Title level={4}>Förklaring</Title>
          {questions[currentQuestionIndex] && questions[currentQuestionIndex].explanation && (
            <Text>{questions[currentQuestionIndex].explanation}</Text>
          )}
          {questions[currentQuestionIndex] && questions[currentQuestionIndex].explanationImages && questions[currentQuestionIndex].explanationImages.length > 0 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '10px',
              flexWrap: 'wrap',
              marginTop: '15px'
            }}>
              {questions[currentQuestionIndex].explanationImages.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Förklaring ${idx + 1}`}
                  style={{
                    width: '100%',
                    maxWidth: '250px',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
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
