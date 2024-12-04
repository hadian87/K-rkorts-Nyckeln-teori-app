import React, { useEffect, useState } from 'react';
import { Layout, Typography, Spin, Card, Row, Col, message, Empty, Progress, Button } from 'antd';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title as ChartTitle, Tooltip, Legend } from 'chart.js';
import { Divider } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTitle, Tooltip, Legend);

const { Title, Text } = Typography;
const { Content } = Layout;

const PerformanceAnalysis = () => {
  const [loading, setLoading] = useState(true);
  const [testResults, setTestResults] = useState([]);
  const [averageScore, setAverageScore] = useState(0);
  const [passPercentage, setPassPercentage] = useState(0);
  const [chartData, setChartData] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchTestResults = async () => {
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;

        if (currentUser) {
          const resultsRef = collection(db, 'testResults');
          const q = query(resultsRef, where('userId', '==', currentUser.uid));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            let results = [];
            let totalScore = 0;
            let passedTests = 0;
            let correctAnswers = 0;
            let wrongAnswers = 0;

            for (const docSnapshot of querySnapshot.docs) {
              const data = docSnapshot.data();

              // Fetch main category name
              let mainCategoryName = '';
              if (data.mainCategoryName) {
                const mainCategoryRef = doc(db, 'mainCategories', data.mainCategoryName);
                const mainCategorySnapshot = await getDoc(mainCategoryRef);
                if (mainCategorySnapshot.exists()) {
                  mainCategoryName = mainCategorySnapshot.data().name;
                } else {
                  mainCategoryName = 'Huvudkategori namn kunde inte hämtas';
                }
              }

              // Fetch sub category name
              let subCategoryName = '';
              if (data.categoryName) {
                const subCategoryRef = doc(db, 'subCategories', data.categoryName);
                const subCategorySnapshot = await getDoc(subCategoryRef);
                if (subCategorySnapshot.exists()) {
                  subCategoryName = subCategorySnapshot.data().name;
                } else {
                  subCategoryName = 'Underkategori namn kunde inte hämtas';
                }
              }

              results.push({
                id: docSnapshot.id,
                ...data,
                mainCategoryName,
                subCategoryName,
              });

              totalScore += data.resultPercentage;

              if (data.success) {
                passedTests += 1;
              }

              correctAnswers += data.correctAnswers;
              wrongAnswers += data.questions.length - data.correctAnswers;
            }

            setTestResults(results);
            setAverageScore(totalScore / results.length);
            setPassPercentage((passedTests / results.length) * 100);
            setChartData({
              labels: ['Rätta svar', 'Felaktiga svar'],
              datasets: [
                {
                  label: 'Antal svar',
                  data: [correctAnswers, wrongAnswers],
                  backgroundColor: ['#4caf50', '#f44336'],
                },
              ],
            });
          } else {
            setTestResults([]);
            setAverageScore(0);
            setPassPercentage(0);
          }
        } else {
          message.error('Ingen användare är inloggad.');
        }
      } catch (error) {
        console.error('Fel vid hämtning av testresultaten:', error);
        message.error('Ett fel uppstod vid hämtning av testresultaten.');
      } finally {
        setLoading(false);
      }
    };

    fetchTestResults();
  }, []);

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh', background: '#f0f2f5', padding: '24px' }}>
        <Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Spin size="large" />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5', padding: '24px' }}>
      <Content style={{ maxWidth: '1200px', margin: 'auto', padding: '24px', background: '#ffffff', borderRadius: '15px', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)' }}>
        <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate('/student/övningstest')} style={{ marginBottom: '16px' }}>
          Tillbaka
        </Button>

        <Title level={2} style={{ color: '#003a8c', textAlign: 'center', marginBottom: '24px' }}>
          Prestationsanalys
        </Title>

        {testResults.length > 0 ? (
          <>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Card bordered={false} style={{ textAlign: 'center', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
                  <Title level={3}>Genomsnittligt resultat</Title>
                  <Text>{averageScore.toFixed(2)}%</Text>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card bordered={false} style={{ textAlign: 'center', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
                  <Title level={3}>Andel godkända tester</Title>
                  <Progress type="circle" percent={passPercentage.toFixed(2)} />
                </Card>
              </Col>
            </Row>

            <Divider />

            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
              <Col span={24}>
                <Card bordered={false} style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
                  <Title level={3} style={{ textAlign: 'center' }}>Analys av svar</Title>
                  {chartData && <Bar data={chartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />}
                </Card>
              </Col>
            </Row>

            <Title level={3} style={{ marginBottom: '16px' }}>Detaljerad resultatlista</Title>
            <Row gutter={[16, 16]}>
              {testResults.map((item) => (
                <Col xs={24} md={12} key={item.id}>
                  <Card bordered={false} style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', borderRadius: '10px' }}>
                    <Title level={4} style={{ color: '#003a8c' }}>{item.testName}</Title>
                    <Text><strong>Huvudkategori:</strong> {item.mainCategoryName}</Text><br />
                    <Text><strong>Underkategori:</strong> {item.subCategoryName}</Text><br />
                    <Text><strong>Antal frågor:</strong> {item.questions.length}</Text><br />
                    <Text><strong>Rätta svar:</strong> {item.correctAnswers}</Text><br />
                    <Text><strong>Felaktiga svar:</strong> {item.questions.length - item.correctAnswers}</Text><br />
                    <Text><strong>Resultat:</strong> {item.resultPercentage}%</Text><br />
                    <Link to={`/student/test-review/${item.id}`} style={{ color: '#1890ff', marginTop: '10px', display: 'inline-block' }}>Visa detaljer</Link>
                  </Card>
                </Col>
              ))}
            </Row>
          </>
        ) : (
          <Empty description="Inga testresultat hittades." />
        )}
      </Content>
    </Layout>
  );
};

export default PerformanceAnalysis;
