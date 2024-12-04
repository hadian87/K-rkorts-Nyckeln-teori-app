import React, { useState, useEffect } from "react";
import { Card, Row, Col, Typography, Spin, Input, Select, message } from "antd";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const SimulationTests = () => {
  const [tests, setTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // Search term
  const navigate = useNavigate();

  useEffect(() => {
    // Static data for tests for testing card display
    const fetchTests = async () => {
      try {
        const testsList = [
          { id: "1", name: "Sample Test 1", description: "This is a sample test description" },
          { id: "2", name: "Sample Test 2", description: "Another sample test description" },
          { id: "3", name: "Sample Test 3", description: "A third sample test description" },
          { id: "4", name: "Sample Test 4", description: "A fourth sample test description" },
        ];
        setTests(testsList);
        setFilteredTests(testsList); // Display all tests initially
      } catch (error) {
        message.error("Failed to fetch tests from Firebase.");
      }
    };

    fetchTests();
  }, []);

  const handleTestClick = (testId) => {
    navigate(`/simulation-tests/${testId}`); // Navigate to test details page
  };

  // Update search results
  const handleSearch = (value) => {
    setSearchTerm(value);
    if (value) {
      const filtered = tests.filter((test) => test.name.toLowerCase().includes(value.toLowerCase()));
      setFilteredTests(filtered);
    } else {
      setFilteredTests(tests); // If search is empty, show all tests
    }
  };

  // Update test sorting
  const handleSortChange = (value) => {
    const sortedTests = [...filteredTests].sort((a, b) => {
      if (value === "name") return a.name.localeCompare(b.name);
      return 0;
    });
    setFilteredTests(sortedTests);
  };

  return (
    <div style={{ padding: "24px" }}>
      <Title level={2} style={{ textAlign: "center", marginBottom: "24px" }}>Simulation Tests</Title>

      {/* Search bar and sort options */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} md={8}>
          <Search
            placeholder="Search by test name"
            enterButton
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Select
            defaultValue="name"
            onChange={handleSortChange}
            style={{ width: "100%" }}
          >
            <Option value="name">Sort by Name</Option>
            <Option value="date">Sort by Date</Option>
          </Select>
        </Col>
      </Row>

      <Spin size="large" tip="Loading tests..." style={{ display: "block", margin: "auto" }} />

      <Row gutter={[16, 16]}>
        {filteredTests.map((test) => (
          <Col xs={24} sm={12} md={8} lg={6} key={test.id}>
            <Card
              hoverable
              style={{
                textAlign: "center",
                borderRadius: "10px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                cursor: "pointer",
              }}
              onClick={() => handleTestClick(test.id)}
              bodyStyle={{ padding: "20px" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
              }}
            >
              <Title level={4} style={{ color: "#1890ff" }}>{test.name || "Untitled Test"}</Title>
              <Text>{test.description || "Click to start the test"}</Text>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default SimulationTests;
