import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { Row, Col, Table, Card, Radio } from 'antd';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

const filterStyle = { marginBottom: '32px', textAlign: 'right' };

@connect(({ orderSettlement: { list }, loading }) => ({
  list,
  loading: loading.effects['orderSettlement/fetchList'],
}))
class SettlementRecord extends PureComponent {
  state = {
    type: 'a',
    page: 1,
    pageSize: 10,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'orderSettlement/fetchList',
    });
  }

  handleStandardTableChange = pagination => {
    const { type } = this.state;
    const { dispatch } = this.props;
    const { pageSize, current: page } = pagination;
    dispatch({
      type: 'orderSettlement/fetchList',
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
    const { pageSize } = this.state;
    dispatch({
      type: 'orderSettlement/fetchList',
      payload: {
        type: value,
        pageSize,
      },
    });
    this.setState({
      type: value,
      page: 1,
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
        title: '结算ID',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '结算时间',
        dataIndex: 'age',
        key: 'age',
      },
      {
        title: '类型',
        dataIndex: 'type',
        key: 'type',
      },
      {
        title: '结算金额',
        dataIndex: 'fee',
        key: 'fee',
      },
      {
        title: '结算状态',
        dataIndex: 'status',
        key: 'status',
      },
      {
        title: '结算备注',
        dataIndex: 'backup',
        key: 'backup',
      },
      {
        title: '操作',
        dataIndex: 'action',
        render: (text, record) => (
          <Fragment>
            <a onClick={() => this.reOperation(record)}>重新结算</a>
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
      <PageHeaderWrapper title="结算记录">
        <Card bordered={false} title="">
          <Row type="flex" justify="end" style={filterStyle}>
            <Col span={24}>
              <RadioGroup defaultValue="a" onChange={e => this.handleTypeChange(e)}>
                <RadioButton value="a">全部</RadioButton>
                <RadioButton value="b">处方</RadioButton>
                <RadioButton value="c">问诊</RadioButton>
              </RadioGroup>
            </Col>
          </Row>
          <Table
            loading={loading}
            dataSource={list}
            columns={columns}
            pagination={pagination}
            locale={{ emptyText: '暂无结算记录' }}
            onChange={this.handleStandardTableChange}
          />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default SettlementRecord;
