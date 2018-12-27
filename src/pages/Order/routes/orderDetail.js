import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import moment from 'moment';
import {
  Card,
  Col,
  Row,
  Button,
  Table,
  Icon,
  Input,
  Divider,
  Tooltip,
  Form,
  message,
  Modal,
} from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './orderDetail.less';
const FormItem = Form.Item;
const { TextArea } = Input;
@connect(({ order, loading }) => ({
  order,
  loading: loading.effects['order/getDetail'],
}))
@Form.create()
export default class RecipeListDetail extends PureComponent {
  state = {
    id: '',
    editState: false,
    strLength: 0,
    cacheMemo: '',
  };

  componentDidMount() {
    const { dispatch, match } = this.props;
    const id = match.params.id;
    console.log(id);
    this.setState({ id });
    const { pageSize } = this.state;
    const payload = { page: 1, rows: pageSize, id: id };
    dispatch({
      type: 'order/getDetail',
      payload,
      callback: info => {
        const order = info.order || {};
        const memo = info.memo || order.memo || '';
        this.setState({ cacheMemo: memo });
      },
    });
  }

  handleEditState = () => {
    const { order: model } = this.props;
    const { data } = model;
    const order = data.order || {};
    const memo = data.memo || order.memo || '';
    this.setState({ editState: true, strLength: memo.length, cacheMemo: memo });
  };

  handleInputChange = e => {
    let memo = e;
    if (typeof e !== 'string') {
      memo = e.target.value;
    }

    this.setState({ strLength: memo.length, cacheMemo: memo });
  };

  handleEditEnter = e => {
    const { dispatch } = this.props;
    const { id, cacheMemo } = this.state;
    dispatch({
      type: 'order/update',
      payload: { id, memo: cacheMemo },
      callback: info => {
        this.setState({ editState: false });
      },
    });
  };

  handleCancelEditState = () => {
    const { order: model } = this.props;
    const { data } = model;
    const order = data.order || {};
    const memo = data.memo || order.memo || '';
    this.setState({ editState: false, strLength: memo.length, cacheMemo: memo });
  };

  toDetail = id => {
    const { match, location, history } = this.props;
    console.log(match, location, history);
    // let str = match.url;
    // str = str.replace(/str/, 'recipe/list/detail');
    // router.push({
    //   pathname: `${str}/${id}`,
    // });
  };
  render() {
    const { order, loading } = this.props;
    const { pageSize, editState, cacheMemo, strLength, id } = this.state;
    const { data } = order;
    console.log(data);
    const payStatus = data.payStatus;
    const obj = {
      0: '未支付',
      1: '未支付',
      2: '已支付',
    };
    const fee = data.fee || 0;
    const service_fee = data.service_fee || 0;
    const subOrders = data.subOrders || [];
    let mount = 0;
    subOrders.forEach(item => {
      mount = mount + item.orderItems.length;
    });
    console.log(mount);
    const delivered = data.delivered || {};
    const code = data.code;
    const created_at = data.created_at;
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
    const memo = cacheMemo;

    return (
      <PageHeaderWrapper title="平台订单详情">
        <Card bordered={false} style={{ marginBottom: 24 }}>
          <Row type="flex" justify="start">
            <Col md={8} sm={24}>
              <div
                className={styles.fromContent}
                style={{ display: 'flex', justifyContent: 'space-between' }}
              >
                <div className={styles.statItem}>
                  <p>支付状态</p>
                  <p>{obj[payStatus] || '未知'}</p>
                </div>
                <div className={styles.statItem}>
                  <p>订单合计</p>
                  <p>
                    {`¥${(fee / 100).toFixed(2)}`}{' '}
                    <span>{`(含诊疗费费  ${(service_fee / 100).toFixed(2)})`}</span>
                  </p>
                </div>
                <div className={styles.statItem}>
                  <p>药品总数</p>
                  <p>{parseInt(mount)}</p>
                </div>
              </div>
            </Col>
          </Row>
          <div style={{ marginBottom: 30 }} />
          <Row type="flex" justify="start">
            <Col md={8} sm={24}>
              <div style={{ fontSize: 20, color: '#0b0b0b' }}>
                <Icon type="shop" /> {'健客网'}
              </div>
            </Col>
          </Row>
          {/* <Card bordered={false}>
            <div className={styles.tableList}>
              <Table
                rowKey="sku_code"
                loading={loading}
                dataSource={listData.list}
                columns={columns}
                pagination={false}
                onChange={this.handleStandardTableChange}
                locale={{ emptyText: '暂无处方药品清单' }}
              />
            </div>
          </Card> */}
        </Card>
        <Card bordered={false} title="收货信息" style={{ borderBottom: '1px solid #e8e8e8' }}>
          <div className={styles.tableList} style={{ padding: '0px 30px' }}>
            <Form layout="inline">
              <Row type="flex" justify="start">
                <Col md={12} sm={24}>
                  <FormItem label="收货人" style={{ marginBottom: 0 }}>
                    <span className="ant-form-text">{delivered.name || '无'}</span>
                  </FormItem>
                </Col>
                <Col md={12} sm={24}>
                  <FormItem label="手机号" style={{ marginBottom: 0 }}>
                    <span className="ant-form-text">{delivered.phone || '无'}</span>
                  </FormItem>
                </Col>
              </Row>
              <Row type="flex" justify="start">
                <Col md={12} sm={24}>
                  <FormItem label="收货地址" style={{ marginBottom: 0, width: '800px' }}>
                    <span className="ant-form-text">{delivered.address || '无'}</span>
                  </FormItem>
                </Col>
              </Row>
            </Form>
          </div>
        </Card>
        <Card bordered={false} title="基础信息" style={{ borderBottom: '1px solid #e8e8e8' }}>
          <div className={styles.tableList} style={{ padding: '0px 30px' }}>
            <Form layout="inline">
              <Row type="flex" justify="start">
                <Col md={12} sm={24}>
                  <FormItem label="订单编号" style={{ marginBottom: 0 }}>
                    <span className="ant-form-text">{code}</span>
                  </FormItem>
                </Col>
                <Col md={12} sm={24}>
                  <FormItem label="创建时间" style={{ marginBottom: 0 }}>
                    <span className="ant-form-text">
                      {moment(created_at).format('YYYY-MM-DD HH:mm')}
                    </span>
                  </FormItem>
                </Col>
              </Row>
              <Row type="flex" justify="start">
                <Col md={12} sm={24}>
                  <FormItem label="处方编号" style={{ marginBottom: 0, width: '800px' }}>
                    <span className="ant-form-text">
                      <a
                        className="ant-form-text"
                        onClick={() => {
                          this.toDetail(id);
                        }}
                      >
                        {code}
                      </a>
                    </span>
                  </FormItem>
                </Col>
              </Row>
            </Form>
          </div>
        </Card>
        <Card bordered={false}>
          <Row>
            <Col md={12} sm={24}>
              <div style={{ fontSize: 16, color: '#0b0b0b', marginBottom: 10 }}>备注</div>
              <div style={{ color: 'rgba(0, 0, 0, 0.65)' }}>
                {!editState ? (
                  <Tooltip title={'点击可编辑'}>
                    <span
                      className="ant-form-text"
                      style={{ whiteSpace: 'pre-wrap' }}
                      onClick={() => this.handleEditState()}
                    >
                      {memo || '请输入备注'}
                    </span>
                  </Tooltip>
                ) : (
                  <span>
                    <TextArea
                      style={{
                        display: 'block',
                        resize: 'none',
                        width: '100%',
                        paddingBottom: '20px',
                      }}
                      placeholder="请输入备注"
                      autosize={{ minRows: 1, maxRows: 35 }}
                      maxLength="1000"
                      defaultValue={memo}
                      onChange={value => this.handleInputChange(value)}
                    />
                    <div style={{ position: 'relative', height: 15 }}>
                      <span style={{ position: 'absolute', right: 10, bottom: 15 }}>
                        {strLength || 0}
                        /1000
                        <span
                          style={{
                            position: 'absolute',
                            width: '150px',
                            right: -17,
                            marginTop: 33,
                          }}
                        >
                          <Button
                            type="primary"
                            htmlType="submit"
                            onClick={() => this.handleEditEnter()}
                          >
                            确定
                          </Button>
                          <Button
                            style={{ marginLeft: 15 }}
                            onClick={() => this.handleCancelEditState()}
                          >
                            取消
                          </Button>
                        </span>
                      </span>
                    </div>
                  </span>
                )}
              </div>
            </Col>
          </Row>
        </Card>
      </PageHeaderWrapper>
    );
  }
}
