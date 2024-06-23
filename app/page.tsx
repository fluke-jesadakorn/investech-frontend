// import { databaseClient, client } from "@/tina/__generated__/databaseClient";
// import { tinaField } from "tinacms/dist/react";
// import HomePage from "@/app/components/homePage";
// import { Layout } from "antd";

// export default async function Home() {
//   const { data, query, variables } = await databaseClient.queries.page({
//     relativePath: "homePage.md",
//   });

//   return (
//     // <HomePage
//     //   data={JSON.parse(JSON.stringify(data))}
//     //   variables={variables}
//     //   query={query}
//     // />
//     // pages/index.js
//     <>
//       <h1>Welcome to Our Investment Website</h1>
//       <p>Overview of services...</p>
//     </>
//   );
// }
"use client";
// pages/index.js
import {
  Button,
  Row,
  Col,
  Typography,
  List,
  Space,
  PaginationProps,
  InputRef,
  Table,
  AutoComplete,
  Input,
  TableColumnsType,
} from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import "./styles/index.scss";
import { useEffect, useRef, useState } from "react";
import {
  ColumnType,
  FilterValue,
  SorterResult,
  TablePaginationConfig,
} from "antd/es/table/interface";

import { SearchOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";

const { Title } = Typography;

interface Document {
  key: string;
  Symbol: string;
  Year: string;
  Quarter: string;
  Datetime: string;
  Url: string;
  EPS: number;
  PredictPrice: number;
}

type DataIndex = keyof Document;

export default function Home() {
  const [data, setData] = useState<Document[]>([]);
  const [pagination, setPagination] = useState<PaginationProps>({
    current: 1,
    pageSize: 5,
    total: 0,
    showSizeChanger: true,
    pageSizeOptions: ["5"],
  });
  const [loading, setLoading] = useState(false);
  const [filteredInfo, setFilteredInfo] = useState<
    Record<string, FilterValue | null>
  >({});
  const [sortedInfo, setSortedInfo] = useState<
    SorterResult<Document> | SorterResult<Document>[]
  >({});
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState<DataIndex | "">("");
  const [symbolOptions, setSymbolOptions] = useState<string[]>([]); // Initialize as an empty array
  const searchInput = useRef<InputRef>(null);

  useEffect(() => {
    fetchData(
      pagination.current!,
      pagination.pageSize!,
      sortedInfo,
      filteredInfo
    );
  }, []);

  const fetchData = (
    page: number,
    pageSize: number,
    sorter: SorterResult<Document> | SorterResult<Document>[],
    filters: Record<string, FilterValue | null>
  ) => {
    setLoading(true);
    const sort = Array.isArray(sorter)
      ? sorter[0].columnKey
      : sorter.columnKey || "_id";
    const order = Array.isArray(sorter)
      ? sorter[0].order === "descend"
        ? "desc"
        : "asc"
      : sorter.order === "descend"
      ? "desc"
      : "asc";
    const symbol = filters.Symbol ? (filters.Symbol[0] as string) : "";

    fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/data?page=${page}&limit=${pageSize}&sort=${sort}&order=${order}&Symbol=${symbol}`
    )
      .then((res) => res.json())
      .then((response) => {
        setData(response.data);
        setPagination({
          ...pagination,
          total: response.total,
          current: page,
          pageSize,
        });
        setLoading(false);
      })
      .catch((error) => {
        console.error("There was an error fetching the data!", error);
        setLoading(false);
      });
  };

  const handleTableChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<Document> | SorterResult<Document>[],
    extra: any
  ) => {
    setFilteredInfo(filters);
    setSortedInfo(sorter);
    fetchData(pagination.current!, pagination.pageSize!, sorter, filters);
  };

  const handleSearch = (
    selectedKeys: string[],
    confirm: () => void,
    dataIndex: DataIndex
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: () => void) => {
    if (clearFilters) {
      clearFilters();
    }
    setSearchText("");
    setFilteredInfo({});
    setSortedInfo({});
    setSymbolOptions([]);
    fetchData(pagination.current!, pagination.pageSize!, {}, {});
  };

  const fetchSymbols = (query: string) => {
    fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/symbols?query=${query}`
    )
      .then((res) => res.json())
      .then((response) => {
        setSymbolOptions(response.symbols || []); // Ensure it sets an array
      })
      .catch((error) => {
        console.error("There was an error fetching the symbols!", error);
      });
  };

  const getColumnSearchProps = (
    dataIndex: DataIndex
  ): ColumnType<Document> => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <AutoComplete
          options={symbolOptions.map((symbol) => ({ value: symbol }))}
          onSearch={fetchSymbols}
          onSelect={(value) => {
            setSelectedKeys([value]);
            handleSearch([value], confirm, dataIndex);
          }}
          style={{ width: "100%", marginBottom: 8 }}
        >
          <Input
            ref={searchInput}
            placeholder={`Search ${dataIndex}`}
            value={selectedKeys[0]}
            onChange={(e) =>
              setSelectedKeys(e.target.value ? [e.target.value] : [])
            }
            onPressEnter={() =>
              handleSearch(selectedKeys as string[], confirm, dataIndex)
            }
          />
        </AutoComplete>
        <Space>
          <Button
            type="primary"
            onClick={() =>
              handleSearch(selectedKeys as string[], confirm, dataIndex)
            }
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => handleReset(clearFilters!)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText((selectedKeys as string[])[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              setSearchText("");
              setSearchedColumn("");
              confirm();
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        .toString()
        .toLowerCase()
        .includes((value as string).toLowerCase()),
    onFilterDropdownOpenChange: (visible: boolean) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text: string) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  const columns: TableColumnsType<Document> = [
    {
      title: "Symbol",
      dataIndex: "Symbol",
      key: "Symbol",
      ...getColumnSearchProps("Symbol"),
      sorter: true,
      sortOrder:
        sortedInfo instanceof Array
          ? (sortedInfo[0].columnKey === "Symbol" && sortedInfo[0].order) ||
            undefined
          : (sortedInfo.columnKey === "Symbol" && sortedInfo.order) ||
            undefined,
      ellipsis: true,
    },
    {
      title: "Year",
      dataIndex: "Year",
      key: "Year",
      sorter: true,
      sortOrder:
        sortedInfo instanceof Array
          ? (sortedInfo[0].columnKey === "Year" && sortedInfo[0].order) ||
            undefined
          : (sortedInfo.columnKey === "Year" && sortedInfo.order) || undefined,
      ellipsis: true,
    },
    {
      title: "Quarter",
      dataIndex: "Quarter",
      key: "Quarter",
      sorter: true,
      sortOrder:
        sortedInfo instanceof Array
          ? (sortedInfo[0].columnKey === "Quarter" && sortedInfo[0].order) ||
            undefined
          : (sortedInfo.columnKey === "Quarter" && sortedInfo.order) ||
            undefined,
      ellipsis: true,
      onFilter: (value, record) =>
        record.Quarter.indexOf(value as string) === 0,
      filters: [
        {
          text: "Q1",
          value: "Q1",
        },
        {
          text: "Q2",
          value: "Q2",
        },
        {
          text: "Q3",
          value: "Q3",
        },
        {
          text: "Q4",
          value: "Q4",
        },
      ],
    },
    {
      title: "EPS",
      dataIndex: "EPS",
      key: "EPS",
      sorter: true,
      sortOrder:
        sortedInfo instanceof Array
          ? (sortedInfo[0].columnKey === "EPS" && sortedInfo[0].order) ||
            undefined
          : (sortedInfo.columnKey === "EPS" && sortedInfo.order) || undefined,
      ellipsis: true,
    },
    {
      title: "Predict Price",
      dataIndex: "PredictPrice",
      key: "PredictPrice",
      sorter: true,
      sortOrder:
        sortedInfo instanceof Array
          ? (sortedInfo[0].columnKey === "PredictPrice" &&
              sortedInfo[0].order) ||
            undefined
          : (sortedInfo.columnKey === "PredictPrice" && sortedInfo.order) ||
            undefined,
      ellipsis: true,
    },
  ];
  return (
    <div className="site-layout-content">
      <Row gutter={[16, 16]} align="middle">
        <Col xs={12} md={12}>
          <Title level={2}>ลงทุนสบายใจด้วยเทคโนโลยี</Title>
          <Title level={3} style={{ color: "#008C8C" }}>
            Investech จัดการพอร์ตให้เติบโตด้วยสินทรัพย์คุณภาพดีทั่วโลก
          </Title>
          <List
            itemLayout="horizontal"
            dataSource={[
              "ลงทุนระยะยาวอย่างมีหลักการ",
              "ค่าธรรมเนียมการจัดการ 0.5% ต่อปี",
              "บริหารและปรับพอร์ตอัตโนมัติ",
            ]}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<CheckCircleOutlined style={{ color: "#008C8C" }} />}
                  title={item}
                />
              </List.Item>
            )}
          />
          <Button
            type="primary"
            size="large"
            style={{
              marginTop: "20px",
              backgroundColor: "#008C8C",
              borderColor: "#008C8C",
            }}
          >
            เริ่มต้นลงทุน
          </Button>
        </Col>
        <Col xs={12} md={12}>
          <Table
            columns={columns}
            rowKey="id"
            dataSource={data}
            // pagination={pagination}
            loading={loading}
            onChange={handleTableChange}
          />
        </Col>
      </Row>
    </div>
  );
}
