import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Card, Input, Select, Table, Form } from 'antd';
import router from 'umi/router';
import moment from 'moment';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './orderList.less';

@connect(({ order, loading }) => ({
  order,
  loading: loading.effects['order/getList'],
}))
@Form.create()
export default class RecipeList extends PureComponent {
  state = {
    data: {},
    page: 1,
    pageSize: 10,
    keyword: '',
    defaultStatus: 'all',
  };

  componentDidMount() {
    const { dispatch } = this.props;
    const { pageSize } = this.state;
    let payload = { page: 1, rows: pageSize };
    dispatch({
      type: 'order/getList',
      payload,
    });
  }

  // 分页功能
  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    console.log('pagination', pagination);
    const { dispatch } = this.props;
    const { keyword, defaultStatus } = this.state;
    this.setState({ pageSize: pagination.pageSize, page: pagination.current });
    let payload = { rows: pagination.pageSize, page: pagination.current };
    if (keyword) payload.keyword = keyword;
    if (defaultStatus !== 'all') {
      payload.payStatus = Number(defaultStatus);
    }
    dispatch({
      type: 'order/getList',
      payload,
    });
  };

  // 搜索功能
  handleSearch = value => {
    const { dispatch } = this.props;
    const { pageSize, id, defaultStatus } = this.state;
    let payload = { page: 1, rows: pageSize };
    if (value) payload.keyword = value;
    if (defaultStatus !== 'all') {
      payload.payStatus = Number(defaultStatus);
    }
    dispatch({
      type: 'order/getList',
      payload,
    });
    this.setState({ keyword: value });
  };

  // 下拉功能
  handleSelectChange = value => {
    console.log(value);
    const { dispatch } = this.props;
    const { pageSize, keyword, defaultStatus } = this.state;
    let payload = { page: 1, rows: pageSize };
    if (keyword) payload.keyword = keyword;
    if (value !== 'all') {
      payload.payStatus = Number(value);
    }
    dispatch({
      type: 'order/getList',
      payload,
    });
    this.setState({ defaultStatus: value });
  };

  // 路由跳转功能
  handleDetailPage = record => {
    const { match } = this.props;
    router.push({
      pathname: `${match.url}/detail/${record.id}`,
    });
  };

  render() {
    const { order, loading } = this.props;
    const { pageSize } = this.state;
    const { data } = order;
    const rows = data.rows || [];
    const listData = {
      list: rows,
      pagination: {
        showSizeChanger: true,
        showQuickJumper: true,
        current: Number(data.page),
        total: Number(data.total),
        showTotal(total) {
          return `共${total}条`;
        },
        pageSize,
      },
    };
    const obj = {
      0: '未支付',
      1: '未支付',
      2: '已支付',
    };
    const columns = [
      {
        title: '订单编号',
        dataIndex: 'code',
        width: '15%',
        key: 'code',
        render: (text, record, index) => {
          text = text || '无';
          // text = 'SKU-' + '0000-' + text.toString().padStart(4, '0');
          return text;
        },
      },
      {
        title: '创建时间',
        dataIndex: 'created_at',
        width: '15%',
        render: (text, record, index) => {
          text = moment(text).format('YYYY-MM-DD HH:mm') || '无';
          return (
            <Fragment>
              <span style={{ whiteSpace: 'pre-wrap' }}>{text}</span>
            </Fragment>
          );
        },
      },
      {
        title: '支付状态',
        dataIndex: 'payStatus',
        width: '10%',
        key: 'payStatus',
        render: (text, record, index) => {
          return (
            <Fragment>
              <span style={{ whiteSpace: 'pre-wrap' }}>{obj[text]}</span>
            </Fragment>
          );
        },
      },
      {
        title: '总药品数',
        dataIndex: 'amount',
        width: '10%',
        render: (text, record, index) => {
          const item = record.orderItems || [];
          const amount = item.length;
          text = amount;
          return (
            <Fragment>
              <span style={{ whiteSpace: 'pre-wrap' }}>{text}</span>
            </Fragment>
          );
        },
      },
      {
        title: '订单合计',
        dataIndex: 'fee',
        width: '10%',
        render: (text, record, index) => {
          text = (text / 100).toFixed(2) || 0;
          return (
            <Fragment>
              <span style={{ whiteSpace: 'pre-wrap' }}>{text}</span>
            </Fragment>
          );
        },
      },
      {
        title: '操作',
        width: '15%',
        render: (text, record, index) => (
          <Fragment>
            <a onClick={() => this.handleDetailPage(record)}>详情</a>
          </Fragment>
        ),
      },
    ];
    const { Search } = Input;
    const Option = Select.Option;
    const options = [];
    const statusMap = {
      1: '未支付',
      2: '已支付',
    };
    for (const key in statusMap) {
      options.push(<Option key={key}>{statusMap[key]}</Option>);
    }
    const extraContent = (
      <Select defaultValue="all" style={{ width: 100 }} onChange={this.handleSelectChange}>
        <Option key="all">全部</Option>
        {options}
      </Select>
    );

    return (
      <PageHeaderWrapper title="订单列表">
        <Card
          bordered={false}
          title={
            <Search
              style={{ width: '270px' }}
              placeholder="输入订单信息, 按Enter搜索"
              onSearch={value => this.handleSearch(value)}
            />
          }
          extra={extraContent}
        >
          <div className={styles.tableList}>
            <Table
              rowKey="id"
              loading={loading}
              dataSource={listData.list}
              columns={columns}
              pagination={listData.pagination}
              onChange={this.handleStandardTableChange}
              locale={{ emptyText: '暂无任何订单' }}
            />
          </div>
        </Card>
      </PageHeaderWrapper>
    );
  }
}
