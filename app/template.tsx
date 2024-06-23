"use client";
// components/Layout.js
import { Layout, Menu } from "antd";
import Link from "next/link";

const { Header, Content, Footer } = Layout;

const AppLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => (
  <Layout className="layout" style={{ height: "100vh" }}>
    <Header>
      <div className="logo" />
      <Menu theme="dark" mode="horizontal" defaultSelectedKeys={["1"]}>
        <Menu.Item key="1">
          <Link href="/">Home</Link>
        </Menu.Item>
        <Menu.Item key="2">
          <Link href="/rank">Rank</Link>
        </Menu.Item>
        {/* <Menu.Item key="3">
          <Link href="/services">Services</Link>
        </Menu.Item> */}
      </Menu>
    </Header>
    <Content style={{ padding: 15 }}>
      <div className="site-layout-content">{children}</div>
    </Content>
    <Footer style={{ textAlign: "center" }}>Investment Website ©2024</Footer>
  </Layout>
);

export default AppLayout;
