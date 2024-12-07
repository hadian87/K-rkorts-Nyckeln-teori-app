import React, { useEffect, useState } from 'react';
import { Layout, Typography, Spin, Card, Row, Col, message, Empty, Progress, Button, Tooltip } from 'antd';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title as ChartTitle, Tooltip as ChartTooltip, Legend } from 'chart.js';
import { Divider } from 'antd';
import { ArrowLeftOutlined, LineChartOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTitle, ChartTooltip, Legend);

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

              // Hämta huvudkategorinamnet
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

              // Hämta underkategorinamnet
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
      <Layout style={styles.layout}>
        <Content style={styles.content}>
          <Spin size="large" />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={styles.layout}>
      <Content style={styles.content}>
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/student/övningstest')}
          style={styles.backButton}
        >
          Tillbaka
        </Button>

        <Title level={2} style={styles.title}>
          Prestationsanalys
        </Title>

        {testResults.length > 0 ? (
          <>
            <Row gutter={[24, 24]}>
              <Col xs={24} md={12}>
                <Card style={styles.card} bordered={false}>
                  <Row align="middle">
                    <Col span={6}>
                      <Tooltip title="Genomsnittligt resultat">
                        <LineChartOutlined style={styles.icon} />
                      </Tooltip>
                    </Col>
                    <Col span={18}>
                      <Title level={4} style={styles.cardTitle}>
                        Genomsnittligt resultat
                      </Title>
                      <Text style={styles.cardText}>{averageScore.toFixed(2)}%</Text>
                    </Col>
                  </Row>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card style={styles.card} bordered={false}>
                  <Row align="middle">
                    <Col span={6}>
                      <Tooltip title="Andel godkända tester">
                        <CheckCircleOutlined style={styles.icon} />
                      </Tooltip>
                    </Col>
                    <Col span={18}>
                      <Title level={4} style={styles.cardTitle}>
                        Andel godkända tester
                      </Title>
                      <Progress type="circle" percent={passPercentage.toFixed(2)} />
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>

            <Divider style={styles.divider} />

            <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
              <Col span={24}>
                <Card style={styles.chartCard} bordered={false}>
                  <Title level={3} style={styles.chartTitle}>
                    Analys av svar
                  </Title>
                  {chartData && (
                    <Bar
                      data={chartData}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            position: 'top',
                            labels: {
                              color: '#555555',
                            },
                          },
                          title: {
                            display: false,
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              color: '#555555',
                            },
                          },
                          x: {
                            ticks: {
                              color: '#555555',
                            },
                          },
                        },
                      }}
                    />
                  )}
                </Card>
              </Col>
            </Row>

            <Title level={3} style={styles.detailsTitle}>
              Detaljerad resultatlista
            </Title>
            <Row gutter={[24, 24]}>
              {testResults.map((item) => (
                <Col xs={24} md={12} key={item.id}>
                  <Card style={styles.detailCard} bordered={false}>
                    <Title level={4} style={styles.detailTitle}>
                      {item.testName}
                    </Title>
                    <Row gutter={[8, 8]} style={styles.detailRow}>
                      <Col span={6}>
                        <Tooltip title="Huvudkategori">
                          <LineChartOutlined style={styles.detailIcon} />
                        </Tooltip>
                      </Col>
                      <Col span={18}>
                        <Text style={styles.detailText}>
                          <strong>Huvudkategori:</strong> {item.mainCategoryName}
                        </Text>
                      </Col>
                    </Row>
                    <Row gutter={[8, 8]} style={styles.detailRow}>
                      <Col span={6}>
                        <Tooltip title="Underkategori">
                          <LineChartOutlined style={styles.detailIcon} />
                        </Tooltip>
                      </Col>
                      <Col span={18}>
                        <Text style={styles.detailText}>
                          <strong>Underkategori:</strong> {item.subCategoryName}
                        </Text>
                      </Col>
                    </Row>
                    <Row gutter={[8, 8]} style={styles.detailRow}>
                      <Col span={6}>
                        <Tooltip title="Antal frågor">
                          <LineChartOutlined style={styles.detailIcon} />
                        </Tooltip>
                      </Col>
                      <Col span={18}>
                        <Text style={styles.detailText}>
                          <strong>Antal frågor:</strong> {item.questions.length}
                        </Text>
                      </Col>
                    </Row>
                    <Row gutter={[8, 8]} style={styles.detailRow}>
                      <Col span={6}>
                        <Tooltip title="Rätta svar">
                          <CheckCircleOutlined style={styles.detailIcon} />
                        </Tooltip>
                      </Col>
                      <Col span={18}>
                        <Text style={styles.detailText}>
                          <strong>Rätta svar:</strong> {item.correctAnswers}
                        </Text>
                      </Col>
                    </Row>
                    <Row gutter={[8, 8]} style={styles.detailRow}>
                      <Col span={6}>
                        <Tooltip title="Felaktiga svar">
                          <CloseCircleOutlined style={styles.detailIcon} />
                        </Tooltip>
                      </Col>
                      <Col span={18}>
                        <Text style={styles.detailText}>
                          <strong>Felaktiga svar:</strong> {item.questions.length - item.correctAnswers}
                        </Text>
                      </Col>
                    </Row>
                    <Row gutter={[8, 8]} style={styles.detailRow}>
                      <Col span={6}>
                        <Tooltip title="Nödvändig procent">
                          <LineChartOutlined style={styles.detailIcon} />
                        </Tooltip>
                      </Col>
                      <Col span={18}>
                        <Text style={styles.detailText}>
                          <strong>Resultat:</strong> {item.resultPercentage}%
                        </Text>
                      </Col>
                    </Row>
                    <Link to={`/student/test-review/${item.id}`} style={styles.detailLink}>
                      Visa detaljer
                    </Link>
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

const styles = {
  layout: {
    minHeight: '100vh',
    background: '#f0f2f5',
    padding: '24px',
  },
  content: {
    maxWidth: '1200px',
    margin: 'auto',
    padding: '24px',
  },
  backButton: {
    marginBottom: '16px',
    fontSize: '16px',
    color: '#1890ff',
  },
  title: {
    color: '#003a8c',
    textAlign: 'center',
    marginBottom: '24px',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '15px',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
    padding: '20px',
    transition: 'transform 0.3s',
  },
  icon: {
    fontSize: '32px',
    color: '#1890ff',
  },
  cardTitle: {
    marginBottom: '12px',
    color: '#003a8c',
  },
  cardText: {
    fontSize: '24px',
    color: '#555555',
  },
  divider: {
    margin: '40px 0',
  },
  chartCard: {
    backgroundColor: '#ffffff',
    borderRadius: '15px',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
    padding: '24px',
  },
  chartTitle: {
    textAlign: 'center',
    marginBottom: '24px',
    color: '#003a8c',
  },
  detailsTitle: {
    marginBottom: '16px',
    color: '#003a8c',
  },
  detailCard: {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    padding: '16px',
    transition: 'transform 0.3s',
  },
  detailTitle: {
    color: '#003a8c',
    marginBottom: '12px',
  },
  detailRow: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '8px',
  },
  detailIcon: {
    fontSize: '20px',
    color: '#1890ff',
  },
  detailText: {
    fontSize: '16px',
    color: '#555555',
  },
  detailLink: {
    color: '#1890ff',
    marginTop: '10px',
    display: 'inline-block',
  },
};

export default PerformanceAnalysis;
