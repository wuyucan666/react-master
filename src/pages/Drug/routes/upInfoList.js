import React, {PureComponent, Fragment} from 'react'
import {connect} from 'dva'
import {Table, Card, Radio, Upload, Badge, Divider, Icon, Input, Form, Avatar, Switch, Modal, Popover, message} from 'antd'
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './index.less';
import config from "../../config";
import { getToken } from '../../../utils/authority'
import { getPageQuery } from '../../../utils/utils';

const {Search} = Input;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const confirm = Modal.confirm;

@connect(({supplier, loading}) => ({
  supplier,
  loading: loading.effects['supplier/listing'],
}))
@Form.create()
export default class UpInfoList extends PureComponent {

  cacheOriginData = {}

  state = {
    page: 1,
    pageSize: 10,
    id: 0,
    expandForm: false,
    defaultStatus: 'all',
    keyword: '',
    rows: [],
    editData: {},
    editState: {},
    defaultName: '',
    cadn: '',
    brand: ''
  }

  componentDidMount() {
    const { dispatch, match } = this.props
    const {pageSize} = this.state
    const params = getPageQuery()
    let cadn = ''
    let brand = ''
    let defaultName = ''
    if (params.cadn) cadn = params.cadn
    if (params.brand) brand = params.brand
    defaultName = `${brand} ${cadn}`
    let id = params.id
    this.setState({id, cadn, brand, defaultName})

    dispatch({
      type: 'supplier/listing',
      payload: {page: 1, rows: pageSize, sku_id: id},
      callback: (result) => {
        this.setState({rows: result.rows})
      }
    })
  }

  componentWillUnmount() {

  }

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    console.log('pagination', pagination)
    const {dispatch} = this.props;
    const {keyword, id, defaultStatus} = this.state
    this.setState({pageSize: pagination.pageSize, page: pagination.current})
    let payload = {rows: pagination.pageSize, page: pagination.current, sku_id: id}
    if (keyword) payload.keyword = keyword
    if (defaultStatus !== 'all') {
      payload.status = Number(defaultStatus)
    }
    dispatch({
      type: 'supplier/listing',
      payload,
      callback: (result) => {
        this.setState({rows: result.rows})
      }
    })
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
  }

  saveRow(e, record) {
    e.persist();
    this.toggleEditable(e, record.id);
    const { editData, id, pageSize, defaultStatus, keyword, defaultName } = this.state;
    const { dispatch } = this.props
    const item_sku = record.item_sku || {}
    let payload = {sku_id: id}
    console.log(editData[record.id])
    payload = Object.assign(payload, editData[record.id])
    if (item_sku.id) payload.id = item_sku.id
    if (record.id) payload.supplier_id = record.id

    if (payload.sale_price) {
      payload.sale_price = (payload.sale_price * 100).toFixed(0)
    }
    if(payload.service_fee){
      payload.service_fee = (payload.service_fee*100)
    }
    if (payload.auto_percent && payload.auto_percent !== '0') {
      payload.auto_percent = payload.auto_percent * 100
      if (!item_sku.cost_price) {
        message.warning('进货价为0，自动调价不能保存')
        return
      }
    }

    if (!payload.name) {
      payload.name = item_sku.name || defaultName
    }

    dispatch({
      type: 'supplier/saveSku',
      payload: payload,
      callback: (result) => {
        let payload = {page: 1, rows: pageSize, sku_id: id}
        if (keyword) payload.keyword = keyword
        if (defaultStatus !== 'all') {
          payload.status = Number(defaultStatus)
        }
        dispatch({
          type: 'supplier/listing',
          payload,
          callback: (result) => {
            this.setState({rows: result.rows})
          }
        })
      }
    })
    this.cancel(e, record.id)
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
    delete editData[key]
    this.setState({ rows: newData, editData });
  }

  handleInputChangeByShow = (e, record) => {
    const {editData} = this.state
    editData[record.id] || (editData[record.id] = {})
    let data = editData[record.id]
    data.name = e.target.value
    let newObj = Object.assign({}, editData)
    this.setState({editData: newObj})
  }

  handleInputChangeBySalePrice = (e, record) => {
    let value = e.target.value
    if (Number(value) > 21474836) return
    value = value.replace(/[^\d.]/g,""); //清除"数字"和"."以外的字符
    value = value.replace(/^\./g,""); //验证第一个字符是数字
    value = value.replace(/\.{2,}/g,"."); //只保留第一个, 清除多余的
    value = value.replace(".","$#$").replace(/\./g,"").replace("$#$",".");
    value = value.replace(/^(\-)*(\d+)\.(\d\d).*$/,'$1$2.$3'); //只能输入两个小数
    const {editData} = this.state
    editData[record.id] || (editData[record.id] = {})
    let data = editData[record.id]

    data.sale_price = value
    data.auto_percent = '0'
    let newObj = Object.assign({}, editData)
    this.setState({editData: newObj})
  }

  // //输入框修改诊疗服务费事件
  handleInputChangeByServicePrice = (e, record) => {
    const value = e.target.value
    if (Number(value) > 10000) return
    if (value && value.length > 5) return
    if(value && !/^(\d+|\d+\.\d{1,2})$/.test(value)) return
    const {editData} = this.state
    editData[record.id] || (editData[record.id] = {})
    let data = editData[record.id]
    if(!/^[0-9]+([0-9]*){0,999}$/.test(Number(value))) return message.success('诊疗费必须是0-10000整数')
    data.service_fee = value
    let newObj = Object.assign({}, editData)
    this.setState({editData: newObj})
    // console.log(value,record)
  }

  handleInputChangeByAutoPercent = (e, record) => {
    let value = e.target.value
    if (Number(value) > 1000 || Number(value) < -99.99) return
    value = value.replace(/[^\d.-]/g,""); //清除"数字","-"和"."以外的字符
    value = value.replace(/^\./g,""); //验证第一个字符是数字
    value = value.replace(/\.{2,}/g,"."); //只保留第一个, 清除多余的
    value = value.replace(".","$#$").replace(/\./g,"").replace("$#$",".");
    value = value.replace(/^(\-)*(\d+)\.(\d\d).*$/,'$1$2.$3'); //只能输入两个小数
    const {editData} = this.state
    const item_sku = record.item_sku || {}
    editData[record.id] || (editData[record.id] = {})
    let data = editData[record.id]

    // if (isNaN(value)) value = ''
    data.auto_percent = value
    const cost_price = item_sku.cost_price * 0.01
    if (cost_price <= 0) {
      message.warning('进货价未设置')
      return
    }
    data.sale_price = (cost_price + cost_price * value * 0.01).toFixed(2)
    if (data.sale_price <= 0) {
      message.warning('售价不能小于等于0')
      return
    }
    if (isNaN(data.sale_price)) data.sale_price = '0'
    let newObj = Object.assign({}, editData)
    this.setState({editData: newObj})
  }

  handleBeforeUpload = (file, fileList) => {
    const item = file || {}
    if (item.size > 2097152){// 2097152
      message.error('单个文件大小不能超过2MB')
      return false
    }
    return true
  }

  handleImageChange = ({ fileList }, record) => {
    const {editData} = this.state
    editData[record.id] || (editData[record.id] = {})
    let data = editData[record.id]
    const files = fileList.map(item => {
      if(item.response){
        const arr = Object.values(item.response)
        return arr[0]
      }
      return ''
    })
    data.images = files || []
    let newObj = Object.assign({}, editData)
    this.setState({editData: newObj})
  }
  
  handleSearch = (value) => {
    const {dispatch} = this.props;
    const {pageSize, id, defaultStatus} = this.state
    let payload = {page: 1, rows: pageSize, sku_id: id}
    if (value) payload.keyword = value
    if (defaultStatus !== 'all') {
      payload.status = Number(defaultStatus)
    }
    this.setState({keyword: value})
    dispatch({
      type: 'supplier/listing',
      payload: payload,
      callback: (result) => {
        this.setState({rows: result.rows})
      }
    })
  }
  //筛选功能
  handleStatus = (e) => {
    const {dispatch} = this.props;
    const {keyword, pageSize, id} = this.state

    const defaultStatus = e.target.value
    this.setState({defaultStatus})
    let payload = {page: 1, rows: pageSize, sku_id: id}
    if (keyword) payload.keyword = keyword
    if (defaultStatus !== 'all') {
      payload.status = Number(defaultStatus)
    }
    dispatch({
      type: 'supplier/listing',
      payload: payload,
      callback: (result) => {
        this.setState({rows: result.rows})
      }
    })
  }

  handleChecked = (isChecked, record) => {
    const self = this
    const { dispatch } = this.props
    const {id, pageSize, defaultStatus, keyword} = this.state
    let status = isChecked ? 2 : 1
    const item_sku = record.item_sku || {}
    let payload = {sku_id: id, status}
    if (item_sku.id) payload.id = item_sku.id
    if (record.id) payload.supplier_id = record.id

    if (isChecked && !item_sku.sale_price) {
      message.warning('售价为0，不可上架')
      return
    }

    let title = '下架提示'
    let content = '确定要下架吗?'
    isChecked && (title = '上架提示')
    isChecked && (content = '确定要上架吗?')
    confirm({
      title: title,
      content: content,
      okText: '确定',
      cancelText: '取消',
      onOk() {
        dispatch({
          type: 'supplier/saveSku',
          payload: payload,
          callback: (result) => {
            let payload = {page: 1, rows: pageSize, sku_id: id}
            if (keyword) payload.keyword = keyword
            if (defaultStatus !== 'all') {
              payload.status = Number(defaultStatus)
            }
            dispatch({
              type: 'supplier/listing',
              payload,
              callback: (result) => {
                self.setState({rows: result.rows})
              }
            })
          }
        })
      },
      onCancel() {
        let payload = {page: 1, rows: pageSize, sku_id: id}
        if (keyword) payload.keyword = keyword
        if (defaultStatus !== 'all') {
          payload.status = Number(defaultStatus)
        }
        dispatch({
          type: 'supplier/listing',
          payload,
          callback: (result) => {
            self.setState({rows: result.rows})
          }
        })
      },
    })
  }

  render() {
    const {supplier: model, loading,} = this.props
    const {pageSize, cadn, brand, defaultName, rows, id, defaultStatus, editData} = this.state
    const {listing:data} = model
    const skuIdStr = `SKU-${id.toString().padStart(8, '0')} ${cadn}（${brand}）`
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

    const uploadButton = (
      <div>
        <Icon type={'plus'} />
        <div style={{fontSize:'10px'}}>点击上传</div>
      </div>
    );

    let security = getToken()
    security || (security = {})
    const uploadUri = `${config.api}/upload?token=${security.token}`

    let columns = [
      {
        title: '供货商名称',
        dataIndex: 'name',
        width: '12%',
        key: 'name',
        render: (text, record, index) => {
          if (text && text.length > 30){
            text = text.slice(0, 30)
            text += '...'
          }
          return (
            <Fragment>
              <span style={{whiteSpace: 'pre-wrap',display: '-webkit-box',WebkitBoxOrient: 'vertical',WebkitLineClamp: 2,overflow: 'hidden'}}>{text}</span>
            </Fragment>
          )
        }
      },
      {
        title: '进货价',
        dataIndex: 'cost_price',
        key: 'cost_price',
        width: '12%',
        render: (text, record, index) => {
          const item_sku = record.item_sku || {}
          text = ((item_sku.cost_price || 0) * 0.01).toFixed(2)
          return (
            <Fragment>
              <span>{text}</span>
            </Fragment>
          )
        }
      },
      {
        title: '供货状态',
        dataIndex: 'inventory_status',
        key: 'inventory_status',
        width: '10%',
        render: (text, record, index) => {
          const item_sku = record.item_sku || {}
          let status = item_sku.inventory_status
          let inventory = item_sku.inventory || 0
          text = '无货'
          if (status == 1) text = '无货'
          if (status == 2) text = inventory
          status = status == 2 ? 'success' : 'default'
          return (<Badge status={status} text={text} />);
        }
      },
      {
        title: '商品图',
        dataIndex: 'image',
        key: 'image',
        width: '12%',
        render: (text, record, index) => {
          const item_sku = record.item_sku || {}
          const images = item_sku.images || []
          let imgUrl = images[0] || ''
          if (record.editable) {
            let item = editData[record.id] || {}
            if (item.images) imgUrl = item.images[0]
            return (
              <Upload
                name="avatar"
                accept="image/png,image/jpg,image/jpeg"
                action={uploadUri}
                listType="picture-card"
                className={styles.avatarUploader}
                showUploadList={false}
                beforeUpload={value => this.handleBeforeUpload(value)}
                onChange={value => this.handleImageChange(value, record)}
              >
                {imgUrl ? <img src={imgUrl} alt="avatar" style={{width:102}} /> : uploadButton}
              </Upload>
            );
          }

          return <Popover content={imgUrl && <img src={imgUrl} alt="avatar" style={{width:102}} />} title="">
                    <Avatar shape="square" size="large" src={imgUrl} />
                  </Popover>
        }
      },
      {
        title: '展示名称',
        dataIndex: 'show',
        key: 'show',
        width: '14%',
        render: (text, record, index) => {
          const item_sku = record.item_sku || {}
          text = item_sku.name || ''
          if (record.editable) {
            const data = editData[record.id] || {}
            let name = text || defaultName
            if (data.name !== undefined) name = data.name
            return (
              <Input
                value={name}
                autoFocus
                onChange={e => this.handleInputChangeByShow(e, record)}
                placeholder="展示名称"
                maxLength={50}
              />
            );
          }
          if (text && text.length > 30){
            text = text.slice(0, 30)
            text += '...'
          }
          return (
            <Fragment>
              <span style={{whiteSpace: 'pre-wrap',display: '-webkit-box',WebkitBoxOrient: 'vertical',WebkitLineClamp: 2,overflow: 'hidden'}}>{text}</span>
            </Fragment>
          )
        }
      },
      {
        title: '诊疗服务费',
        dataIndex: 'service_fee',
        key: 'service_fee',
        width: '10%',
        render: (text, record, index) => {
          const item_sku = record.item_sku || {}
          text = (item_sku.service_fee || 0)/100
          if (record.editable) {
            const data = editData[record.id] || {}
            let service_fee = text
            if (data.service_fee !== undefined) service_fee = data.service_fee
            return (
              <Input
                value={service_fee}
                autoFocus
                onChange={e => this.handleInputChangeByServicePrice(e, record)}
                placeholder="诊疗服务费"
              />
            );
          }
          return text;
        }
      },
      {
        title: '自动调价',
        dataIndex: 'auto_percent',
        key: 'auto_percent',
        width: '10%',
        render: (text, record, index) => {
          const item_sku = record.item_sku || {}
          text = ((item_sku.auto_percent || 0) * 0.01).toFixed(2)
          if (record.editable) {
            const data = editData[record.id] || {}
            let auto_percent = text
            if (data.auto_percent !== undefined) auto_percent = data.auto_percent
            return (
              <Input
                value={auto_percent}
                autoFocus
                onChange={e => this.handleInputChangeByAutoPercent(e, record)}
                placeholder="自动调价"
                addonAfter="%"
              />
            );
          }
          let styleValue = {fontFamily: 'SimSun', whiteSpace: 'pre-wrap'}
          if (Number(text) === 0) text = ''
          if (Number(text) > 0) text = `+${text}`
          if (text !== '') delete styleValue.fontFamily
          return (
            <Fragment>
              <span style={styleValue}>{text ? `${text}%` : '－－'}</span>
            </Fragment>
          )
        }
      },
      {
        title: '售价',
        dataIndex: 'sale_price',
        key: 'sale_price',
        width: '10%',
        render: (text, record, index) => {
          const item_sku = record.item_sku || {}
          text = ((item_sku.sale_price || 0) * 0.01).toFixed(2)
          if (record.editable) {
            const data = editData[record.id] || {}
            let sale_price = text
            if (data.sale_price !== undefined) sale_price = data.sale_price
            return (
              <Input
                value={sale_price}
                autoFocus
                onChange={e => this.handleInputChangeBySalePrice(e, record)}
                placeholder="售价"
              />
            );
          }
          return text;
        }
      },
      {
        title: '操作',
        width: '18%',
        key: 'action',
        render: (text, record, index) => {
          const { loading } = this.state;
          const item_sku = record.item_sku || {}
          const status = item_sku.status
          let checked = false
          status == 2 && (checked = true)
          if (!!record.editable && loading) {
            return null;
          }
          if (record.editable) {
            return (
              <span className={styles.ellipsis}>
                <a onClick={e => this.saveRow(e, record)}>保存</a>
                <Divider type="vertical" />
                <a onClick={e => this.cancel(e, record.id)}>取消</a>
              </span>
            );
          }
          return (
            <span className={styles.ellipsis}>
              <a onClick={e => this.toggleEditable(e, record.id)} >配置</a>
              <Divider type="vertical" />
              <Switch checkedChildren="上架" unCheckedChildren="下架"  checked={checked}
                      onChange={(checked) => this.handleChecked(checked, record)}/>
            </span>
          );
        }
      }
    ];

    const extraContent = (
      <div className={styles.extraContent}>
        <RadioGroup defaultValue={defaultStatus} onChange={(e) => this.handleStatus(e)}>
          <RadioButton value="all">全部</RadioButton>
          <RadioButton value="2">上架</RadioButton>
          <RadioButton value="1">下架</RadioButton>
        </RadioGroup>
      </div>
    )

    return (
      <PageHeaderWrapper title={skuIdStr}>
        <Card bordered={false}
              extra={extraContent}
              title={<Search style={{width: '370px'}} placeholder="输入供货商、展示名称关键字, 按Enter搜索" onSearch={(value) => this.handleSearch(value)}/>}>
          <div className={styles.tableList}>
            <Table
              rowKey="id"
              loading={loading}
              dataSource={listData.list}
              columns={columns}
              pagination={listData.pagination}
              onChange={this.handleStandardTableChange}
              locale={{emptyText:'无供货商信息'}}
            />
          </div>
        </Card>
      </PageHeaderWrapper>
    )
  }
}
