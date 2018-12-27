import React, {PureComponent, Fragment} from 'react'
import {connect} from 'dva'
import {Table, Badge, Menu, Dropdown,  Card, Divider, Select, Button, Icon, Input, Form, message, Modal} from 'antd'
import moment from 'moment'
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './index.less';
import { getPageQuery } from '../../../utils/utils';
import config from "../../config";

const {Search} = Input;
const confirm = Modal.confirm
const Option = Select.Option;


@connect(({supplierOrder, loading}) => ({
    supplierOrder,
    loading: loading.effects['supplierOrder/listcheck'],
  }))
@Form.create()

export default class SupplyOrderAccount extends PureComponent {
    state = {
      page: 1,
      pageSize: 10,
      id: 0,
      supplyName: '',
      keyword: '',
      data: {}
    }

    componentDidMount() {
      const { dispatch, match, location } = this.props
      const {pageSize} = this.state
      const params = getPageQuery()
      let id = params.id;
      let supplyName = params.name
      localStorage.setItem('supplyId', id)
      localStorage.setItem('supplyName', supplyName)
      this.setState({id, supplyName})

      dispatch({//   url: /supplier_order/balance/orders
        type: 'supplierOrder/listcheck',
        payload: {page: 1, rows: pageSize, supplier_id: id},
        callback: (result) => {
        }
      })
      dispatch({//   url:/supplier_order/balance/status
        type: 'supplierOrder/statcheck',
        payload: {supplier_id: id}
      })

    }

    //分页功能事件
    handleStandardTableChange = (pagination, filtersArg, sorter) => {
      console.log('pagination', pagination)
      const {dispatch} = this.props;
      const {keyword, id} = this.state

      this.setState({pageSize: pagination.pageSize, page: pagination.current})
      let payload = {rows: pagination.pageSize, page: pagination.current, supplier_id: id}
      if (keyword) payload.keyword = keyword

      dispatch({
        type: 'supplierOrder/listcheck',
        payload
      })
    }
    //打印功能
    download(){
      const {id} = this.state;
      window.open(`${config.api}/download/export/balance?supplier_id=${id}`)

    }

    render() {
      const {supplierOrder: model, loading,} = this.props
      const {pageSize, supplyName} = this.state
      const {data, stat} = model;
      const count = stat.count || 0
      const profit = stat.profit || 0
      const sum = stat.sum || 0
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
              price:(item.price || 0)*0.01,
              amount:item.amount,
              fee:(item.fee || 0)*0.01
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
                <span style={{whiteSpace: 'pre-wrap'}}>{(text/100).toFixed(2) || 0}</span>
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
      //头部数量计算部分
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
        <PageHeaderWrapper title={`订单对账（${supplyName}）`} action={action}>
          <Card bordered={false}>
            <div className={styles.tableList}>
              {
                <NestedTable/>
              }
              {listData.list.length!==0?
                (<div style={{position: 'relative', zIndex: 1}}>
                  <a onClick={()=>this.download()} style={{position: 'absolute', left: 0, bottom: 10 ? 20 : -25}}>
                    <Icon type="download" theme="outlined" style={{fontSize: 20}} /><span style={{marginLeft:'5px'}}>导出Excel文件</span>
                  </a>
                </div>) : null
              }
            </div>
          </Card>
        </PageHeaderWrapper>
      )
    }
  }
