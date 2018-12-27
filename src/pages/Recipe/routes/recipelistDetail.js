import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import router from 'umi/router';
import { Card, Col, Row, Table, Input, Form, message, Modal, Divider } from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './index.less';
import { getPageQuery } from '@/utils/utils';
const FormItem = Form.Item;
@connect(({ recipe, loading }) => ({
  recipe,
  loading: loading.effects['recipe/getDetail'],
}))
@Form.create()
export default class RecipeListDetail extends PureComponent {
  state = {
    id: 0,
    pageSize: 10,
  };

  componentDidMount() {
    const { dispatch, match } = this.props;
    const id = match.params.id;
    this.setState({ id });
    const { pageSize } = this.state;
    const payload = { page: 1, rows: pageSize, id: id };
    dispatch({
      type: 'recipe/getDetail',
      payload,
    });
  }

  render() {
    const { recipe, loading } = this.props;
    const { pageSize } = this.state;
    const { data } = recipe;
    const status = data.status;
    const statusobj = {
      1: '未使用',
      2: '已使用',
      3: '已失效',
    };
    const amount = data.amount;
    const code = data.code || 0;
    const created_at = data.created_at;
    const doctor_name = data.doctor_name || '无';
    const doctor_phone = data.doctor_phone;
    const patient_name = data.patient_name || '无';
    const patient_phone = data.patient_phone;
    const disease = data.disease;
    const memo = data.memo;
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
    let columns = [
      {
        title: 'SKU编号',
        dataIndex: 'sku_code',
        width: '10%',
        key: 'sku_code',
        render: (text, record, index) => {
          text = text || '';
          text = 'SKU-' + '0000-' + String(text).padStart(4, '0');
          return (
            <Fragment>
              <span style={{ whiteSpace: 'pre-wrap' }}>{text}</span>
            </Fragment>
          );
        },
      },
      {
        title: '药品',
        dataIndex: 'name',
        width: '14%',
        key: 'name',
        render: (text, record, index) => {
          record.cadn = record.cadn || '无';
          record.brand = record.brand || '无';
          record.spec = record.spec || '无';
          text = record.cadn + ' ' + record.brand + ' ' + record.spec;
          return (
            <Fragment>
              <span style={{ whiteSpace: 'pre-wrap' }}>{text}</span>
            </Fragment>
          );
        },
      },
      {
        title: '数量',
        dataIndex: 'amount',
        key: 'amount',
        width: '10%',
        render: (text, record, index) => {
          text = text || 0;
          return (
            <Fragment>
              <span style={{ whiteSpace: 'pre-wrap' }}>{text}</span>
            </Fragment>
          );
        },
      },
      {
        title: '用法用量',
        dataIndex: 'usage',
        key: 'usage',
        width: '10%',
        render: (text, record, index) => {
          text = text || '无';
          return (
            <Fragment>
              <span style={{ whiteSpace: 'pre-wrap' }}>{text}</span>
            </Fragment>
          );
        },
      },
    ];
    return (
      <PageHeaderWrapper title="处方详情">
        <Card bordered={false} title="基本信息" style={{ marginBottom: 24 }}>
          <Row type="flex" justify="start">
            <Col md={8} sm={24}>
              <div className={styles.fromContent}>
                <div className={styles.statItem}>
                  <p>处方状态</p>
                  <p>{statusobj[status] || '未知'}</p>
                </div>
                <div className={styles.statItem}>
                  <p>药品数</p>
                  <p>{amount || 0}</p>
                </div>
              </div>
            </Col>
          </Row>
          <div className={styles.tableList} style={{ padding: '0px 30px' }}>
            <Form layout="inline">
              <Row type="flex" justify="start">
                <Col md={12} sm={24}>
                  <FormItem label="处方编号" style={{ marginBottom: 0 }}>
                    <span className="ant-form-text">{code}</span>
                  </FormItem>
                </Col>
                <Col md={12} sm={24}>
                  <FormItem label="医生" style={{ marginBottom: 0 }}>
                    <span className="ant-form-text">
                      {`${doctor_name}/${doctor_phone || '--'}`}
                    </span>
                  </FormItem>
                </Col>
              </Row>
              <Row type="flex" justify="start">
                <Col md={12} sm={24}>
                  <FormItem label="创建时间" style={{ marginBottom: 0 }}>
                    <span className="ant-form-text">
                      {moment(created_at).format('YYYY-MM-DD HH:mm')}
                    </span>
                  </FormItem>
                </Col>
                <Col md={12} sm={24}>
                  <FormItem label="患者" style={{ marginBottom: 0 }}>
                    <span className="ant-form-text">
                      {`${patient_name}/${patient_phone || '--'}`}
                    </span>
                  </FormItem>
                </Col>
              </Row>
            </Form>
            <Divider style={{ marginBottom: 30 }} />
            <Row type="flex" justify="start">
              <Col md={12} sm={24}>
                <div style={{ fontSize: 20, color: '#0b0b0b' }}>诊断信息</div>
                <Form layout="inline">
                  <Row type="flex" justify="start">
                    <Col md={12} sm={24}>
                      <FormItem label="确诊疾病" style={{ marginBottom: 0, width: '500px' }}>
                        <span className="ant-form-text">{disease || '--'}</span>
                      </FormItem>
                    </Col>
                  </Row>
                  <Row type="flex" justify="start">
                    <Col md={24} sm={24}>
                      <FormItem label="其他诊断结果" style={{ marginBottom: 0 }}>
                        <span className="ant-form-text">{memo || '--'}</span>
                      </FormItem>
                    </Col>
                  </Row>
                </Form>
              </Col>
            </Row>
          </div>
        </Card>
        <Card bordered={false} title="药品信息">
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
        </Card>
      </PageHeaderWrapper>
    );
  }
}
