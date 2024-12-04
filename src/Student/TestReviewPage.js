import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Typography, Spin, Card, Divider, List, message, Modal, Button } from 'antd';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const { Title, Text } = Typography;
const { Content } = Layout;

const TestReviewPage = () => {
  const { testResultId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [testResult, setTestResult] = useState(null);
  const [mainCategoryName, setMainCategoryName] = useState('');
  const [subCategoryName, setSubCategoryName] = useState('');
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [modalImage, setModalImage] = useState(null);

  useEffect(() => {
    const fetchTestResult = async () => {
      try {
        // Fetch test result data
        const resultRef = doc(db, 'testResults', testResultId);
        const resultSnapshot = await getDoc(resultRef);

        if (resultSnapshot.exists()) {
          const testData = resultSnapshot.data();
          setTestResult(testData);

          // Fetch main category name using the ID
          if (testData.mainCategoryName) {
            const mainCategoryRef = doc(db, 'mainCategories', testData.mainCategoryName);
            const mainCategorySnapshot = await getDoc(mainCategoryRef);
            if (mainCategorySnapshot.exists()) {
              setMainCategoryName(mainCategorySnapshot.data().name);
            }
          }

          // Fetch sub category name using the ID
          if (testData.subCategoryName) {
            const subCategoryRef = doc(db, 'subCategories', testData.subCategoryName);
            const subCategorySnapshot = await getDoc(subCategoryRef);
            if (subCategorySnapshot.exists()) {
              setSubCategoryName(subCategorySnapshot.data().name);
            }
          }
        } else {
          message.error('Resultatet för testet kunde inte hittas.');
        }
      } catch (error) {
        console.error('Fel vid hämtning av testresultatet:', error);
        message.error('Ett fel uppstod vid hämtning av testresultatet.');
      } finally {
        setLoading(false);
      }
    };

    fetchTestResult();
  }, [testResultId]);

  const handleImageClick = (image) => {
    setModalImage(image);
    setIsImageModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsImageModalVisible(false);
    setModalImage(null);
  };

  // تعديل المسار هنا
  const handleExit = () => {
    navigate('/student/performance-analysis');
  };

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh', background: '#f0f2f5', padding: '24px' }}>
        <Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Spin size="large" />
        </Content>
      </Layout>
    );
  }

  if (!testResult) {
    return (
      <Layout style={{ minHeight: '100vh', background: '#f0f2f5', padding: '24px' }}>
        <Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Text>Inga resultat hittades.</Text>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5', padding: '24px' }}>
      <Content style={{ maxWidth: '1200px', margin: 'auto', padding: '24px', background: '#ffffff', borderRadius: '15px', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)' }}>
        <Title level={2} style={{ color: '#003a8c', textAlign: 'center', marginBottom: '24px' }}>
          Testgenomgång - {testResult.testName}
        </Title>

        {/* عرض أسماء الأقسام الرئيسية والفرعية فقط في حال توفرها */}
        {mainCategoryName && subCategoryName ? (
          <Title level={4} style={{ color: '#003a8c', textAlign: 'center', marginBottom: '24px' }}>
            Huvudsektion: {mainCategoryName} / Undersektion: {subCategoryName}
          </Title>
        ) : (
          <Title level={4} style={{ color: '#003a8c', textAlign: 'center', marginBottom: '24px' }}>
            Laddar sektioner...
          </Title>
        )}

        <Button type="primary" onClick={handleExit} style={{ marginBottom: '16px' }}>
          Tillbaka till Prestandaanalys
        </Button>

        <Divider />

        <Title level={3} style={{ marginBottom: '16px' }}>Detaljerad genomgång av frågor</Title>
        <List
          itemLayout="vertical"
          dataSource={testResult.questions}
          renderItem={(item, index) => (
            <List.Item key={index}>
              <Card style={{ marginBottom: '16px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                <Title level={4} style={{ color: '#003a8c' }}>{index + 1}. {item.questionText}</Title>

                {item.images && item.images.length > 0 && (
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
                    {item.images.map((image, imgIndex) => (
                      <img
                        key={imgIndex}
                        src={image}
                        alt={`Bild för fråga ${index + 1}`}
                        style={{ width: '100%', maxWidth: '300px', height: '200px', objectFit: 'cover', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', cursor: 'pointer' }}
                        onClick={() => handleImageClick(image)}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ))}
                  </div>
                )}

                {item.options.map((option, i) => (
                  <div key={i} style={{
                    padding: '10px',
                    borderRadius: '5px',
                    margin: '5px 0',
                    backgroundColor:
                      option === item.correctAnswer
                        ? '#d4edda' // Grön för rätt svar
                        : option === item.selectedAnswer
                        ? '#f8d7da' // Röd للإجابة الخاطئة التي اختارها المستخدم
                        : '#fff',
                    border: option === item.correctAnswer ? '1px solid #c3e6cb' : '1px solid #d9d9d9',
                    color: option === item.selectedAnswer ? '#721c24' : '#000',
                  }}>
                    {option}
                    {option === item.correctAnswer && (
                      <span style={{ marginLeft: '10px', color: '#155724' }}>✅ Rätt svar</span>
                    )}
                    {option === item.selectedAnswer && option !== item.correctAnswer && (
                      <span style={{ marginLeft: '10px', color: '#721c24' }}>❌ Ditt svar</span>
                    )}
                  </div>
                ))}
              </Card>
            </List.Item>
          )}
        />
      </Content>

      <Modal visible={isImageModalVisible} footer={null} onCancel={handleCloseModal} centered>
        <img src={modalImage} alt="Förstorad bild" style={{ width: '100%', height: 'auto' }} />
      </Modal>
    </Layout>
  );
};

export default TestReviewPage;
