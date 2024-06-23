"use client";
// components/Layout.js
import { Layout, Menu } from "antd";
import Link from "next/link";
import React, { useState } from "react";

const { Header, Content, Footer } = Layout;

const AppLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const [hoveredItem, setHoveredItem] = useState<string[]>(["1"]);

  const handleMouseEnter = (key: string[]) => {
    setHoveredItem(key);
  };

  const handleMouseLeave = () => {
    setHoveredItem(["1"]);
  };

  return (
    <Layout className="layout" style={{ height: "100vh" }}>
      <Header>
        <div className="logo" />
        <Menu
          theme="dark"
          mode="horizontal"
          // defaultSelectedKeys={["1"]}
          selectedKeys={hoveredItem}
        >
          <Menu.Item
            key="1"
            onMouseEnter={() => handleMouseEnter(["1"])}
            onMouseLeave={handleMouseLeave}
          >
            <Link href="/">Home</Link>
          </Menu.Item>
          <Menu.Item
            key="2"
            onMouseEnter={() => handleMouseEnter(["2"])}
            onMouseLeave={handleMouseLeave}
          >
            <Link href="/rank">Rank</Link>
          </Menu.Item>
        </Menu>
      </Header>
      <Content style={{ padding: 15 }}>
        <div className="site-layout-content">{children}</div>
      </Content>
      <Footer style={{ textAlign: "center" }}>Investment Website ©2024</Footer>
    </Layout>
  );
};

export default AppLayout;
