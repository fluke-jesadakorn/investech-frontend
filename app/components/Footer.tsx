import { Layout, Typography } from "antd";
const { Footer } = Layout;
const { Text } = Typography;

export default function FooterPage() {
  return (
    <Footer style={{ textAlign: "center", position: "absolute", bottom: 0 }}>
      <Text>Investech</Text>
      <br />
      <Text>ใบอนุญาตเลขที่ ลค-9999-99</Text>
    </Footer>
  );
}
