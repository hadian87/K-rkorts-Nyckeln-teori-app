// components/Navbar.js
import React from 'react';
import { Menu, Layout, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { HomeOutlined, UserOutlined, BellOutlined, LineChartOutlined, LogoutOutlined } from '@ant-design/icons';
import logo from '../assets/logo.png';

const { Header } = Layout;

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <Header style={{ background: '#fff', padding: '0 16px', display: 'flex', alignItems: 'center', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
      <div style={{ marginRight: 'auto' }}>
        <img src={logo} alt="Logotyp" style={{ height: '60px' }} />
      </div>
      <Menu mode="horizontal" defaultSelectedKeys={['övningstest']} style={{ flexGrow: 1, justifyContent: 'center', borderBottom: 'none' }}>
        <Menu.Item key="övningstest" icon={<HomeOutlined style={{ fontSize: '20px' }} />} onClick={() => navigate('/student/övningstest')}>
          Övningstest
        </Menu.Item>
        <Menu.Item key="notifications" icon={<BellOutlined style={{ fontSize: '20px' }} />} onClick={() => navigate('/student/notifications')}>
          Notifikationer
        </Menu.Item>
        <Menu.Item key="performance-analysis" icon={<LineChartOutlined style={{ fontSize: '20px' }} />} onClick={() => navigate('/student/performance-analysis')}>
          Prestandaanalys
        </Menu.Item>
        <Menu.Item key="profile" icon={<UserOutlined style={{ fontSize: '20px' }} />} onClick={() => navigate('/student/profile')}>
          Profil
        </Menu.Item>
      </Menu>
      <Button
        icon={<LogoutOutlined />}
        onClick={handleLogout}
        style={{ backgroundColor: 'transparent', color: '#ff4d4f', border: 'none', cursor: 'pointer', marginLeft: '16px' }}
      >
        Logga ut
      </Button>
    </Header>
  );
};

export default Navbar;
