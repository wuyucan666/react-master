import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Card, Input, Select, Table, Form } from 'antd';
import router from 'umi/router';
import moment from 'moment';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './index.less';

@connect(({ recipe, loading }) => ({
  recipe,
  loading: loading.effects['recipe/getList'],
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
    const payload = { page: 1, rows: pageSize };
    dispatch({
      type: 'recipe/getList',
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
      payload.status = Number(defaultStatus);
    }
    dispatch({
      type: 'recipe/getList',
      payload,
    });
  };

  // 搜索功能
  handleSearch = value => {
    const { dispatch } = this.props;
    const { pageSize, defaultStatus } = this.state;
    let payload = { page: 1, rows: pageSize };
    if (value) payload.keyword = value;
    if (defaultStatus !== 'all') {
      payload.status = Number(defaultStatus);
    }
    dispatch({
      type: 'recipe/getList',
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
      payload.status = Number(value);
    }
    dispatch({
      type: 'recipe/getList',
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
    const { recipe, loading } = this.props;
    const { pageSize } = this.state;
    const { data } = recipe;
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
    const columns = [
      {
        title: '处方编号',
        dataIndex: 'code',
        width: '15%',
        key: 'code',
        render: (text, record, index) => {
          text = text || '无';
          // text = 'CF' + text.toString().padStart(8, '0');
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
        title: '患者',
        dataIndex: 'patient_name',
        width: '10%',
        key: 'patient_name',
        render: (text, record, index) => {
          text = text || '无';
          return (
            <Fragment>
              <span style={{ whiteSpace: 'pre-wrap' }}>{text}</span>
            </Fragment>
          );
        },
      },
      {
        title: '医生',
        dataIndex: 'doctor_name',
        width: '10%',
        key: 'doctor_name',
        render: (text, record, index) => {
          text = text || '无';
          return (
            <Fragment>
              <span style={{ whiteSpace: 'pre-wrap' }}>{text}</span>
            </Fragment>
          );
        },
      },
      {
        title: '处方状态',
        dataIndex: 'status',
        width: '10%',
        key: 'status',
        render: (text, record, index) => {
          if (text === 1) text = '未使用';
          if (text === 2) text = '已使用';
          if (text === 3) text = '已失效';
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
      1: '未使用',
      2: '已使用',
      3: '已失效',
    };
    for (const key in statusMap) {
      options.push(<Option key={key}>{statusMap[key]}</Option>);
    }
    const extraContent = (
      <Select defaultValue="all" style={{ width: 156 }} onChange={this.handleSelectChange}>
        <Option key="all">全部</Option>
        {options}
      </Select>
    );

    return (
      <PageHeaderWrapper title="处方列表">
        <Card
          bordered={false}
          title={
            <Search
              style={{ width: '320px' }}
              placeholder="输入处方编号, 患者/医生信息, 按Enter搜索"
              onSearch={value => this.handleSearch(value)}
            />
          }
          extra={extraContent}
        >
          <div className={styles.tableList}>
            <Table
              rowKey="code"
              loading={loading}
              dataSource={listData.list}
              columns={columns}
              pagination={listData.pagination}
              onChange={this.handleStandardTableChange}
              locale={{ emptyText: '暂无任何处方' }}
            />
          </div>
        </Card>
      </PageHeaderWrapper>
    );
  }
}
