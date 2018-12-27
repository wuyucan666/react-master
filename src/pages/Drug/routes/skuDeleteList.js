import React, {PureComponent, Fragment} from 'react'
import {connect} from 'dva'
import {Table, Card, Divider, Input, Form, Modal} from 'antd'
import router from 'umi/router';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './index.less';

const {Search} = Input;
const confirm = Modal.confirm

@connect(({sku, loading}) => ({
  sku,
  loading: loading.effects['sku/listDelete'],
}))
@Form.create()
export default class SkuDeleteList extends PureComponent {
  state = {
    page: 1,
    pageSize: 10,
    curRowIndex: -1,
  }

  componentDidMount() {
    const {dispatch} = this.props
    const {pageSize} = this.state
    dispatch({
      type: 'sku/listDelete',
      payload: {page: 1, rows: pageSize},
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
      type: 'sku/listDelete',
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

  handleSearch = (value) => {
    const {dispatch, form} = this.props;
    const {pageSize} = this.state
    let payload = {page: 1, rows: pageSize}
    if (value) payload.keyword = value
    dispatch({
      type: 'sku/listDelete',
      payload
    })
  }

  handleDetail = (record) => {
    const {match} = this.props
    router.push({
      pathname: `${match.url}/skuInfo`,
      search: `?id=${record.id}&del=1`,
    });
  }

  handleRestore = (record) => {
    const {dispatch} = this.props
    confirm({
      title: '确认要恢复此SKU?',
      content: '恢复后，可还原此SKU删除前保存的数据',
      okText: '确定',
      cancelText: '取消',
      onOk() {
        dispatch({
          type: 'sku/restore',
          payload: {id: record.id},
        })
      },
      onCancel() {
      },
    })
  }

  render() {
    const {sku: model, loading,} = this.props
    const {pageSize, curRowIndex} = this.state
    const {delData:data} = model
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
        width: '20%',
        key: 'name',
        render: (text, record, index) => {
          const spu = record.spu || {}
          const brand = spu.brand || ''
          const cadn = spu.cadn || ''
          text = brand + ' ' + cadn
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
        width: '20%',
        render: (text, record, index) => {
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
        width: '20%',
        render: (text, record, index) => {
          const spu = record.spu || {}
          text = spu.factory || ''
          return (
            <Fragment>
              <span style={{whiteSpace: 'pre-wrap'}}>{text}</span>
            </Fragment>
          )
        }
      },
      {
        title: '操作',
        width: '20%',
        render: (text, record, index) => (
          <Fragment>
            <a onClick={() => this.handleDetail(record)}>详情</a>
            {
              curRowIndex === index && <span>
                <Divider type="vertical"/>
                <a onClick={() => this.handleRestore(record)}>恢复</a>
              </span>
            }

          </Fragment>
        )
      },
    ];


    return (
      <PageHeaderWrapper title="已删除的SKU">
        <Card bordered={false}
              title={<Search style={{width: '270px'}} placeholder="请输入关键字, 按Enter搜索" onSearch={(value) => this.handleSearch(value)}/>}>
          <div className={styles.tableList}>
            <Table
              rowKey="id"
              loading={loading}
              dataSource={listData.list}
              columns={columns}
              pagination={listData.pagination}
              onChange={this.handleStandardTableChange}
              onRow={this.handleRow}
            />
          </div>
        </Card>
      </PageHeaderWrapper>
    )
  }
}
