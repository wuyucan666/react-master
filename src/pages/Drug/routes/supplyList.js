import React, {PureComponent, Fragment} from 'react'
import {connect} from 'dva'
import {Table, Card, Divider, Alert, Button, Icon, Input, Form, Tooltip, Modal} from 'antd'
import router from 'umi/router';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './index.less';

const {Search} = Input;
const FormItem = Form.Item;
const confirm = Modal.confirm;

const CreateForm = Form.create()(props => {
  const {
    handleAdd, handleModalVisible, handleInputChange, handleSupplierExist, modalVisible, form, strLength
  } = props;
  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      form.resetFields();
      handleAdd(fieldsValue);
    });
  };
  const cancelHandle = () => {
    form.resetFields();
    return handleModalVisible();
  };

  const formItemLayout = {
    labelCol: {
      span: 5
    },
    wrapperCol: {
      span: 15
    },
  }

  return (
    <Modal
      title="新建供货商"
      visible={modalVisible}
      width="50%"
      okText="确定"
      onOk={okHandle}
      onCancel={cancelHandle}
    >
      <Alert
        closable={false}
        showIcon
        message={<span>以下带<span style={{fontSize:'14px', color:'#f5222d', fontFamily: 'SimSun'}}>*</span>为必填项</span>}
        style={{ marginBottom: 20 }}
      />
      <FormItem {...formItemLayout} label={
        <span>
          供货商编号
          <em className={styles.optional}>
            <Tooltip title="需向开发人员获取供货商编号">
              <Icon type="info-circle-o" style={{ marginRight: 4 }} />
            </Tooltip>
          </em>
        </span>
      }>
        {form.getFieldDecorator('code', {
          validateTrigger: ['onBlur'],
          rules: [{
            required: true, validator: function (rule, value, callback){
              if (!value) return callback('请输入供货商编号')
              value = value.trim()
              if (!value) return callback('输入内容不能纯空格')
              handleSupplierExist('code', value, function (isExist) {
                if (isExist) {
                  return callback('此供货商编号已存在')
                }
                callback()
              })
            }
          }],
        })(
          <Input style={{paddingRight: '50px'}} maxLength='50' placeholder="请输供货商编号" onChange={(e) => handleInputChange(e, 'code')}/>
        )}
        <span style={{position: 'absolute', right: 10}}>{strLength['code'] || 0}/50</span>
      </FormItem>
      <FormItem {...formItemLayout} label="供货商名称">
        {form.getFieldDecorator('name', {
          validateTrigger: ['onBlur'],
          rules: [{
            required: true, validator: function (rule, value, callback){
              if (!value) return callback('请输入供货商名称')
              value = value.trim()
              if (!value) return callback('输入内容不能纯空格')
              handleSupplierExist('name', value, function (isExist) {
                if (isExist) {
                  return callback('此供货商已存在')
                }
                callback()
              })
            }
          }],
        })(
          <Input style={{paddingRight: '50px'}} maxLength='50' placeholder="请输入供货商名称" onChange={(e) => handleInputChange(e, 'name')}/>
        )}
        <span style={{position: 'absolute', right: 10}}>{strLength['name'] || 0}/50</span>
      </FormItem>
      <FormItem {...formItemLayout} label="供货商公司名称">
        {form.getFieldDecorator('company_name', {
          rules: [{
            transform: function (value){
              if (!value) return
              return value.trim();
            }
          }],
        })(
          <Input style={{paddingRight: '50px'}} maxLength='50' placeholder="请输入供货商公司名称" onChange={(e) => handleInputChange(e, 'company_name')}/>
        )}
        <span style={{position: 'absolute', right: 10}}>{strLength['company_name'] || 0}/50</span>
      </FormItem>
      <FormItem {...formItemLayout} label="联系人">
        {form.getFieldDecorator('contact', {
          rules: [{
            transform: function (value){
              if (!value) return
              return value.trim();
            }
          }],
        })(
          <Input style={{paddingRight: '50px'}} maxLength='50' placeholder="请输入联系人" onChange={(e) => handleInputChange(e, 'contact')}/>
        )}
        <span style={{position: 'absolute', right: 10}}>{strLength['contact'] || 0}/50</span>
      </FormItem>
      <FormItem {...formItemLayout} label="联系人抬头">
        {form.getFieldDecorator('contact_header', {
          rules: [{
            transform: function (value){
              if (!value) return
              return value.trim();
            }
          }],
        })(
          <Input style={{paddingRight: '50px'}} maxLength='10' placeholder="请输入联系人抬头" onChange={(e) => handleInputChange(e, 'contact_header')}/>
        )}
        <span style={{position: 'absolute', right: 10}}>{strLength['contact_header'] || 0}/10</span>
      </FormItem>
      <FormItem {...formItemLayout} label="联系人电话">
        {form.getFieldDecorator('contact_way', {
          rules: [{
            transform: function (value){
              if (!value) return
              return value.trim();
            }
          }],
        })(
          <Input style={{paddingRight: '50px'}} maxLength='20' placeholder="请输入联系人电话" onChange={(e) => handleInputChange(e, 'contact_way')}/>
        )}
        <span style={{position: 'absolute', right: 10}}>{strLength['contact_way'] || 0}/20</span>
      </FormItem>
    </Modal>
  );
})

@connect(({sku, supplier, loading}) => ({
  sku,
  supplier,
  loading: loading.effects['supplier/list'],
}))
@Form.create()
export default class SupplyList extends PureComponent {
  state = {
    page: 1,
    pageSize: 10,
    curRowIndex: -1,
    modalVisible: false,
    strLength: {},
    hasDelete: false,
  }

  componentDidMount() {
    const {dispatch} = this.props
    const {pageSize} = this.state
    dispatch({
      type: 'supplier/list',
      payload: {page: 1, rows: pageSize},
    })
    dispatch({
      type: 'sku/stat',
      payload: {page_type: 'supplier'},
    })
    dispatch({
      type: 'supplier/listDelete',
      payload: {page: 1, rows: 1},
      callback: (result) => {
        this.setState({hasDelete: !!result.total})
      }
    })
  }

  componentWillUnmount() {

  }

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    console.log('pagination', pagination)
    const {dispatch} = this.props;
    const {keyword} = this.state

    this.setState({pageSize: pagination.pageSize, page: pagination.current})
    let payload = {rows: pagination.pageSize, page: pagination.current}
    if (keyword) payload.keyword = keyword
    dispatch({
      type: 'supplier/list',
      payload
    })
  }

  handleRow = (record, index) => {
    return {
      onMouseEnter: () => {
        this.setState({curRowIndex: index})
      },  // 鼠标移入行
      onMouseLeave: () => {
        this.setState({curRowIndex: -1})
      },  // 鼠标移出行
    };
  }

  handleOrderList = (record) => {
    const {match} = this.props
    router.push({
      pathname: `${match.url}/supplyOrder`,
      search: `?id=${record.id}&name=${record.name}`,
    });
  }

  handleDetail = (record) => {
    const {match} = this.props
    router.push({
      pathname: `${match.url}/supplyInfoList`,
      search: `?id=${record.id}`,
    });
  }

  handleAdd = fields => {
    const {dispatch} = this.props
    const {pageSize} = this.state
    fields.page = 1
    fields.rows = pageSize
    dispatch({
      type: 'supplier/add',
      payload: fields,
      callback: () => {
        dispatch({
          type: 'sku/stat',
          payload: {page_type: 'supplier'},
        })
      }
    })
    this.setState({page: 1, modalVisible: false, strLength: {}})
  }

  handleInputChange = (e, field) => {
    let str = e
    if (typeof e !== 'string') {
      str = e.target.value
    }
    const {strLength} = this.state
    strLength[field] = str.length
    const newObj = Object.assign({}, strLength)
    this.setState({strLength: newObj})
  }

  handleSupplierExist = (key, value, callback) => {
    const { dispatch } = this.props
    const payload = {}
    payload[key] = value
    dispatch({
      type: 'supplier/exist',
      payload,
      callback: callback
    })
  }

  handleSearch = (value) => {
    const {dispatch, form} = this.props;
    const {pageSize} = this.state
    let payload = {page: 1, rows: pageSize}
    if (value) payload.keyword = value
    dispatch({
      type: 'supplier/list',
      payload
    })
    this.setState({keyword: value})
  }

  handleDelete = (id) => {
    const self = this
    const {dispatch} = this.props;
    confirm({
      title: '确定要删除此供货商?',
      content: '删除后，可在"已删除的供货商"恢复',
      okText: '确定',
      cancelText: '取消',
      onOk() {
        dispatch({
          type: 'supplier/remove',
          payload: {id},
          callback: () => {
            dispatch({
              type: 'sku/stat',
              payload: {page_type: 'supplier'},
            })
            self.setState({hasDelete: true})
          }
        })
      },
      onCancel() {
      },
    })
  }

  handleModalVisible = (flag) => {
    const {memo} = this.state
    let modalVisible = !!flag
    if (!modalVisible) this.setState({strLength: {}})
    this.setState({modalVisible});
  }

  handleDeleteListPage = () => {
    const {dispatch, match, location} = this.props
    router.push(`${match.url}/supplyDeleteList`);
  }

  render() {
    const {supplier: model, sku, loading,} = this.props
    const {pageSize, curRowIndex, modalVisible, strLength, hasDelete} = this.state
    const {data} = model
    const {stat} = sku
    const supplier_count = stat.supplier_count || 0
    const item_sku_count = stat.item_sku_count || 0
    const rows = data.rows || []
    const listData = {
      list: rows,
      pagination: {
        showSizeChanger: true,
        showQuickJumper: true,
        current: Number(data.page),
        total: Number(data.total),
        showTotal: function (total) { return `共${total}条`},
        pageSize
      }
    }
    const columns = [
      {
        title: '供货商编号',
        dataIndex: 'code',
        width: '20%',
        key: 'id',
        render: (text, record, index) => {
          text = text || ''
          return text
        }
      },
      {
        title: '供货商名称',
        dataIndex: 'name',
        width: '40%',
        key: 'name',
        render: (text, record, index) => {
          if (text && text.length > 30){
            text = text.slice(0, 30)
            text += '...'
          }
          return (
            <Fragment>
              <span style={{whiteSpace: 'pre-wrap'}}>{text}</span>
            </Fragment>
          )
        }
      },
      {
        title: '有货SKU',
        dataIndex: 'count',
        width: '20%',
        render: (text, record, index) => {
          return (
            <Fragment>
              <span>{text}</span>
            </Fragment>
          )
        }
      },
      {
        title: '操作',
        width: '20%',
        render: (text, record, index) => (
          <Fragment>
            <a onClick={() => this.handleOrderList(record)}>订单</a>
            <Divider type="vertical"/>
            <a onClick={() => this.handleDetail(record)}>详情</a>
            {
              curRowIndex === index && <span>
                <Divider type="vertical"/>
                <a onClick={() => this.handleDelete(record.id)}>删除</a>
              </span>
            }

          </Fragment>
        )
      },
    ];

    const action = (
      <div className={styles.extraContent}>
        <div className={styles.statItem}>
          <p>供货商总数</p>
          <p>{supplier_count || 0}</p>
        </div>
        <div className={styles.statItem}>
          <p>有货SKU总数</p>
          <p>{item_sku_count || 0}</p>
        </div>
      </div>
    )

    const extraContent = (
      <Button icon="plus" type="primary" onClick={() => this.handleModalVisible(true)}>
        新建供货商
      </Button>
    )

    const parentMethods = {
      handleAdd: this.handleAdd,
      handleModalVisible: this.handleModalVisible,
      handleInputChange: this.handleInputChange,
      handleSupplierExist: this.handleSupplierExist
    };

    return (
      <PageHeaderWrapper title="供货管理" action={action}>
        <Card bordered={false}
              title={<Search style={{width: '270px'}} placeholder="请输入供货商关键字, 按Enter搜索" onSearch={(value) => this.handleSearch(value)}/>} extra={extraContent}>
          <div className={styles.tableList}>
            <Table
              rowKey="id"
              loading={loading}
              dataSource={listData.list}
              columns={columns}
              pagination={listData.pagination}
              onChange={this.handleStandardTableChange}
              onRow={this.handleRow}
              locale={{emptyText:'暂无供货商'}}
            />
            {
              hasDelete && <div style={{position: 'relative', zIndex: 1}}>
                <a onClick={() => this.handleDeleteListPage()} style={{position: 'absolute', left: 0, bottom: rows.length ? 20 : -25}}><Icon type="delete" theme="outlined" style={{fontSize: 20}} /><span style={{marginLeft:'5px'}}>已删除的供货商</span></a>
              </div>
            }
          </div>
        </Card>
        <CreateForm {...parentMethods} modalVisible={modalVisible} strLength={strLength}/>
      </PageHeaderWrapper>
    )
  }
}
