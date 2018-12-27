import React, {PureComponent, Fragment} from 'react'
import {connect} from 'dva'
import {Table, Card, Divider,LocaleProvider ,Radio , Row, Button, Icon, Input, Badge, Menu, Dropdown,Form, Select , message, Modal,DatePicker} from 'antd'
import moment from 'moment'
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { getPageQuery } from '@/utils/utils';
import styles from './performance.less'
import config from "../../config";
@connect(({performance, loading}) => ({
  performance,
  loading: loading.effects['performance/get'],
}))
@Form.create()

export default class Performance extends PureComponent {
  state = {
    page: 1,
    pageSize: 10,
    curRowIndex: -1,
    hasDelete: false,
    search:{},
    current: 'all',
    selectedRows: [],
    defaultStatus: '',
    isActive:true,
    date:''
  }

  componentDidMount() {
    const { dispatch, match, location } = this.props
    const {pageSize} = this.state;
    const date = moment().format('YYYY-MM')
    dispatch({//列表请求   url: /bd_bonus/stats
      type: 'performance/get',
      payload: {date:date}
    }) 
    this.setState({
      date
    })
  }
 
  //分页功能事件
  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    console.log('pagination', pagination)
    const {dispatch} = this.props;
    const {date} = this.state;
    this.setState({pageSize: pagination.pageSize, page: pagination.current})
    let payload = {rows: pagination.pageSize, page: pagination.current}
    if(date!==0){
      payload = {rows: pagination.pageSize, page: pagination.current,date:date}
    }
    dispatch({
      type: 'performance/get',
      payload
    })
  }
  //打印功能
  download(){///download/export/balance
    const date = this.state.date;
    let url = `${config.api}/download/export/bonus?date=${date}`
    if(date===0){
       url = `${config.api}/download/export/bonus`
    }
    window.open(url)
  }
  
  //日期帅选
  onChange = (date, dateString) => {
    // console.log(dateString);
    const {dispatch} = this.props;
    const {pageSize} = this.state
    dispatch({
      type: 'performance/get',
      payload: {page: 1, rows: pageSize,date:dateString}
    })
    this.setState({
      isActive:true,
      date:dateString
    })
  }

  handleBtn = () => {
    const {dispatch} = this.props;
    const {pageSize} = this.state
    dispatch({
      type: 'performance/get',
      payload: {page: 1, rows: pageSize}
    })
    this.setState({
      isActive:false,
      date:0
    })
  }

  disabledStartDate = (current) => {
    return current < moment('2000');
  } 
  
  render() {
    const RadioButton = Radio.Button;
    const { MonthPicker } = DatePicker;
    const {performance: model, loading,} = this.props
    const {pageSize,curRowIndex,current,page} = this.state
    const {data} = model;
    const total_activate_docts = data.total_activate_docts || 0
    const total_cert_docts = data.total_cert_docts || 0
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

    const NestedTable = () => {
      const columns = [
        {
          title: 'BD名称',
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
          title: '认证医生数量',
          dataIndex: 'cert_docts',
          key: 'cert_docts',
          render: (text, record, index) => (
            <Fragment>
              <span style={{whiteSpace: 'pre-wrap'}}>{parseInt(text)||0}</span>
            </Fragment>
          )
        },
        {
          title: '激活医生数量',
          dataIndex: 'activate_docts',
          key: 'activate_docts',
          render: (text, record, index) => (
            <Fragment>
              <span style={{whiteSpace: 'pre-wrap'}}>{parseInt(text)||0}</span>
            </Fragment>
          )
        },
        {
          title: '提成',
          dataIndex: 'bonus',
          key: 'bonus',
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
          pagination={listData.pagination}
          onChange={this.handleStandardTableChange}
          locale={{emptyText:'要至少新增1个BD才能看到业绩哦'}}
        />
      )
    }
   
    const extraContent = (
      <div>
        <RadioButton onClick={this.handleBtn}  style={{width:'35%'}} className={this.state.isActive ? styles.btndefalut : styles.btn}>累计</RadioButton>
        <MonthPicker  onChange={this.onChange} disabledDate={this.disabledStartDate}  allowClear={false} defaultValue={moment()} style={{width:'45%',cursor:'pointer'}} className={this.state.isActive ? styles.add : styles.att}/>
      </div>
    )

    
    //头部计算总数模块
    const action = (
      <div className={styles.extraContent}>
        <div className={styles.statItem}>
          <p>平台累计激活医生</p>
          <p>{`${parseInt(total_activate_docts)|| 0}`}</p>
        </div>
        <div className={styles.statItem}>
          <p>平台累计认证医生</p>
          <p>{`${parseInt(total_cert_docts)|| 0}`}</p>
        </div>
      </div>
    )

    return (
      <PageHeaderWrapper title="BD业绩" action={action}>
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
