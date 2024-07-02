"use client";
import React, { useRef, useState, useEffect } from "react";
import { SearchOutlined } from "@ant-design/icons";
import { Button, Input, Space, Table, AutoComplete, Spin } from "antd";
import Highlighter from "react-highlight-words";
import moment from "moment";
import type { ColumnType, TablePaginationConfig } from "antd/es/table";
import type { PaginationProps, InputRef, TableColumnsType } from "antd";
import Link from "next/link";
import { FilterValue, SorterResult } from "antd/es/table/interface";

interface Document {
  key: string;
  Symbol: string;
  Year: string;
  Quarter: string;
  Datetime: string;
  Url: string;
  EPS: number;
  PredictPrice: number;
  MarketPrice?: number;
  MarketPriceLoading?: boolean;
  MarginGap?: number;
}

type DataIndex = keyof Document;

const App: React.FC = () => {
  const [data, setData] = useState<Document[]>([]);
  const [pagination, setPagination] = useState<PaginationProps>({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    pageSizeOptions: ["10", "20", "50", "100"],
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
  const [symbolOptions, setSymbolOptions] = useState<string[]>([]);
  const searchInput = useRef<InputRef>(null);

  const fetchData = async (
    page: number,
    pageSize: number,
    sorter: SorterResult<Document> | SorterResult<Document>[],
    filters: Record<string, FilterValue | null>,
    includeSymbol: boolean = false
  ) => {
    setLoading(true);
    const sort = Array.isArray(sorter)
      ? sorter[0]?.columnKey || "_id"
      : sorter?.columnKey || "_id";
    const order = Array.isArray(sorter)
      ? sorter[0]?.order === "descend"
        ? "desc"
        : "asc"
      : sorter?.order === "descend"
      ? "desc"
      : "asc";
    const symbol =
      includeSymbol && filters.Symbol ? (filters.Symbol[0] as string) : "";

    // Log sort and filter parameters for debugging
    console.log("Fetching data with parameters:", {
      page,
      pageSize,
      sort,
      order,
      symbol,
    });

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/data?page=${page}&limit=${pageSize}&sort=${sort}&order=${order}&Symbol=${symbol}`
      );
      const result = await response.json();

      if (!result.data) {
        throw new Error("No data found in the response");
      }

      const fetchedData = result.data.map((item: Document) => ({
        ...item,
        MarketPrice: 0,
        MarketPriceLoading: true,
        MarginGap: 0,
        key: `${item.Symbol}-${item.Datetime}`, // Ensure each document has a unique key
      }));

      // Fetch market prices for each symbol
      const updatedData = await Promise.all(
        fetchedData.map(async (item: Document) => {
          const marketPrice = await fetchMarketPrice(item.Symbol);
          const marginGap =
            marketPrice && item.PredictPrice
              ? ((marketPrice - item.PredictPrice) / item.PredictPrice) * 100
              : 0;
          return {
            ...item,
            MarketPrice: marketPrice,
            MarketPriceLoading: false,
            MarginGap: marginGap,
          };
        })
      );

      setData(updatedData);
      setPagination({
        ...pagination,
        total: result.total,
        current: page,
        pageSize,
      });
    } catch (error) {
      console.error("There was an error fetching the data!", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMarketPrice = async (symbol: string): Promise<number> => {
    try {
      const response = await fetch(`/api/fetchStockData?symbol=${symbol}`);
      const result = await response.json();
      return result.relatedProducts[0]?.last || 0;
    } catch (error) {
      console.error(`Error fetching market price for symbol ${symbol}:`, error);
      return 0;
    }
  };

  useEffect(() => {
    fetchData(
      pagination.current!,
      pagination.pageSize!,
      sortedInfo,
      filteredInfo,
      true
    );
  }, []);

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
    fetchData(pagination.current!, pagination.pageSize!, {}, {}, true);
  };

  const fetchSymbols = (query: string) => {
    fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/symbols?query=${query}`
    )
      .then((res) => res.json())
      .then((response) => {
        setSymbolOptions(response.symbols || []);
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
    onFilter: (value, record) => {
      const recordValue = record[dataIndex];
      return recordValue
        ? recordValue
            .toString()
            .toLowerCase()
            .includes((value as string).toLowerCase())
        : false;
    },
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
          ? (sortedInfo[0]?.columnKey === "Symbol" && sortedInfo[0]?.order) ||
            undefined
          : (sortedInfo?.columnKey === "Symbol" && sortedInfo?.order) ||
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
          ? (sortedInfo[0]?.columnKey === "Year" && sortedInfo[0]?.order) ||
            undefined
          : (sortedInfo?.columnKey === "Year" && sortedInfo?.order) ||
            undefined,
      ellipsis: true,
    },
    {
      title: "Quarter",
      dataIndex: "Quarter",
      key: "Quarter",
      sorter: true,
      sortOrder:
        sortedInfo instanceof Array
          ? (sortedInfo[0]?.columnKey === "Quarter" && sortedInfo[0]?.order) ||
            undefined
          : (sortedInfo?.columnKey === "Quarter" && sortedInfo?.order) ||
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
      title: "Datetime",
      dataIndex: "Datetime",
      key: "Datetime",
      sorter: true,
      sortOrder:
        sortedInfo instanceof Array
          ? (sortedInfo[0]?.columnKey === "Datetime" && sortedInfo[0]?.order) ||
            undefined
          : (sortedInfo?.columnKey === "Datetime" && sortedInfo?.order) ||
            undefined,
      ellipsis: true,
      render: (text: string) => moment(text).format("DD/MM/YYYY MM:HH"),
    },
    {
      title: "Url",
      dataIndex: "Url",
      key: "Url",
      ellipsis: true,
      render: (text: string) => (
        <Link href={text} target="_blank">
          <Button type="primary">Link</Button>
        </Link>
      ),
    },
    {
      title: "EPS",
      dataIndex: "EPS",
      key: "EPS",
      sorter: true,
      sortOrder:
        sortedInfo instanceof Array
          ? (sortedInfo[0]?.columnKey === "EPS" && sortedInfo[0]?.order) ||
            undefined
          : (sortedInfo?.columnKey === "EPS" && sortedInfo?.order) || undefined,
      ellipsis: true,
    },
    {
      title: "Predict Price",
      dataIndex: "PredictPrice",
      key: "PredictPrice",
      sorter: true,
      sortOrder:
        sortedInfo instanceof Array
          ? (sortedInfo[0]?.columnKey === "PredictPrice" &&
              sortedInfo[0]?.order) ||
            undefined
          : (sortedInfo?.columnKey === "PredictPrice" && sortedInfo?.order) ||
            undefined,
      ellipsis: true,
    },
    {
      title: "Market Price",
      dataIndex: "MarketPrice",
      key: "MarketPrice",
      sorter: true,
      sortOrder:
        sortedInfo instanceof Array
          ? (sortedInfo[0]?.columnKey === "MarketPrice" &&
              sortedInfo[0]?.order) ||
            undefined
          : (sortedInfo?.columnKey === "MarketPrice" && sortedInfo?.order) ||
            undefined,
      ellipsis: true,
      render: (text, record) => (record.MarketPriceLoading ? <Spin /> : text),
    },
    {
      title: "%Margin Gap",
      dataIndex: "MarginGap",
      key: "MarginGap",
      sorter: true,
      sortOrder:
        sortedInfo instanceof Array
          ? (sortedInfo[0]?.columnKey === "MarginGap" &&
              sortedInfo[0]?.order) ||
            undefined
          : (sortedInfo?.columnKey === "MarginGap" && sortedInfo?.order) ||
            undefined,
      ellipsis: true,
      render: (text) => `${text?.toFixed(2)}%`, // Format as percentage with 2 decimal places
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button
          onClick={() =>
            handleTableChange(
              pagination,
              filteredInfo,
              {
                columnKey: "EPS",
                order: "descend",
              },
              {}
            )
          }
        >
          Sort EPS
        </Button>
        <Button onClick={() => setFilteredInfo({})}>Clear filters</Button>
        <Button
          onClick={() => {
            setFilteredInfo({});
            setSortedInfo([]);
            fetchData(pagination.current!, pagination.pageSize!, [], {}, true);
          }}
        >
          Clear filters and sorters
        </Button>
      </Space>
      <Table
        columns={columns}
        rowKey="key"
        dataSource={data}
        pagination={pagination}
        loading={loading}
        onChange={handleTableChange}
      />
    </div>
  );
};

export default App;
