// Profile.js
import React, { useEffect, useState } from 'react';
import {
  Card,
  Layout,
  Typography,
  Spin,
  Divider,
  Avatar,
  Button,
  Tooltip,
  message,
  Tag,
  Modal,
  Form,
  Input,
  notification,
  Descriptions
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  UserOutlined,
  // PlusOutlined // تم التعليق عليه أو حذفه
} from '@ant-design/icons';
import styled from 'styled-components';
import { db, auth } from '../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography; // تم إزالة Text هنا
const { Content } = Layout;

// **لوحة الألوان المتناسقة**
const colors = {
  primary: '#1E90FF',      // الأزرق النيلي
  secondary: '#104E8B',    // الأزرق الداكن
  lightGray: '#f0f2f5',    // الرمادي الفاتح للخلفية
  white: '#ffffff',        // الأبيض
  darkGray: '#555555',     // الرمادي الداكن للنصوص
  success: '#52c41a',      // الأخضر للنجاح
  error: '#f5222d',        // الأحمر للأخطاء
  info: '#1890ff',         // الأزرق للمعلومات
};

// **مكونات Styled-Components المخصصة**
const StyledLayout = styled(Layout)`
  min-height: 100vh;
  background: ${colors.lightGray};
`;

const ContentContainer = styled(Content)`
  width: 100%;
  max-width: 900px;
  margin: auto;
  padding: 24px;
`;

const BackButton = styled(Button)`
  margin-bottom: 24px;
  font-size: 16px;
  color: ${colors.primary};
  &:hover {
    color: ${colors.secondary};
  }
`;

const ProfileCard = styled(Card)`
  background-color: ${colors.white};
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 32px;
  position: relative;
  overflow: hidden;
  &:hover {
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  }
`;

const EditButtonStyled = styled(Button)`
  position: absolute;
  top: 24px;
  right: 24px;
  border: none;
  color: ${colors.primary};
  font-size: 20px;
  &:hover {
    color: ${colors.secondary};
  }
`;

const AvatarWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 24px;
`;

const StyledAvatar = styled(Avatar)`
  background-color: ${colors.primary};
  color: ${colors.white};
  font-size: 48px;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
`;

const UserName = styled(Title)`
  text-align: center;
  color: ${colors.secondary};
  margin-bottom: 8px;
`;

const StatusTag = styled(Tag)`
  margin-left: 8px;
`;

// **مكون Profile المحسن**
const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({});
  const [registrationDate, setRegistrationDate] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (currentUser) {
          const userDoc = doc(db, 'users', currentUser.uid);
          const userSnapshot = await getDoc(userDoc);
          if (userSnapshot.exists()) {
            const data = userSnapshot.data();
            setUserData(data);

            // الحصول على تاريخ التسجيل من metadata
            const creationTime = currentUser.metadata.creationTime;
            if (creationTime) {
              const formattedDate = new Date(creationTime).toLocaleDateString('sv-SE');
              setRegistrationDate(formattedDate);
            } else {
              setRegistrationDate('Ingen information tillgänglig');
            }
          } else {
            setUserData({});
            message.warning('Ingen användardata hittades.');
          }
        } else {
          message.error('Ingen användare är inloggad.');
        }
      } catch (error) {
        console.error('Fel vid hämtning av användardata:', error);
        message.error('Ett fel uppstod vid hämtning av användardata.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  const showModal = () => {
    setIsModalVisible(true);
    form.setFieldsValue({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email, // إبقاء البريد الإلكتروني في النموذج
      phoneNumber: userData.phoneNumber,
      personNumber: userData.personNumber,
      language: userData.language,
    });
  };

  const handleOk = () => {
    form.validateFields().then(async values => {
      try {
        // فصل حقل البريد الإلكتروني وعدم تحديثه
        const { email, ...otherValues } = values;
        const userDoc = doc(db, 'users', currentUser.uid);
        await updateDoc(userDoc, otherValues);
        setUserData(prev => ({ ...prev, ...otherValues }));
        notification.success({
          message: 'Profilen har uppdaterats!',
          description: 'Dina ändringar har sparats framgångsrikt.',
        });
        setIsModalVisible(false);
      } catch (error) {
        console.error('Fel vid uppdatering av användardata:', error);
        notification.error({
          message: 'Fel',
          description: 'Ett fel uppstod vid uppdatering av användardata.',
        });
      }
    }).catch(info => {
      console.log('Validate Failed:', info);
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // **إزالة وظيفة handleUpload وزر رفع الصورة**
  // const handleUpload = async ({ file }) => {
  //   // تم التعليق عليه أو حذفه
  // };

  if (loading) {
    return (
      <StyledLayout>
        <ContentContainer>
          <Spin size="large" tip="Laddar profil..." />
        </ContentContainer>
      </StyledLayout>
    );
  }

  // الحصول على الحرف الأول من الاسم الأول
  const firstLetter = userData.firstName ? userData.firstName.charAt(0).toUpperCase() : '';

  return (
    <StyledLayout>
      <ContentContainer>
        <BackButton
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
        >
          Tillbaka
        </BackButton>

        <ProfileCard>
          <EditButtonStyled
            type="text"
            icon={<EditOutlined />}
            tooltip="Redigera profil"
            onClick={showModal}
          />

          <AvatarWrapper>
            <Tooltip title="Klicka för att uppdatera profilbild">
              <StyledAvatar
                size={150}
                src={userData.profileImage || null}
                icon={!userData.profileImage && <UserOutlined />}
              >
                {!userData.profileImage && firstLetter}
              </StyledAvatar>
            </Tooltip>
            {/* إزالة زر رفع الصورة */}
            {/* 
            <Upload
              showUploadList={false}
              beforeUpload={() => false}
              customRequest={handleUpload}
            >
              <Button icon={<PlusOutlined />} style={{ marginTop: '16px' }}>
                Ändra profilbild
              </Button>
            </Upload>
            */}
          </AvatarWrapper>

          <UserName level={2}>
            {userData.firstName} {userData.lastName}
          </UserName>

          <Divider />

          {/* استخدام مكون Descriptions لعرض البيانات بطريقة منظمة */}
          <Descriptions
            title="Användarinformation"
            bordered
            column={1} // عرض عمود واحد لضمان تتابع الحقول
            size="middle"
          >
            <Descriptions.Item label="Förnamn">
              {userData.firstName}
            </Descriptions.Item>
            <Descriptions.Item label="Efternamn">
              {userData.lastName}
            </Descriptions.Item>
            <Descriptions.Item label="E-post">
              {userData.email}
              {userData.isEmailVerified && (
                <StatusTag color="green">Verified</StatusTag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Telefonnummer">
              {userData.phoneNumber}
              {userData.isPhoneVerified && (
                <StatusTag color="green">Verified</StatusTag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Personnummer">
              {userData.personNumber}
            </Descriptions.Item>
            <Descriptions.Item label="Språk">
              {userData.language}
            </Descriptions.Item>
            <Descriptions.Item label="Registreringsdatum">
              {registrationDate}
            </Descriptions.Item>
          </Descriptions>
        </ProfileCard>

        {/* نموذج تعديل الملف الشخصي */}
        <Modal
          title="Redigera profil"
          visible={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
          okText="Spara"
          cancelText="Avbryt"
        >
          <Form
            form={form}
            layout="vertical"
          >
            <Form.Item
              name="firstName"
              label="Förnamn"
              rules={[{ required: true, message: 'Vänligen ange ditt förnamn!' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="lastName"
              label="Efternamn"
              rules={[{ required: true, message: 'Vänligen ange ditt efternamn!' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="email"
              label="E-post"
              rules={[
                { required: true, type: 'email', message: 'Vänligen ange en giltig e-post!' }
              ]}
            >
              <Input disabled /> {/* جعل حقل البريد الإلكتروني غير قابل للتحرير */}
            </Form.Item>
            <Form.Item
              name="phoneNumber"
              label="Telefonnummer"
              rules={[{ required: true, message: 'Vänligen ange ditt telefonnummer!' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="personNumber"
              label="Personnummer"
              rules={[{ required: true, message: 'Vänligen ange ditt personnummer!' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="language"
              label="Språk"
              rules={[{ required: true, message: 'Vänligen ange ditt språk!' }]}
            >
              <Input />
            </Form.Item>
          </Form>
        </Modal>
      </ContentContainer>
    </StyledLayout>
  );
};

export default Profile;
