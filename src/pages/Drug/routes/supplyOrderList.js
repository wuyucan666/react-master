import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Table, Card, Select, Icon, Input, Form } from 'antd';
import router from 'umi/router';
import moment from 'moment';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './index.less';
import { getPageQuery } from '../../../utils/utils';

const { Search } = Input;
const { Option } = Select;

@connect(({ supplierOrder, loading }) => ({
  supplierOrder,
  loading: loading.effects['supplierOrder/list'],
}))
@Form.create()
class SupplyOrderList extends PureComponent {
  state = {
    pageSize: 10,
    id: 0,
    supplyName: '',
    keyword: '',
    defaultStatus: 'all',
  };

  componentDidMount() {
    const { dispatch } = this.props;
    const { pageSize } = this.state;
    const params = getPageQuery();
    const { id, name: supplyName } = params;
    this.setState({ id, supplyName });

    dispatch({
      type: 'supplierOrder/list',
      payload: { page: 1, rows: pageSize, supplier_id: id },
    });
    dispatch({
      type: 'supplierOrder/stat',
      payload: { supplier_id: id },
    });
    dispatch({
      type: 'supplierOrder/fetchOrderStatus',
    });
  }

  componentWillUnmount() {}

  // 增加点击订单对账跳转路由去到对应供应商的订单对账
  handleOrderCheck = () => {
    const { match } = this.props;
    const { id, supplyName } = this.state;
    router.push({
      pathname: `${match.url}/account`,
      search: `?id=${id}&name=${supplyName}`,
    });
  };

  handleStandardTableChange = pagination => {
    const { dispatch } = this.props;
    const { keyword, id, defaultStatus } = this.state;

    this.setState({ pageSize: pagination.pageSize });
    const payload = { rows: pagination.pageSize, page: pagination.current, supplier_id: id };
    if (keyword) payload.keyword = keyword;
    if (defaultStatus !== 'all') {
      payload.status = Number(defaultStatus);
    }
    dispatch({
      type: 'supplierOrder/list',
      payload,
    });
  };

  handleSearch = value => {
    const { dispatch } = this.props;
    const { pageSize, id, defaultStatus } = this.state;
    const payload = { page: 1, rows: pageSize, supplier_id: id };
    if (value) payload.keyword = value;
    if (defaultStatus !== 'all') {
      payload.status = Number(defaultStatus);
    }
    dispatch({
      type: 'supplierOrder/list',
      payload,
    });
    this.setState({ keyword: value });
  };

  handleDetailPage = record => {
    const { match } = this.props;
    const { id } = this.state;
    router.push({
      pathname: `${match.url}/info`,
      search: `?id=${record.id}&supplyId=${id}`,
    });
  };

  handleSelectChange = value => {
    const { dispatch } = this.props;
    const { pageSize, id, keyword } = this.state;
    const payload = { page: 1, rows: pageSize, supplier_id: id };
    if (keyword) payload.keyword = keyword;
    if (value !== 'all') {
      payload.status = Number(value);
    }
    dispatch({
      type: 'supplierOrder/list',
      payload,
    });
    this.setState({ defaultStatus: value });
  };

  render() {
    const { supplierOrder: model, loading } = this.props;
    const { pageSize, supplyName } = this.state;
    const { data, stat, orderStatus } = model;
    const daySum = stat.day_sum ? (stat.day_sum * 0.01).toFixed(2) : 0;
    const dayCount = stat.day_count || 0;
    const monthSum = stat.month_sum ? (stat.month_sum * 0.01).toFixed(2) : 0;
    const monthCount = stat.month_count || 0;
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
        title: '订单编号',
        dataIndex: 'code',
        width: '10%',
        key: 'code',
        render: text => text,
      },
      {
        title: '订单状态',
        dataIndex: 'status',
        width: '10%',
        key: 'status',
        render: text => (
          <Fragment>
            <span style={{ whiteSpace: 'pre-wrap' }}>{text || '未知'}</span>
          </Fragment>
        ),
      },
      {
        title: '订单价格',
        dataIndex: 'sum',
        width: '10%',
        render: text => {
          const fee = text ? (text * 0.01).toFixed(2) : 0;
          return (
            <Fragment>
              <span style={{ whiteSpace: 'pre-wrap' }}>{fee}</span>
            </Fragment>
          );
        },
      },
      {
        title: '创建时间',
        dataIndex: 'created_at',
        width: '10%',
        render: text => (
          <Fragment>
            <span style={{ whiteSpace: 'pre-wrap' }}>
              {moment(text).format('YYYY-MM-DD HH:mm')}
            </span>
          </Fragment>
        ),
      },
      {
        title: '药品',
        dataIndex: 'drug',
        width: '20%',
        render: (text, record) => {
          const names = [];
          const itemSkus = record.item_skus || [];
          itemSkus.forEach(item => {
            names.push(`${item.cadn}（${item.brand}）${item.spec}`);
          });
          let content = names.join('，');
          if (text && text.length > 50) {
            content = text.slice(0, 50);
            content += '...';
          }
          return (
            <Fragment>
              <span style={{ whiteSpace: 'pre-wrap' }}>{content}</span>
            </Fragment>
          );
        },
      },
      {
        title: '操作',
        width: '10%',
        render: (text, record) => (
          <Fragment>
            <a onClick={() => this.handleDetailPage(record)}>详情</a>
          </Fragment>
        ),
      },
    ];

    const action = (
      <div className={styles.extraContent}>
        <div className={styles.statItem}>
          <p>今日订单总数</p>
          <p>{dayCount}</p>
        </div>
        <div className={styles.statItem}>
          <p>今日订单总额</p>
          <p>{`¥${daySum}`}</p>
        </div>
        <div className={styles.statItem}>
          <p>本月订单总数</p>
          <p>{monthCount}</p>
        </div>
        <div className={styles.statItem}>
          <p>本月订单总额</p>
          <p>{`¥${monthSum}`}</p>
        </div>
      </div>
    );
    const extraContent = (
      <Select defaultValue="all" style={{ width: 156 }} onChange={this.handleSelectChange}>
        <Option key="all">全部状态</Option>
        {orderStatus.map(status => (
          <Option key={status.value}>{status.label}</Option>
        ))}
      </Select>
    );

    return (
      <PageHeaderWrapper title={`供货商订单（${supplyName}）`} action={action}>
        <Card
          bordered={false}
          title={
            <Search
              style={{ width: '270px' }}
              placeholder="输入订单编号或药品, 按Enter搜索"
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
              locale={{ emptyText: '该供货商暂无任何订单' }}
            />
            {listData.list.length !== 0 ? (
              <div style={{ position: 'relative', zIndex: 1 }}>
                <a
                  onClick={() => this.handleOrderCheck()}
                  style={{ position: 'absolute', left: 0, bottom: 10 ? 20 : -25 }}
                >
                  <Icon type="profile" theme="outlined" style={{ fontSize: 20 }} />
                  <span style={{ marginLeft: '5px' }}>订单对账</span>
                </a>
              </div>
            ) : null}
          </div>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default SupplyOrderList;
