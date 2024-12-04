// src/Student/SubCategories.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Card, Col, Row, Layout, Typography } from 'antd';
import Navbar from './Navbar'; // تضمين الشريط العلوي الموحد
import logo from '../assets/logo.png'; // تأكد من صحة المسار للشعار

const { Content } = Layout;
const { Title } = Typography;

const SubCategories = () => {
  const { mainCategoryId } = useParams();
  const navigate = useNavigate();
  const [subCategories, setSubCategories] = useState([]);
  const [testCounts, setTestCounts] = useState({});

  useEffect(() => {
    const fetchSubCategories = async () => {
      try {
        if (!mainCategoryId) {
          console.error('Error: mainCategoryId is missing');
          return;
        }

        const subCategoriesRef = collection(db, 'subCategories');
        const q = query(subCategoriesRef, where('mainCategory', '==', mainCategoryId));
        const querySnapshot = await getDocs(q);
        const subCategoriesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSubCategories(subCategoriesData);

        // Fetch test counts for each subcategory
        subCategoriesData.forEach(async (subCategory) => {
          const testsRef = collection(db, 'tests');
          const testsQuery = query(testsRef, where('subSection', '==', subCategory.id));
          const testsSnapshot = await getDocs(testsQuery);
          setTestCounts((prevCounts) => ({
            ...prevCounts,
            [subCategory.id]: testsSnapshot.size,
          }));
        });
      } catch (error) {
        console.error("Error fetching subcategories:", error);
      }
    };

    fetchSubCategories();
  }, [mainCategoryId]);

  const handleNavigateToTests = (mainSectionId, subSectionId) => {
    if (!mainSectionId || !subSectionId) {
      console.error('Error: mainSectionId or subSectionId is missing');
      return;
    }
    navigate(`/student/tests/${mainSectionId}/${subSectionId}`);
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Navbar /> {/* تضمين الشريط العلوي الموحد */}
      <Content style={{ margin: '16px', padding: '24px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
        <Row gutter={[16, 16]} justify="center">
          {subCategories.map((subCategory) => (
            <Col key={subCategory.id} xs={24} sm={12} md={8} style={{ display: 'flex' }}>
              <Card
                hoverable
                style={{
                  textAlign: 'center',
                  borderRadius: '15px',
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
                  background: 'linear-gradient(145deg, #f0f0f3, #ffffff)',
                  padding: '20px',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  flex: 1,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.1)';
                }}
                onClick={() => handleNavigateToTests(mainCategoryId, subCategory.id)}
              >
                <div style={{ marginBottom: '15px', borderRadius: '50%', overflow: 'hidden', padding: '10px', backgroundColor: '#f9f9f9', display: 'inline-block' }}>
                  <img
                    src={subCategory.iconUrl || logo}
                    alt={`${subCategory.name} icon`}
                    style={{ height: '80px', width: '80px', objectFit: 'cover', marginBottom: '10px' }}
                  />
                </div>
                <Title level={4} style={{ color: '#1890ff', fontWeight: 'bold', fontSize: '20px', marginTop: '10px' }}>
                  {subCategory.name}
                </Title>
                <p style={{ color: '#888', fontSize: '14px', marginTop: '5px' }}>Antal tester: {testCounts[subCategory.id] || 0}</p>
                <p style={{ color: '#888', fontSize: '14px', marginTop: '5px' }}>Utforska mer om {subCategory.name}</p>
              </Card>
            </Col>
          ))}
        </Row>
      </Content>
    </Layout>
  );
};

export default SubCategories;
