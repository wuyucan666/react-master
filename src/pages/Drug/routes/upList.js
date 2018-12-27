import React, {PureComponent, Fragment} from 'react'
import {connect} from 'dva'
import {Table, Card, Divider, Row, Button, Icon, Input, Form, message, Modal} from 'antd'
import router from 'umi/router';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './index.less';

const {Search} = Input;

@connect(({sku, loading}) => ({
  sku,
  loading: loading.effects['sku/list'],
}))
@Form.create()
export default class UpList extends PureComponent {
  state = {
    page: 1,
    pageSize: 10,
  }

  componentDidMount() {
    const {dispatch} = this.props
    const {pageSize} = this.state
    dispatch({
      type: 'sku/list',
      payload: {page: 1, rows: pageSize, type: 'listing'},
    })
    dispatch({
      type: 'sku/stat',
      payload: {page_type: 'listing'},
    })
  }

  componentWillUnmount() {

  }

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    console.log('pagination', pagination)
    const {dispatch} = this.props;
    const {keyword} = this.state

    this.setState({pageSize: pagination.pageSize, page: pagination.current})
    let payload = {rows: pagination.pageSize, page: pagination.current, type: 'listing'}
    if (keyword) payload.keyword = keyword
    dispatch({
      type: 'sku/list',
      payload
    })
  }

  handleDetail = (record) => {
    const {dispatch, match, location} = this.props
    const spu = record.spu || {}
    const brand = spu.brand || ''
    const cadn = spu.cadn || ''
    router.push({
      pathname: `${match.url}/upInfoList`,
      search: `?id=${record.id}&cadn=${cadn}&brand=${brand}`,
    });
  }

  handleSearch = (value) => {
    const {dispatch, form} = this.props;
    const {pageSize} = this.state
    let payload = {page: 1, rows: pageSize, type: 'listing'}
    if (value) payload.keyword = value
    dispatch({
      type: 'sku/list',
      payload
    })
    this.setState({keyword: value})
  }

  render() {
    const {sku: model, loading,} = this.props
    const {pageSize} = this.state
    const {data, stat} = model
    const rows = data.rows || []
    const item_sku_count = stat.item_sku_count || 0
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
        title: 'SKU编号',
        dataIndex: 'id',
        width: '20%',
        key: 'id',
        render: (text, record, index) => {
          text = 'SKU-' + text.toString().padStart(8, '0')
          return text
        }
      },
      {
        title: '商品名',
        dataIndex: 'name',
        width: '16%',
        key: 'name',
        render: (text, record, index) => {
          const spu = record.spu || {}
          const brand = spu.brand || ''
          const cadn = spu.cadn || ''
          text = brand + ' ' + cadn
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
        title: '规格',
        dataIndex: 'spec',
        width: '16%',
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
        title: '厂家',
        dataIndex: 'factory',
        width: '16%',
        render: (text, record, index) => {
          const spu = record.spu || {}
          text = spu.factory || ''
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
        title: '上架单品数',
        dataIndex: 'count',
        width: '16%',
        render: (text, record, index) => {
          text = record.count || 0
          return (
            <Fragment>
              <span>{text}</span>
            </Fragment>
          )
        }
      },
      {
        title: '操作',
        width: '16%',
        render: (text, record, index) => (
          <Fragment>
            <a onClick={() => this.handleDetail(record)}>配置</a>
          </Fragment>
        )
      },
    ];

    const action = (
      <div className={styles.extraContent}>
        <div className={styles.statItem}>
          <p>上架SKU单品总数</p>
          <p>{item_sku_count || 0}</p>
        </div>
      </div>
    )

    return (
      <PageHeaderWrapper title="上架管理" action={action}>
        <Card bordered={false}
              title={<div><div style={{marginBottom: "10px"}}>SKU列表</div><Search style={{width: '370px'}} placeholder="输入SKU编号、商品名或厂家名称, 按Enter搜索" onSearch={(value) => this.handleSearch(value)}/></div>}>
          <div className={styles.tableList}>
            <Table
              rowKey="id"
              loading={loading}
              dataSource={listData.list}
              columns={columns}
              pagination={listData.pagination}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
      </PageHeaderWrapper>
    )
  }
}
