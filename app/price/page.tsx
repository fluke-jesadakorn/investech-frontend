"use client";
import { useState } from "react";
import TvDatafeed, { Interval } from "./tvDatefeed";
import { Button, Input, Form, Row, Col, Table } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";

const { Column } = Table;

const Home = () => {
  const [data, setData] = useState<any[]>([
    { symbol: "BTCUSDT", exchange: "BINANCE" },
    { symbol: "ETHUSDT", exchange: "BINANCE" },
  ]);

  const handleUpdate = (updateData: any[]) => {
    setData((prevData) => {
      const updatedData = [...prevData];
      updateData.forEach((newData) => {
        const index = updatedData.findIndex(
          (data) => data.symbol === newData.symbol
        );
        if (index !== -1) {
          updatedData[index] = newData;
        } else {
          updatedData.push(newData);
        }
      });
      return updatedData;
    });
  };

  const handleSubmit = (values: any) => {
    const tvDatafeed = new TvDatafeed(handleUpdate);
    const symbols = values.symbols.map((item: any) => ({
      symbol: item.symbol,
      exchange: item.exchange,
    }));
    tvDatafeed.subscribeSymbols(symbols, Interval.in_1_minute, 10);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Subscribe to Symbol Price and Market</h1>
      <Form
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          symbols: [
            { symbol: "BTCUSDT", exchange: "BINANCE" },
            { symbol: "ETHUSDT", exchange: "BINANCE" },
          ],
        }}
      >
        <Form.List name="symbols">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field) => (
                <Row gutter={16} key={field.key}>
                  <Col span={10}>
                    <Form.Item
                      {...field}
                      label="Symbol"
                      name={[field.name, "symbol"]}
                      fieldKey={[field.fieldKey!, "symbol"]}
                      rules={[{ required: true, message: "Missing symbol" }]}
                    >
                      <Input placeholder="Enter symbol" />
                    </Form.Item>
                  </Col>
                  <Col span={10}>
                    <Form.Item
                      {...field}
                      label="Exchange"
                      name={[field.name, "exchange"]}
                      fieldKey={[field.fieldKey!, "exchange"]}
                      rules={[{ required: true, message: "Missing exchange" }]}
                    >
                      <Input placeholder="Enter exchange" />
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    {fields.length > 1 && (
                      <Button
                        type="dashed"
                        onClick={() => remove(field.name)}
                        icon={<MinusCircleOutlined />}
                      >
                        Remove
                      </Button>
                    )}
                  </Col>
                </Row>
              ))}
              <Row>
                <Col span={24}>
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      icon={<PlusOutlined />}
                    >
                      Add Symbol
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            </>
          )}
        </Form.List>
        <Row>
          <Col span={24}>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Subscribe
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
      <Table dataSource={data} rowKey="symbol">
        <Column title="Symbol" dataIndex="symbol" key="symbol" />
        <Column title="Time" dataIndex="time" key="time" />
        <Column title="Open" dataIndex="open" key="open" />
        <Column title="High" dataIndex="high" key="high" />
        <Column title="Low" dataIndex="low" key="low" />
        <Column title="Close" dataIndex="close" key="close" />
        <Column title="Volume" dataIndex="volume" key="volume" />
      </Table>
    </div>
  );
};

export default Home;
