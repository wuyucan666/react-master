import React, { PureComponent, Fragment } from 'react';
import Clipboard from 'react-clipboard-polyfill';
import { connect } from 'dva';
import {
  Table,
  Card,
  Radio,
  Row,
  Col,
  Divider,
  Icon,
  Input,
  Form,
  Tooltip,
  Switch,
  Button,
  Modal,
  message,
} from 'antd';
import router from 'umi/router';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './index.less';
import { getPageQuery } from '@/utils/utils';

const { Search } = Input;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const confirm = Modal.confirm;

@connect(({ sku, supplier, loading }) => ({
  sku,
  supplier,
  loading: loading.effects['sku/list'],
}))
@Form.create()
export default class SupplyInfoList extends PureComponent {
  cacheOriginData = {};

  state = {
    page: 1,
    pageSize: 10,
    isDel: false,
    id: 0,
    expandForm: false,
    isApi: false,
    strLength: {},
    rows: [],
    defaultStatus: 'all',
    keyword: '',
    editData: {},
    editState: {},
  };

  componentDidMount() {
    const { dispatch, match } = this.props;
    const { pageSize } = this.state;
    const params = getPageQuery();
    let isDel = false;
    let id = params.id;
    if (params.del) {
      isDel = !!params.del;
    }
    this.setState({ isDel, id });
    dispatch({
      type: 'sku/stat',
      payload: { page_type: 'supplier_detail', supplier_id: id },
    });
    dispatch({
      type: 'supplier/get',
      payload: { id: id },
      callback: info => {
        // this.refreshStrLength(info)
        let is_api = false;
        if (info.is_api === 2) is_api = true;
        this.setState({ isApi: is_api });
      },
    });
    dispatch({
      type: 'sku/list',
      payload: { type: 'supplier', page: 1, rows: pageSize, supplier_id: id },
      callback: result => {
        this.setState({ rows: result.rows });
      },
    });
  }

  componentWillUnmount() {}

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    console.log('pagination', pagination);
    const { dispatch } = this.props;
    const { keyword, id, defaultStatus } = this.state;
    this.setState({ pageSize: pagination.pageSize, page: pagination.current });
    let payload = {
      type: 'supplier',
      rows: pagination.pageSize,
      page: pagination.current,
      supplier_id: id,
    };
    if (keyword) payload.keyword = keyword;
    if (defaultStatus !== 'all') {
      payload.inventory_status = Number(defaultStatus);
    }
    dispatch({
      type: 'sku/list',
      payload,
      callback: result => {
        this.setState({ rows: result.rows });
      },
    });
  };

  refreshStrLength = (info, field) => {
    const { strLength } = this.state;
    const name = info.name || '';
    const company_name = info.company_name || '';
    const contact = info.contact || '';
    const contact_header = info.contact_header || '';
    const contact_way = info.contact_way || '';
    if (field) {
      const str = info[field] || '';
      strLength[field] = str.length;
    } else {
      strLength['name'] = name.length;
      strLength['company_name'] = company_name.length;
      strLength['contact'] = contact.length;
      strLength['contact_header'] = contact_header.length;
      strLength['contact_way'] = contact_way.length;
    }
    const newObj = Object.assign({}, strLength);
    this.setState({ strLength: newObj });
  };

  handleEditEnter = field => {
    const { dispatch, form } = this.props;
    const { id } = this.state;
    if (form.getFieldError(field)) return;
    const formData = form.getFieldsValue();
    console.log(formData[field]);
    this.handleCancelEditState(field);
    let payload = { id: id };
    payload[field] = formData[field];
    dispatch({
      type: 'supplier/update',
      payload,
      callback: info => {
        this.refreshStrLength(info, field);
      },
    });
  };

  handleEditState = itemName => {
    const { editState, isDel } = this.state;
    if (isDel) return;
    editState[itemName] = true;
    const newObj = Object.assign({}, editState);
    this.setState({ editState: newObj });
  };

  handleCancelEditState = itemName => {
    const { supplier } = this.props;
    const { editState } = this.state;
    const { info } = supplier;
    editState[itemName] = false;
    const newObj = Object.assign({}, editState);
    this.setState({ editState: newObj });
    this.refreshStrLength(info, itemName);
  };

  handleInputChange = (e, field) => {
    let str = e;
    if (typeof e !== 'string') {
      str = e.target.value;
    }
    const { strLength } = this.state;
    strLength[field] = str.length;
    const newObj = Object.assign({}, strLength);
    this.setState({ strLength: newObj });
  };

  handleSupplierExist = (value, callback) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'supplier/exist',
      payload: { name: value },
      callback: callback,
    });
  };

  renderSimpleForm() {
    const { form, supplier } = this.props;
    const { getFieldDecorator } = form;
    const { info } = supplier;
    return (
      <Form layout="inline">
        <Row type="flex" justify="start">
          <Col md={16} sm={24}>
            <FormItem label="供货商名称" style={{ marginBottom: 0 }}>
              <span className="ant-form-text">{info.name}</span>
            </FormItem>
          </Col>
          <span style={{ position: 'absolute', right: 40 }}>
            <a onClick={this.toggleForm}>
              展开 <Icon type="down" />
            </a>
          </span>
        </Row>
      </Form>
    );
  }

  toggleForm = () => {
    const { supplier } = this.props;
    const { expandForm } = this.state;
    const { info } = supplier;
    this.setState({
      expandForm: !expandForm,
      editState: {},
    });
    this.refreshStrLength(info);
  };

  renderAdvancedForm() {
    let handleSupplierExist = this.handleSupplierExist;
    const { strLength, editState, isDel } = this.state;
    const { form, supplier } = this.props;
    const { getFieldDecorator } = form;
    const { info } = supplier;
    const formItemLayout = {
      labelCol: {
        span: 5,
      },
      wrapperCol: {
        span: 15,
      },
    };
    return (
      <Form hideRequiredMark>
        <Row type="flex" justify="start">
          <Col md={20} sm={24}>
            <FormItem {...formItemLayout} label="供货商编号">
              <span className="ant-form-text" style={{ fontFamily: 'SimSun' }}>
                {info.code || '－－'}
              </span>
            </FormItem>
          </Col>
          <span style={{ position: 'absolute', right: 40 }}>
            <a onClick={this.toggleForm}>
              收起 <Icon type="up" />
            </a>
          </span>
        </Row>
        {/*<Row type="flex" justify="start">*/}
          {/*<Col md={20} sm={24}>*/}
            {/*<FormItem {...formItemLayout} label="密码">*/}
              {/*<span style={{paddingRight: "18px"}}>108929</span>*/}

              {/*<Clipboard*/}
                {/*render={({ clipboard, copyData }) => (*/}
                  {/*<Button*/}
                    {/*onClick={() => {*/}
                      {/*let content = "以下是你登录药房系统的账号和密码：\n"*/}
                      {/*content += "供货商账号：123456"*/}
                      {/*content += "密码：11111"*/}
                      {/*clipboard.setData('text/plain', content);*/}
                      {/*copyData();*/}
                    {/*}}*/}
                    {/*size="small"*/}
                  {/*>*/}
                    {/*复制账号密码*/}
                  {/*</Button>*/}
                {/*)}*/}
              {/*/>*/}
            {/*</FormItem>*/}
          {/*</Col>*/}
        {/*</Row>*/}
        <Row type="flex" justify="start">
          <Col md={20} sm={24}>
            <FormItem {...formItemLayout} label="供货商名称">
              {!editState['name'] ? (
                <Tooltip title={!isDel && '点击可编辑'}>
                  <span
                    className="ant-form-text"
                    style={{ fontFamily: 'SimSun', whiteSpace: 'pre' }}
                    onClick={() => this.handleEditState('name')}
                  >
                    {info.name || '－－'}
                  </span>
                </Tooltip>
              ) : (
                <span>
                  {form.getFieldDecorator('name', {
                    validateTrigger: ['onBlur'],
                    rules: [
                      {
                        required: true,
                        validator: function(rule, value, callback) {
                          if (!value) return callback('请输入供货商名称');
                          value = value.trim();
                          if (!value) return callback('输入内容不能纯空格');
                          handleSupplierExist(value, function(isExist) {
                            if (isExist) {
                              return callback('此供货商已存在');
                            }
                            callback();
                          });
                        },
                      },
                    ],
                    initialValue: info.name || '',
                  })(
                    <Input
                      style={{ paddingRight: '50px' }}
                      maxLength="50"
                      placeholder="请输入供货商名称"
                      onChange={e => this.handleInputChange(e, 'name')}
                    />
                  )}
                  <span style={{ position: 'absolute', right: 10 }}>
                    {strLength['name'] || 0}
                    /50
                    <span style={{ position: 'absolute', width: '150px', marginLeft: 20 }}>
                      <Button
                        type="primary"
                        htmlType="submit"
                        onClick={() => this.handleEditEnter('name')}
                      >
                        确定
                      </Button>
                      <Button
                        style={{ marginLeft: 15 }}
                        onClick={() => this.handleCancelEditState('name')}
                      >
                        取消
                      </Button>
                    </span>
                  </span>
                </span>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row type="flex" justify="start">
          <Col md={20} sm={24}>
            <FormItem {...formItemLayout} label="公司名称">
              {!editState['company_name'] ? (
                <Tooltip title={!isDel && '点击可编辑'}>
                  <span
                    className="ant-form-text"
                    style={{ fontFamily: 'SimSun', whiteSpace: 'pre' }}
                    onClick={() => this.handleEditState('company_name')}
                  >
                    {info.company_name || '－－'}
                  </span>
                </Tooltip>
              ) : (
                <span>
                  {form.getFieldDecorator('company_name', {
                    rules: [
                      {
                        transform: function(value) {
                          if (!value) return;
                          return value.trim();
                        },
                      },
                    ],
                    initialValue: info.company_name || '',
                  })(
                    <Input
                      style={{ paddingRight: '50px' }}
                      maxLength="50"
                      placeholder="请输入供货商公司名称"
                      onChange={e => this.handleInputChange(e, 'company_name')}
                    />
                  )}
                  <span style={{ position: 'absolute', right: 10 }}>
                    {strLength['company_name'] || 0}
                    /50
                    <span style={{ position: 'absolute', width: '150px', marginLeft: 20 }}>
                      <Button
                        type="primary"
                        htmlType="submit"
                        onClick={() => this.handleEditEnter('company_name')}
                      >
                        确定
                      </Button>
                      <Button
                        style={{ marginLeft: 15 }}
                        onClick={() => this.handleCancelEditState('company_name')}
                      >
                        取消
                      </Button>
                    </span>
                  </span>
                </span>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row type="flex" justify="start">
          <Col md={20} sm={24}>
            <FormItem {...formItemLayout} label="联系人">
              {!editState['contact'] ? (
                <Tooltip title={!isDel && '点击可编辑'}>
                  <span
                    className="ant-form-text"
                    style={{ fontFamily: 'SimSun', whiteSpace: 'pre' }}
                    onClick={() => this.handleEditState('contact')}
                  >
                    {info.contact || '－－'}
                  </span>
                </Tooltip>
              ) : (
                <span>
                  {form.getFieldDecorator('contact', {
                    rules: [
                      {
                        transform: function(value) {
                          if (!value) return;
                          return value.trim();
                        },
                      },
                    ],
                    initialValue: info.contact || '',
                  })(
                    <Input
                      style={{ paddingRight: '50px' }}
                      maxLength="50"
                      placeholder="请输入联系人"
                      onChange={e => this.handleInputChange(e, 'contact')}
                    />
                  )}
                  <span style={{ position: 'absolute', right: 10 }}>
                    {strLength['contact'] || 0}
                    /50
                    <span style={{ position: 'absolute', width: '150px', marginLeft: 20 }}>
                      <Button
                        type="primary"
                        htmlType="submit"
                        onClick={() => this.handleEditEnter('contact')}
                      >
                        确定
                      </Button>
                      <Button
                        style={{ marginLeft: 15 }}
                        onClick={() => this.handleCancelEditState('contact')}
                      >
                        取消
                      </Button>
                    </span>
                  </span>
                </span>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row type="flex" justify="start">
          <Col md={20} sm={24}>
            <FormItem {...formItemLayout} label="联系人抬头">
              {!editState['contact_header'] ? (
                <Tooltip title={!isDel && '点击可编辑'}>
                  <span
                    className="ant-form-text"
                    style={{ fontFamily: 'SimSun', whiteSpace: 'pre' }}
                    onClick={() => this.handleEditState('contact_header')}
                  >
                    {info.contact_header || '－－'}
                  </span>
                </Tooltip>
              ) : (
                <span>
                  {form.getFieldDecorator('contact_header', {
                    rules: [
                      {
                        transform: function(value) {
                          if (!value) return;
                          return value.trim();
                        },
                      },
                    ],
                    initialValue: info.contact_header || '',
                  })(
                    <Input
                      style={{ paddingRight: '50px' }}
                      maxLength="10"
                      placeholder="请输入联系人抬头"
                      onChange={e => this.handleInputChange(e, 'contact_header')}
                    />
                  )}
                  <span style={{ position: 'absolute', right: 10 }}>
                    {strLength['contact_header'] || 0}
                    /10
                    <span style={{ position: 'absolute', width: '150px', marginLeft: 20 }}>
                      <Button
                        type="primary"
                        htmlType="submit"
                        onClick={() => this.handleEditEnter('contact_header')}
                      >
                        确定
                      </Button>
                      <Button
                        style={{ marginLeft: 15 }}
                        onClick={() => this.handleCancelEditState('contact_header')}
                      >
                        取消
                      </Button>
                    </span>
                  </span>
                </span>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row type="flex" justify="start">
          <Col md={20} sm={24}>
            <FormItem {...formItemLayout} label="联系人电话">
              {!editState['contact_way'] ? (
                <Tooltip title={!isDel && '点击可编辑'}>
                  <span
                    className="ant-form-text"
                    style={{ fontFamily: 'SimSun', whiteSpace: 'pre' }}
                    onClick={() => this.handleEditState('contact_way')}
                  >
                    {info.contact_way || '－－'}
                  </span>
                </Tooltip>
              ) : (
                <span>
                  {form.getFieldDecorator('contact_way', {
                    rules: [
                      {
                        transform: function(value) {
                          if (!value) return;
                          return value.trim();
                        },
                      },
                    ],
                    initialValue: info.contact_way || '',
                  })(
                    <Input
                      style={{ paddingRight: '50px' }}
                      maxLength="20"
                      placeholder="请输入联系人电话"
                      onChange={e => this.handleInputChange(e, 'contact_way')}
                    />
                  )}
                  <span style={{ position: 'absolute', right: 10 }}>
                    {strLength['contact_way'] || 0}
                    /20
                    <span style={{ position: 'absolute', width: '150px', marginLeft: 20 }}>
                      <Button
                        type="primary"
                        htmlType="submit"
                        onClick={() => this.handleEditEnter('contact_way')}
                      >
                        确定
                      </Button>
                      <Button
                        style={{ marginLeft: 15 }}
                        onClick={() => this.handleCancelEditState('contact_way')}
                      >
                        取消
                      </Button>
                    </span>
                  </span>
                </span>
              )}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  renderForm() {
    const { expandForm } = this.state;
    return expandForm ? this.renderAdvancedForm() : this.renderSimpleForm();
  }

  getRowByKey(id, newData) {
    const { rows } = this.state;
    return (newData || rows).filter(item => item.id === id)[0];
  }

  toggleEditable = (e, key) => {
    e.preventDefault();
    const { rows } = this.state;
    const newData = rows.map(item => ({ ...item }));
    const target = this.getRowByKey(key, newData);
    if (target) {
      // 进入编辑状态时保存原始数据
      if (!target.editable) {
        this.cacheOriginData[key] = { ...target };
      }
      target.editable = !target.editable;
      this.setState({ rows: newData });
    }
  };

  saveRow(e, record) {
    const self = this;
    const skuId = record.id;
    e.persist();
    this.toggleEditable(e, skuId);
    const { editData, id, pageSize, defaultStatus, keyword, isApi } = this.state;
    const { dispatch } = this.props;
    console.log(editData[skuId]);
    const item_sku = record.item_sku || {};
    let payload = { sku_id: skuId, supplier_id: id };
    payload = Object.assign(payload, editData[skuId]);
    if (item_sku.id) payload.id = item_sku.id;
    if (payload.cost_price) {
      payload.cost_price = payload.cost_price * 100;
    } else {
      payload.cost_price = item_sku.cost_price || 0;
    }

    const srcProductCode = item_sku.product_code;
    const curProductCode = payload.product_code;
    let productCodeUpdateState = 1;
    if (!srcProductCode && curProductCode) productCodeUpdateState = 1; // 新增
    if (srcProductCode && !curProductCode && curProductCode !== undefined)
      productCodeUpdateState = 2; // 删除
    if (srcProductCode && curProductCode && srcProductCode !== curProductCode)
      productCodeUpdateState = 3; // 更新

    function reqUpdate(callback) {
      dispatch({
        type: 'supplier/saveSku',
        payload: payload,
        callback: result => {
          let payload = { type: 'supplier', page: 1, rows: pageSize, supplier_id: id };
          if (keyword) payload.keyword = keyword;
          if (defaultStatus !== 'all') {
            payload.inventory_status = Number(defaultStatus);
          }
          dispatch({
            type: 'sku/list',
            payload,
            callback: result => {
              self.setState({ rows: result.rows });
            },
          });
          dispatch({
            type: 'sku/stat',
            payload: { page_type: 'supplier_detail', supplier_id: id },
          });
          callback && callback();
        },
      });
    }
    if (isApi && productCodeUpdateState !== 1) {
      let title = '供货商产品ID编辑提示';
      let content = '确定更新产品ID？';
      if (productCodeUpdateState === 2) content = '清空产品ID将导致信息同步失效，确定清空？';
      if (productCodeUpdateState === 3)
        content = '改变产品ID将可能导致供货信息不正确或失效，确定修改？';
      confirm({
        title: title,
        content: content,
        okText: '确定',
        cancelText: '取消',
        onOk() {
          reqUpdate(() => {
            if (productCodeUpdateState === 2) message.success('已清空产品ID');
            if (productCodeUpdateState === 3) message.success('已修改产品ID');
          });
        },
        onCancel() {},
      });
    } else {
      reqUpdate(() => {
        if (isApi && productCodeUpdateState === 1 && curProductCode) {
          message.success('产品ID保存成功');
        } else {
          message.success('保存成功');
        }
      });
    }
    self.cancel(e, record.id);
  }

  cancel(e, key) {
    e.preventDefault();
    const { rows, editData } = this.state;
    const newData = rows.map(item => ({ ...item }));
    const target = this.getRowByKey(key, newData);
    if (this.cacheOriginData[key]) {
      Object.assign(target, this.cacheOriginData[key]);
      target.editable = false;
      delete this.cacheOriginData[key];
    }
    delete editData[key];
    this.setState({ rows: newData, editData });
  }

  handleSkuDetailPage = record => {
    const { dispatch } = this.props;
    router.push({
      pathname: `/drug/sku/skuList/skuInfo`,
      search: `?id=${record.id}`,
    });
  };

  handleSearch = value => {
    const { dispatch } = this.props;
    const { pageSize, id, defaultStatus } = this.state;
    let payload = { type: 'supplier', page: 1, rows: pageSize, supplier_id: id };
    if (value) payload.keyword = value;
    if (defaultStatus !== 'all') {
      payload.inventory_status = Number(defaultStatus);
    }
    this.setState({ keyword: value });
    dispatch({
      type: 'sku/list',
      payload: payload,
      callback: result => {
        this.setState({ rows: result.rows });
      },
    });
  };

  handleInventoryStatus = e => {
    const { dispatch } = this.props;
    const { keyword, pageSize, id } = this.state;

    const defaultStatus = e.target.value;
    this.setState({ defaultStatus });
    let payload = { type: 'supplier', page: 1, rows: pageSize, supplier_id: id };
    if (keyword) payload.keyword = keyword;
    if (defaultStatus !== 'all') {
      payload.inventory_status = Number(defaultStatus);
    }
    dispatch({
      type: 'sku/list',
      payload: payload,
      callback: result => {
        this.setState({ rows: result.rows });
      },
    });
  };

  handleChecked = (isChecked, record) => {
    const { editData } = this.state;
    console.log(editData);
    editData[record.id] || (editData[record.id] = {});
    let data = editData[record.id];
    data.inventory_status = isChecked ? 2 : 1;
    this.setState({ editData });
  };

  handleApiChecked = isChecked => {
    const self = this;
    const { dispatch } = this.props;
    const { id } = this.state;
    let is_api = isChecked ? 2 : 1;
    let payload = { id, is_api };

    let title = '确定要变更为人工维护?';
    let content = '变更为人工维护，原来API维护的进货价、最大库存量将被保存，人工修改后覆盖';
    isChecked && (title = '确定要变更为API维护?');
    isChecked && (content = '变更为API维护，原来人工维护的进货价、最大库存量将被覆盖');
    confirm({
      title: title,
      content: content,
      okText: '确定',
      cancelText: '取消',
      onOk() {
        dispatch({
          type: 'supplier/update',
          payload: payload,
          callback: result => {
            self.setState({ isApi: isChecked });
          },
        });
      },
      onCancel() {
        self.setState({ isApi: !isChecked });
      },
    });
  };

  handleInputChangeProductID = (e, record) => {
    const { editData } = this.state;
    editData[record.id] || (editData[record.id] = {});
    let data = editData[record.id];
    data.product_code = e.target.value;
    let newObj = Object.assign({}, editData);
    this.setState({ editData: newObj });
  };

  handleInputChangeByCostPrice = (e, record) => {
    let value = e.target.value;
    if (Number(value) > 21474836) return;
    // if (value && value.length > 8) return
    // if(value && !/^(\d+|\d+\.\d{1,2})$/.test(value)) return
    value = value.replace(/[^0-9.]*/g, ''); //清除"数字"和"."以外的字符
    value = value.replace(/^\./g, ''); //验证第一个字符是数字
    value = value.replace(/\.{2,}/g, '.'); //只保留第一个, 清除多余的
    value = value
      .replace('.', '$#$')
      .replace(/\./g, '')
      .replace('$#$', '.');
    value = value.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3'); //只能输入两个小数
    const { editData } = this.state;
    editData[record.id] || (editData[record.id] = {});
    let data = editData[record.id];

    data.cost_price = value;
    let newObj = Object.assign({}, editData);
    this.setState({ editData: newObj });
  };

  handleInputChangeInventory = (e, record) => {
    let value = e.target.value;
    if (isNaN(value)) return;
    if (Number(value) > 1000000) return;
    value = value.replace(/[^\d]/g, ''); //清除"数字"和"."以外的字符
    const { editData } = this.state;
    editData[record.id] || (editData[record.id] = {});
    let data = editData[record.id];

    data.inventory = value;
    let newObj = Object.assign({}, editData);
    this.setState({ editData: newObj });
  };

  render() {
    const { supplier, sku: model, loading } = this.props;
    const { pageSize, rows, isDel, defaultStatus, editData, isApi } = this.state;
    const { data, stat } = model;
    const { info } = supplier;
    const item_sku_count = stat.item_sku_count || 0;
    const listData = {
      list: rows,
      pagination: {
        showSizeChanger: true,
        showQuickJumper: true,
        current: Number(data.page),
        total: Number(data.total),
        showTotal: function(total) {
          return `共${total}条`;
        },
        pageSize,
      },
    };
    let columns = [
      {
        title: 'SKU编号',
        dataIndex: 'id',
        width: '10%',
        key: 'id',
        render: (text, record, index) => {
          text = 'SKU-' + text.toString().padStart(8, '0');
          return (
            <Fragment>
              {isDel ? text : <a onClick={e => this.handleSkuDetailPage(record)}>{text}</a>}
            </Fragment>
          );
        },
      },
      {
        title: '商品名',
        dataIndex: 'name',
        width: '14%',
        key: 'name',
        render: (text, record, index) => {
          const spu = record.spu || {};
          const brand = spu.brand || '';
          const cadn = spu.cadn || '';
          text = brand + ' ' + cadn;
          if (text && text.length > 30) {
            text = text.slice(0, 30);
            text += '...';
          }
          return (
            <Fragment>
              <span style={{ whiteSpace: 'pre-wrap' }}>{text}</span>
            </Fragment>
          );
        },
      },
      {
        title: '供货状态',
        dataIndex: 'status',
        key: 'status',
        width: '10%',
        render: (text, record, index) => {
          const item_sku = record.item_sku || {};
          const status = item_sku.inventory_status;
          text = '无货';
          if (status == 1) text = '无货';
          if (status == 2) text = '有货';
          if (!isApi && record.editable) {
            let checked = false;
            status == 2 && (checked = true);
            return (
              <Switch
                checkedChildren="有货"
                unCheckedChildren="无货"
                defaultChecked={checked}
                onChange={checked => this.handleChecked(checked, record)}
              />
            );
          }
          return text;
        },
      },
    ];

    if (isApi) {
      columns.push({
        title: '供货商产品ID',
        dataIndex: 'item_sku.product_code',
        key: 'item_sku.product_code',
        width: '14%',
        render: (text, record, index) => {
          const item_sku = record.item_sku || {};
          const sync_status = item_sku.sync_status;
          const product_code = item_sku.product_code;
          let styleValue = { fontFamily: 'SimSun', whiteSpace: 'pre-wrap' };
          if (sync_status == 1 && product_code) styleValue.color = '#ff0000';
          text = item_sku.product_code;
          if (record.editable) {
            const data = editData[record.id] || {};
            let name = text || '';
            if (data.product_code !== undefined) name = data.product_code;
            return (
              <Input
                value={name}
                autoFocus
                onChange={e => this.handleInputChangeProductID(e, record)}
                placeholder="供货商产品ID"
                maxLength={20}
              />
            );
          }
          text = text || '－－';
          if (text !== '－－') delete styleValue.fontFamily;
          return (
            <Fragment>
              <span style={styleValue}>{text}</span>
            </Fragment>
          );
        },
      });
    }

    columns.push({
      title: '进货价',
      dataIndex: 'cost_price',
      key: 'cost_price',
      width: '14%',
      render: (text, record, index) => {
        const item_sku = record.item_sku || {};
        text = ((item_sku.cost_price || 0) * 0.01).toFixed(2);
        if (!isApi && record.editable) {
          const data = editData[record.id] || {};
          let cost_price = text;
          if (data.cost_price !== undefined) cost_price = data.cost_price;
          return (
            <Input
              value={cost_price}
              autoFocus
              onChange={e => this.handleInputChangeByCostPrice(e, record)}
              placeholder="进货价"
              // type="number"
            />
          );
        }
        return text;
      },
    });
    columns.push({
      title: '最大库存量',
      dataIndex: 'inventory',
      key: 'inventory',
      width: '14%',
      render: (text, record, index) => {
        const item_sku = record.item_sku || {};
        text = item_sku.inventory || 0;
        if (!isApi && record.editable) {
          const data = editData[record.id] || {};
          let inventory = text;
          if (data.inventory !== undefined) inventory = data.inventory;
          return (
            <Input
              value={inventory}
              autoFocus
              onChange={e => this.handleInputChangeInventory(e, record)}
              placeholder="最大库存量"
            />
          );
        }
        return text;
      },
    });
    if (!isDel) {
      columns.push({
        title: '操作',
        width: '14%',
        key: 'action',
        render: (text, record, index) => {
          const { loading } = this.state;
          if (!!record.editable && loading) {
            return null;
          }
          if (record.editable) {
            return (
              <span>
                <a onClick={e => this.saveRow(e, record)}>保存</a>
                <Divider type="vertical" />
                <a onClick={e => this.cancel(e, record.id)}>取消</a>
              </span>
            );
          }
          return (
            <span>
              <a onClick={e => this.toggleEditable(e, record.id)}>编辑</a>
            </span>
          );
        },
      });
    }

    const action = (
      <div className={styles.extraContent}>
        <div className={styles.statItem}>
          <p>有货SKU总数</p>
          <p>{item_sku_count}</p>
        </div>
      </div>
    );

    const extraContent = (
      <div className={styles.extraContent} style={{ marginTop: 30 }}>
        <span style={{ marginRight: 50 }}>
          <span style={{}}>维护方式</span>
          <Switch
            style={{ marginLeft: 10, width: 57 }}
            checkedChildren="API"
            unCheckedChildren="人工"
            checked={isApi}
            onChange={checked => this.handleApiChecked(checked)}
          />
        </span>
        <RadioGroup defaultValue={defaultStatus} onChange={e => this.handleInventoryStatus(e)}>
          <RadioButton value="all">全部</RadioButton>
          <RadioButton value="2">有货</RadioButton>
          <RadioButton value="1">无货</RadioButton>
        </RadioGroup>
      </div>
    );

    return (
      <PageHeaderWrapper title="供货商详情" action={action}>
        <Card bordered={false} style={{ marginBottom: 24 }}>
          <div>{this.renderForm()}</div>
        </Card>
        <Card
          bordered={false}
          extra={extraContent}
          title={
            <div>
              <div style={{ marginBottom: '10px' }}>供货药品列表</div>
              <Search
                style={{ width: '370px' }}
                placeholder="输入商品名关键字, 按Enter搜索"
                onSearch={value => this.handleSearch(value)}
              />
            </div>
          }
        >
          <div className={styles.tableList}>
            <Table
              rowKey="id"
              loading={loading}
              dataSource={listData.list}
              columns={columns}
              pagination={listData.pagination}
              onChange={this.handleStandardTableChange}
              locale={{ emptyText: '需要在SKU库新建药品才能配置供货药品哦' }}
            />
          </div>
        </Card>
      </PageHeaderWrapper>
    );
  }
}
