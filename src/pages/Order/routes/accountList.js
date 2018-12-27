import React, {PureComponent, Fragment} from 'react'
import {connect} from 'dva'
import {Table, Card, Divider, Row, Button, Icon, Input, Badge, Menu, Dropdown,Form, Select , message, Modal} from 'antd'
import moment from 'moment'
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { getPageQuery } from '@/utils/utils';
import styles from './accountList.less'
import config from "../../config";
@connect(({order, loading}) => ({
  order,
  loading: loading.effects['order/listcheck'],
}))
@Form.create()

export default class AccountList extends PureComponent {
  state = {
    page: 1,
    pageSize: 10,
    curRowIndex: -1,
    hasDelete: false,
    search:{},
    current: 'all',
    selectedRows: [],
    id: 'all',
    supplyName: '',
    defaultStatus: ''
  }

  componentDidMount() {
    const { dispatch, match, location } = this.props
    const {pageSize} = this.state
    dispatch({//列表请求   url: /supplier_order/balance/orders
      type: 'order/listcheck',
      payload: {page: 1, rows: pageSize}
    })
    dispatch({//对账总计请求
      type: 'order/stat',
      payload: {}
    })
    dispatch({//筛选请求   url:/supplier_order/balance/options
      type: 'order/selectcheck',
      payload: {}
    })
    
  }
  //点击下拉选择框执行
  handleSelectChange = (value) => {
    const {dispatch} = this.props;
    const {pageSize} = this.state
    let payload = {page: 1, rows: pageSize, supplier_id: value}
    if (value !== 'all') {
      dispatch({
        type: 'order/listcheck',
        payload
      })
      dispatch({//对账总计请求
        type: 'order/stat',
        payload: {supplier_id: value}
      })
    }else{
      dispatch({
        type: 'order/listcheck',
        payload: {page: 1, rows: pageSize}
      })
      dispatch({//对账总计请求
        type: 'order/stat',
        payload: {}
      })
    }
    this.setState({
      id: value
    })
  }
  
  //分页功能事件
  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    console.log('pagination', pagination)
    const {dispatch} = this.props;
    const {id} = this.state
    // console.log(id)
    this.setState({pageSize: pagination.pageSize, page: pagination.current})
    let payload = {rows: pagination.pageSize, page: pagination.current}
    if(id!=='all'){
      payload.supplier_id = id
    }
    dispatch({
      type: 'order/listcheck',
      payload
    })
    
    
    
  }
  //打印功能
  download(){
    const {id} = this.state;
    let url = `${config.api}/download/export/balance`
    if(id!=='all'){
      url = `${config.api}/download/export/balance?supplier_id=${id}`
    }
    window.open(url)
  }
  render() {
    const {order: model, loading,} = this.props
    const {pageSize,curRowIndex,current,page} = this.state
    const {data, stat, status} = model;
    const count = stat.count || 0
    const profit = stat.profit || 0
    const sum = stat.sum || 0
    const statusMap = status.suppliers || []
    const rows = data.rows || [{id: 1, status: 2, price: 2.3, created_at: new Date(), drug: '阿达木单抗(修美乐)'}]
    //数据
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
    //嵌套表格组件
    const NestedTable = () => {
      //内层表格
      const expandedRowRender = (params) => {
        const columns = [
          { title: 'SKU编号', dataIndex: 'sku_code', key: 'sku_code' },
          { title: '展示名称',
            dataIndex: 'name', 
            key: 'name',
            width:'20%',
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
          }},
          { title: '规格', 
            dataIndex: 'spec', 
            key: 'spec',
            width:'20%',
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
          }},
          { title: '供货价', dataIndex: 'cost_price', key: 'cost_price' },
          { title: '售价', dataIndex: 'price', key: 'price' },
          { title: '数量', dataIndex: 'amount', key: 'amount' },
          { title: '单SKU合计', dataIndex: 'fee', key: 'fee' }
        ]

        const {item_skus} = params
        let data = item_skus.map((item,idx)=>{
          return {
            key: idx,
            sku_code: item.sku_code,
            name: item.name,
            spec:item.spec,
            cost_price: (item.cost_price/100).toFixed(2) || 0,
            price:item.price*0.01 || 0,
            amount:item.amount,
            fee:item.fee*0.01 || 0
          }
        })

        return (
          <Table
            columns={columns}
            dataSource={data}
            pagination={false}
          />
        )
      }
      //外层表格表头
      const columns = [
        {
          title: '供货商名称',
          dataIndex: 'name',
          width: '20%',
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
          title: '供货商订单编号',
          dataIndex: 'code',
          key: 'code',
          render: (text, record, index) => {
            // text = 'DD-' + text.toString().padStart(8, '0')
            return text
          }
        },
        {
          title: '创建时间',
          dataIndex: 'created_at',
          key: 'created_at',
          render: (text, record, index) => {
            text = moment(text).format('YYYY-MM-DD HH:mm')
            return (
              <Fragment>
                <span style={{whiteSpace: 'pre-wrap'}}>{text}</span>
              </Fragment>
            )
          }
        },
        {
          title: '总供货价',
          dataIndex: 'cost_price',
          key: 'cost_price',
          render: (text, record, index) => (
            <Fragment>
              <span style={{whiteSpace: 'pre-wrap'}}>{(text/100).toFixed(2)||0}</span>
            </Fragment>
          )
        },
        
        {
          title: '诊疗服务费',
          dataIndex: 'service_fee',
          key: 'service_fee',
          render: (text, record, index) => (
            <Fragment>
              <span style={{whiteSpace: 'pre-wrap'}}>{(text||0)/100}</span>
            </Fragment>
          )
        },
        {
          title: '合计',
          dataIndex: 'fee',
          key: 'fee',
          render: (text, record, index) => (
            <Fragment>
              <span style={{whiteSpace: 'pre-wrap'}}>{(text||0)/100}</span>
            </Fragment>
          )
        },
      ];
      return (
        <Table
          rowKey="id"
          loading={loading}
          dataSource={listData.list}
          columns={columns}
          expandedRowRender={expandedRowRender}
          pagination={listData.pagination}
          onChange={this.handleStandardTableChange}
          locale={{emptyText:'该供货商暂无任何订单'}}
        />
      )
    }

    //下拉选择模块
    const Option = Select.Option
    let options = []
    options = statusMap.map(item=>{
      return <Option key={item.id}>{item.name}</Option>
    })
    const extraContent = (
      <Select  defaultValue="all" style={{ width: 117, height: 30}} onChange={this.handleSelectChange}>
        <Option key="all">全部</Option>
        {options}
      </Select>
    )

    //头部计算总数模块
    const action = (
      <div className={styles.extraContent}>
        <div className={styles.statItem}>
          <p>总利润</p>
          <p>{`¥${((profit/100) !== 0 ? (profit/100).toFixed(2) : 0) || 0}`}</p>
        </div>
        <div className={styles.statItem}>
          <p>订单总额</p>
          <p>{`¥${((sum/100) !== 0 ? (sum/100).toFixed(2) : 0 ) || 0}`}</p>
        </div>
        <div className={styles.statItem}>
          <p>订单总数</p>
          <p>{count || 0}</p>
        </div>
      </div>
    )

    return (
      <PageHeaderWrapper title="订单对账" action={action}>
        <Card
        bordered={false}
        title='' extra={extraContent}
        >
          <div className={styles.tableList}>
            {<NestedTable/>}
            {listData.list.length!==0?
              (<div style={{position: 'relative', zIndex: 1}}>
                <a onClick={()=>this.download()} style={{position: 'absolute', left: 0, bottom: 10 ? 20 : -25}}>
                  <Icon type="download" theme="outlined" style={{fontSize: 21}} /><span style={{marginLeft:'5px'}}>导出Excel文件</span>
                </a>
              </div>):null
            }
          </div>
        </Card>
      </PageHeaderWrapper>
    )
  }
}
