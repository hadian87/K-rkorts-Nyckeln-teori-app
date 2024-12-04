import React, { useState, useEffect } from "react";
import { Table, Button, Select, InputNumber, message, Typography, Space, Modal, Input } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { db } from "../../firebaseConfig";
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where } from "firebase/firestore";

const { Column } = Table;
const { Option } = Select;

const ManageTests = () => {
  const [tests, setTests] = useState([]);
  const [testData, setTestData] = useState({
    name: "Teoriprov",
    mainSection: "",
    subSection: "",
    category: "",
    duration: 50,
    totalQuestions: 70,
    totalPoints: 65,
    experimentalQuestions: 5,
    requiredQuestionsToPass: 52,
    passingScore: 75,
  });
  const [editingTest, setEditingTest] = useState(null);
  const [visible, setVisible] = useState(false);
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const testsSnapshot = await getDocs(collection(db, "tests"));
        const testsData = testsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTests(testsData);

        const mainCategoriesSnapshot = await getDocs(collection(db, "mainCategories"));
        setMainCategories(mainCategoriesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

        const subCategoriesSnapshot = await getDocs(collection(db, "subCategories"));
        setSubCategories(subCategoriesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

        const categoriesSnapshot = await getDocs(collection(db, "categories"));
        setCategories(categoriesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        message.error("Misslyckades med att hämta data från Firebase");
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (key, value) => {
    let updatedTestData = { ...testData, [key]: value };

    // إذا تم إدخال عدد الأسئلة، نحسب النقاط والوقت استنادًا إلى القاعدة المحددة.
    if (key === "totalQuestions") {
      const totalQuestions = value;
      const experimentalQuestions = testData.experimentalQuestions;
      const requiredQuestionsToPass = Math.floor((totalQuestions - experimentalQuestions) * 0.75);
      const totalPoints = Math.floor((totalQuestions - experimentalQuestions) * (65 / 65));
      const duration = Math.floor(totalQuestions * 0.714);

      updatedTestData = {
        ...updatedTestData,
        requiredQuestionsToPass: requiredQuestionsToPass,
        totalPoints: totalPoints,
        duration: duration,
      };
    }

    setTestData(updatedTestData);
  };

  const openModal = () => {
    if (selectedRowKeys.length === 1) {
      const test = tests.find((t) => t.id === selectedRowKeys[0]);
      setTestData(test);
      setEditingTest(test.id);
    } else {
      setTestData({
        name: "Teoriprov",
        mainSection: "",
        subSection: "",
        category: "",
        duration: 50,
        totalQuestions: 70,
        totalPoints: 65,
        experimentalQuestions: 5,
        requiredQuestionsToPass: 52,
        passingScore: 75,
      });
      setEditingTest(null);
    }
    setVisible(true);
  };

  const handleAddOrUpdateTest = async () => {
    if (!testData.name || !testData.mainSection) {
      message.error("Vänligen fyll i alla obligatoriska fält.");
      return;
    }

    try {
      const questionsRef = collection(db, "questions");
      const q = query(
        questionsRef,
        where("mainSection", "==", testData.mainSection),
        where("subSection", "==", testData.subSection),
        where("category", "==", testData.category)
      );

      const questionsSnapshot = await getDocs(q);
      const availableQuestionsCount = questionsSnapshot.size;

      if (availableQuestionsCount < testData.totalQuestions) {
        message.error(`Den valda kategorin har bara ${availableQuestionsCount} frågor tillgängliga, vilket är färre än de ${testData.totalQuestions} frågor som krävs.`);
        return;
      }

      if (editingTest) {
        await updateDoc(doc(db, "tests", editingTest), testData);
        setTests((tests) =>
          tests.map((t) => (t.id === editingTest ? { ...testData, id: editingTest } : t))
        );
        message.success("Prov uppdaterat framgångsrikt");
      } else {
        const docRef = await addDoc(collection(db, "tests"), testData);
        setTests((tests) => [...tests, { ...testData, id: docRef.id }]);
        message.success("Prov tillagt framgångsrikt");
      }
    } catch (error) {
      message.error("Misslyckades med att spara provet");
    }

    setVisible(false);
    setTestData({
      name: "Teoriprov",
      mainSection: "",
      subSection: "",
      category: "",
      duration: 50,
      totalQuestions: 70,
      totalPoints: 65,
      experimentalQuestions: 5,
      requiredQuestionsToPass: 52,
      passingScore: 75,
    });
    setSelectedRowKeys([]);
  };

  const handleDeleteTest = async () => {
    if (selectedRowKeys.length === 0) {
      message.error("Vänligen välj ett prov att ta bort.");
      return;
    }
    Modal.confirm({
      title: "Är du säker på att du vill ta bort det valda provet/den valda provet?",
      onOk: async () => {
        try {
          for (const testId of selectedRowKeys) {
            await deleteDoc(doc(db, "tests", testId));
          }
          setTests((tests) => tests.filter((test) => !selectedRowKeys.includes(test.id)));
          message.success("Prov borttaget framgångsrikt");
          setSelectedRowKeys([]);
        } catch (error) {
          message.error("Misslyckades med att ta bort provet/den valda provet");
        }
      },
    });
  };

  const getNameFromId = (id, list) => {
    const item = list.find((item) => item.id === id);
    return item ? item.name : "";
  };

  return (
    <div style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}>
      <Typography.Title level={2} style={{ textAlign: "center", marginBottom: "24px", color: "#1e293b" }}>
        Hantera Prov
      </Typography.Title>

      <Space style={{ marginBottom: "16px" }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => openModal()}
          style={{ backgroundColor: "#1890ff", borderColor: "#1890ff" }}
        >
          {selectedRowKeys.length === 1 ? "Redigera Prov" : "Lägg till Nytt Prov"}
        </Button>
        <Button
          type="primary"
          danger
          icon={<DeleteOutlined />}
          onClick={handleDeleteTest}
          disabled={selectedRowKeys.length === 0}
        >
          Ta bort Prov
        </Button>
      </Space>

      <Table
        dataSource={tests}
        rowKey="id"
        bordered
        style={{ borderRadius: "8px", overflow: "hidden" }}
        pagination={{ pageSize: 5 }}
        scroll={{ x: 1200 }}
        rowSelection={{
          selectedRowKeys,
          onChange: (selectedKeys) => setSelectedRowKeys(selectedKeys),
        }}
      >
        <Column title="Provnamn" dataIndex="name" key="name" width={150} />
        <Column
          title="Huvudsektion"
          key="mainSection"
          width={150}
          render={(text, record) => getNameFromId(record.mainSection, mainCategories)}
        />
        <Column
          title="Undersektion"
          key="subSection"
          width={150}
          render={(text, record) => getNameFromId(record.subSection, subCategories)}
        />
        <Column
          title="Kategori"
          key="category"
          width={150}
          render={(text, record) => getNameFromId(record.category, categories)}
        />
        <Column title="Varaktighet (min)" dataIndex="duration" key="duration" width={120} />
        <Column title="Totalt antal frågor" dataIndex="totalQuestions" key="totalQuestions" width={150} />
        <Column title="Totalt antal poäng" dataIndex="totalPoints" key="totalPoints" width={150} />
        <Column title="Experimentella frågor" dataIndex="experimentalQuestions" key="experimentalQuestions" width={200} />
        <Column title="Antal frågor som krävs för att klara" dataIndex="requiredQuestionsToPass" key="requiredQuestionsToPass" width={200} />
        <Column title="Godkänd poäng (%)" dataIndex="passingScore" key="passingScore" width={150} />
      </Table>

      <Modal
        title={editingTest ? "Redigera Prov" : "Lägg till Nytt Prov"}
        visible={visible}
        onCancel={() => setVisible(false)}
        onOk={handleAddOrUpdateTest}
        okText={editingTest ? "Uppdatera" : "Skapa"}
      >
        <Input
          placeholder="Provnamn"
          value={testData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          style={{ marginBottom: "8px" }}
        />
        <Select
          placeholder="Välj Huvudsektion"
          value={testData.mainSection}
          onChange={(value) => handleInputChange("mainSection", value)}
          style={{ width: "100%", marginBottom: "8px" }}
        >
          {mainCategories.map((section) => (
            <Option key={section.id} value={section.id}>
              {section.name}
            </Option>
          ))}
        </Select>
        <Select
          placeholder="Välj Undersektion (Valfritt)"
          value={testData.subSection}
          onChange={(value) => handleInputChange("subSection", value)}
          style={{ width: "100%", marginBottom: "8px" }}
          allowClear
        >
          {subCategories
            .filter((sub) => sub.mainCategory === testData.mainSection)
            .map((sub) => (
              <Option key={sub.id} value={sub.id}>
                {sub.name}
              </Option>
            ))}
        </Select>
        <Select
          placeholder="Välj Kategori (Valfritt)"
          value={testData.category}
          onChange={(value) => handleInputChange("category", value)}
          style={{ width: "100%", marginBottom: "8px" }}
          allowClear
        >
          {categories
            .filter((cat) => cat.subCategory === testData.subSection)
            .map((cat) => (
              <Option key={cat.id} value={cat.id}>
                {cat.name}
              </Option>
            ))}
        </Select>
        <InputNumber
          placeholder="Varaktighet (minuter)"
          value={testData.duration}
          onChange={(value) => handleInputChange("duration", value)}
          min={1}
          style={{ width: "100%", marginBottom: "8px" }}
        />
        <InputNumber
          placeholder="Totalt antal frågor"
          value={testData.totalQuestions}
          onChange={(value) => handleInputChange("totalQuestions", value)}
          min={1}
          style={{ width: "100%", marginBottom: "8px" }}
        />
        <InputNumber
          placeholder="Totalt antal poäng"
          value={testData.totalPoints}
          onChange={(value) => handleInputChange("totalPoints", value)}
          min={1}
          disabled
          style={{ width: "100%", marginBottom: "8px" }}
        />
        <InputNumber
          placeholder="Experimentella frågor"
          value={testData.experimentalQuestions}
          onChange={(value) => handleInputChange("experimentalQuestions", value)}
          min={0}
          style={{ width: "100%", marginBottom: "8px" }}
        />
        <InputNumber
          placeholder="Antal frågor som krävs för att klara"
          value={testData.requiredQuestionsToPass}
          onChange={(value) => handleInputChange("requiredQuestionsToPass", value)}
          min={1}
          style={{ width: "100%", marginBottom: "8px" }}
        />
        <InputNumber
          placeholder="Godkänd poäng (%)"
          value={testData.passingScore}
          onChange={(value) => handleInputChange("passingScore", value)}
          min={1}
          max={100}
          style={{ width: "100%", marginBottom: "8px" }}
        />
      </Modal>
    </div>
  );
};

export default ManageTests;
