import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Table, Card, Row, Col, Divider, Icon, Form, Badge, Button } from 'antd';
import router from 'umi/router';
import moment from 'moment';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './index.less';
import { getPageQuery } from '@/utils/utils';

const FormItem = Form.Item;

@connect(({ supplierOrder, loading }) => ({
  supplierOrder,
  loading: loading.effects['supplierOrder/get'],
}))
@Form.create()
class SupplyOrderInfo extends PureComponent {
  state = {
    id: 0,
    // rows: [{ id: 1, name: '阿达木单抗(修美乐)', spec: '0.3g*4片/盒', price: 817.89, amount: 87 }],
    synching: false,
    logistics: {},
  };

  componentDidMount() {
    const { dispatch } = this.props;
    const { id } = getPageQuery();
    this.setState({ id });
    dispatch({
      type: 'supplierOrder/get',
      payload: { id },
    });
    dispatch({
      type: 'supplierOrder/logistics',
      payload: { id },
      callback: info => {
        this.setState({ logistics: info });
      },
    });
  }

  handleOpenLogistics = () => {
    const { match } = this.props;
    const { id } = this.state;
    window.open(`#${match.url}/logistics?id=${id}`);
  };

  handleOrderDetailPage = id => {
    router.push({
      pathname: `/order/list/detail`,
      search: `?id=${id}`,
    });
  };

  handleOrderSync = id => {
    const { dispatch } = this.props;
    this.setState({ synching: true });
    dispatch({
      type: 'supplierOrder/sync',
      payload: { id },
      callback: () => {
        this.setState({ synching: false });
      },
    });
  };

  render() {
    const { supplierOrder: model, loading } = this.props;
    const { synching, logistics } = this.state;
    const { info } = model;
    const { name, order = {}, fee = 0 } = info;
    console.log(model);
    const supplyCode = info.code || '无';
    const totalPrice = fee ? (fee * 0.01).toFixed(2) : 0;
    const servicePrice = info.service_fee ? (info.service_fee * 0.01).toFixed(2) : 0;
    const createdAt = info.created_at;
    const statusStr = info.status || '未知';
    const delivered = info.delivered || {};
    const orderCode = order.order_code || '';
    const syncAt = info.sync_at || createdAt;
    const orderType = info.status === 100 ? 'API' : '人工';
    const lastUpdate = moment(info.status_at).format('YYYY-MM-DD HH:mm');
    let drugAmount = 0;
    const itemSkus = info.item_skus || [];
    itemSkus.forEach(item => {
      drugAmount += item.amount;
    });
    const listData = {
      list: itemSkus,
    };
    const columns = [
      {
        title: 'SKU编号',
        dataIndex: 'sku_code',
        width: '10%',
        key: 'sku_code',
        render: text => (
          <Fragment>
            <span style={{ whiteSpace: 'pre-wrap' }}>{text}</span>
          </Fragment>
        ),
      },
      {
        title: '药品名称',
        dataIndex: 'name',
        width: '14%',
        key: 'name',
        render: (text, record) => (
          <Fragment>
            <span style={{ whiteSpace: 'pre-wrap' }}>{`${record.cadn}（${record.brand}）`}</span>
          </Fragment>
        ),
      },
      {
        title: '规格',
        dataIndex: 'spec',
        key: 'spec',
        width: '10%',
        render: text => (
          <Fragment>
            <span style={{ whiteSpace: 'pre-wrap' }}>{text}</span>
          </Fragment>
        ),
      },
      {
        title: '供货价',
        dataIndex: 'cost_price',
        key: 'cost_price',
        width: '10%',
        render: text => (
          <Fragment>
            <span style={{ whiteSpace: 'pre-wrap' }}>{((text || 0) * 0.01).toFixed(2)}</span>
          </Fragment>
        ),
      },
      {
        title: '售价',
        dataIndex: 'price',
        key: 'price',
        width: '10%',
        render: text => (
          <Fragment>
            <span style={{ whiteSpace: 'pre-wrap' }}>{((text || 0) * 0.01).toFixed(2)}</span>
          </Fragment>
        ),
      },
      {
        title: '数量',
        dataIndex: 'amount',
        key: 'amount',
        width: '10%',
        render: text => (
          <Fragment>
            <span style={{ whiteSpace: 'pre-wrap' }}>{text}</span>
          </Fragment>
        ),
      },
    ];

    let syncStatus = info.sync_status;
    syncStatus = +syncStatus === 2 ? 'success' : 'error';
    const action = (
      <span style={{ fontWeight: 'bold' }}>
        {info.sync_status === 0 ? (
          <span style={{ marginRight: 10 }}>
            {`上次同步时间: ${moment(syncAt).format('YYYY-MM-DD HH:mm')}`}
          </span>
        ) : (
          <Badge
            style={{ marginRight: 10 }}
            status={syncStatus}
            text={`上次同步时间: ${moment(syncAt).format('YYYY-MM-DD HH:mm')}`}
          />
        )}
        <a onClick={() => this.handleOrderSync(info.id)}>
          <Icon
            style={{ fontSize: 19, color: '#000000', fontWeight: 'bolder' }}
            type="sync"
            spin={synching}
          />
        </a>
      </span>
    );

    return (
      <PageHeaderWrapper title="订单详情" action={action}>
        <Card bordered={false} title="订单信息" style={{ marginBottom: 24 }}>
          <Row type="flex" justify="start">
            <Col md={24} sm={24}>
              <div className={styles.fromContent}>
                <div className={styles.statItem}>
                  <p>供应商</p>
                  <p>{name}</p>
                </div>
                <div className={styles.statItem}>
                  <p>订单状态</p>
                  <p>{statusStr}</p>
                </div>
                <div className={styles.statItem}>
                  <p>订单合计</p>
                  <p>
                    {`¥${totalPrice}`}
                    <span style={{ fontSize: '14px', marginLeft: '10px' }}>
                      {`(含诊疗服务费 ${servicePrice})`}
                    </span>
                  </p>
                </div>
                <div className={styles.statItem}>
                  <p>药品数</p>
                  <p>{drugAmount}</p>
                </div>
              </div>
            </Col>
          </Row>
          <div className={styles.tableList} style={{ padding: '0px 30px' }}>
            <Form layout="inline">
              <Row type="flex" justify="start">
                <Col md={8} sm={24}>
                  <FormItem label="供货商订单编号" style={{ marginBottom: 0 }}>
                    <span className="ant-form-text">{supplyCode}</span>
                  </FormItem>
                </Col>
                <Col md={8} sm={24}>
                  <FormItem label="创建时间" style={{ marginBottom: 0 }}>
                    <span className="ant-form-text">
                      {moment(createdAt).format('YYYY-MM-DD HH:mm')}
                    </span>
                  </FormItem>
                </Col>
                <Col md={8} sm={24}>
                  <FormItem label="订单类型" style={{ marginBottom: 0 }}>
                    <span className="ant-form-text">{orderType}</span>
                  </FormItem>
                </Col>
              </Row>
              <Row type="flex" justify="start">
                <Col md={8} sm={24}>
                  <FormItem label="平台订单编号" style={{ marginBottom: 0 }}>
                    <a
                      className="ant-form-text"
                      onClick={() => {
                        this.handleOrderDetailPage(order.id);
                      }}
                    >
                      {orderCode}
                    </a>
                  </FormItem>
                </Col>
                <Col md={8} sm={24}>
                  <FormItem label="发货时间" style={{ marginBottom: 0 }}>
                    <span className="ant-form-text">{lastUpdate}</span>
                  </FormItem>
                </Col>
                <Col md={8} sm={24}>
                  <FormItem label="上次同步时间" style={{ marginBottom: 0 }}>
                    <span className="ant-form-text">456</span>
                  </FormItem>
                </Col>
              </Row>
            </Form>
            <Divider style={{ marginBottom: 30 }} />
            <Row type="flex" justify="start">
              <Col md={12} sm={24}>
                <div style={{ fontSize: 20, color: '#0b0b0b' }}>收货信息</div>
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
                    <Col md={24} sm={24}>
                      <FormItem label="收货地址" style={{ marginBottom: 0 }}>
                        <span className="ant-form-text">{delivered.address || '无'}</span>
                      </FormItem>
                    </Col>
                  </Row>
                </Form>
              </Col>
              <Col md={12} sm={24}>
                <div style={{ fontSize: 20, color: '#0b0b0b' }}>
                  物流信息
                  {logistics.track_no && (
                    <Button
                      style={{ marginLeft: 30 }}
                      size="small"
                      onClick={() => this.handleOpenLogistics(logistics.com, logistics.track_no)}
                    >
                      查看详情
                    </Button>
                  )}
                </div>
                <Form layout="inline">
                  <Row type="flex" justify="start">
                    <Col md={12} sm={24}>
                      <FormItem label="物流公司" style={{ marginBottom: 0 }}>
                        <span className="ant-form-text">
                          {logistics.company_name || '暂无信息'}
                        </span>
                      </FormItem>
                    </Col>
                    <Col md={12} sm={24}>
                      <FormItem label="运单号" style={{ marginBottom: 0 }}>
                        <span className="ant-form-text">{logistics.track_no || '暂无信息'}</span>
                      </FormItem>
                    </Col>
                  </Row>
                </Form>
              </Col>
            </Row>
          </div>
        </Card>
        <Card bordered={false} title="处方药品清单">
          <div className={styles.tableList}>
            <Table
              rowKey="product_code"
              loading={loading}
              dataSource={listData.list}
              columns={columns}
              pagination={false}
              onChange={this.handleStandardTableChange}
              locale={{ emptyText: '暂无处方药品清单' }}
            />
          </div>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default SupplyOrderInfo;
