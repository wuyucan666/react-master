import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { Table, Card } from 'antd';

@connect(({ orderRefund: { list }, loading }) => ({
  list,
  loading: loading.effects['orderRefund/fetchList'],
}))
class SettlementRecord extends PureComponent {
  state = {
    page: 1,
    pageSize: 10,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'orderRefund/fetchList',
    });
  }

  handleStandardTableChange = pagination => {
    const { type } = this.state;
    const { dispatch } = this.props;
    const { pageSize, current: page } = pagination;
    dispatch({
      type: 'orderRefund/fetchList',
      payload: {
        page,
        pageSize,
        type,
      },
    });
    this.setState({
      page,
      pageSize,
    });
  };

  handleTypeChange = e => {
    const { value } = e.target;
    const { dispatch } = this.props;
    dispatch({
      type: 'orderRefund/fetchList',
      payload: {
        type: value,
      },
    });
  };

  reOperation = record => {
    console.log(record);
  };

  render() {
    const { list, loading } = this.props;
    const { page, pageSize } = this.state;
    const columns = [
      {
        title: '退款ID',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '退款时间',
        dataIndex: 'age',
        key: 'age',
      },
      {
        title: '退款金额',
        dataIndex: 'fee',
        key: 'fee',
      },
      {
        title: '退款状态',
        dataIndex: 'status',
        key: 'status',
      },
      {
        title: '退款备注',
        dataIndex: 'backup',
        key: 'backup',
      },
      {
        title: '操作',
        dataIndex: 'action',
        render: (text, record) => (
          <Fragment>
            <a onClick={() => this.reOperation(record)}>重新退款</a>
          </Fragment>
        ),
      },
    ];
    const pagination = {
      showSizeChanger: true,
      showQuickJumper: true,
      current: page,
      total: 10,
      showTotal(total) {
        return `共${total}条`;
      },
      pageSize,
    };
    return (
      <PageHeaderWrapper title="退款记录">
        <Card bordered={false} title="">
          <Table
            loading={loading}
            dataSource={list}
            columns={columns}
            pagination={pagination}
            locale={{ emptyText: '暂无退款记录' }}
            onChange={this.handleStandardTableChange}
          />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default SettlementRecord;
