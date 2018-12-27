import React, {PureComponent, Fragment} from 'react'
import {connect} from 'dva'
import {Table, Card, Divider, Row, Button, Icon, Input, Form, message, Modal} from 'antd'
import router from 'umi/router';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './index.less';

const {Search} = Input;
const confirm = Modal.confirm

@connect(({sku, loading}) => ({
  sku,
  loading: loading.effects['sku/list'],
}))
@Form.create()
export default class SkuList extends PureComponent {
  state = {
    page: 1,
    pageSize: 10,
    curRowIndex: -1,
    hasDelete: false,
  }

  componentDidMount() {
    const {dispatch} = this.props
    const {pageSize} = this.state
    dispatch({
      type: 'sku/list',
      payload: {page: 1, rows: pageSize},
    })
    dispatch({
      type: 'sku/stat',
      payload: {page_type: 'sku'},
    })
    dispatch({
      type: 'sku/listDelete',
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
      type: 'sku/list',
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
    const {dispatch} = this.props;
    const {pageSize} = this.state
    let payload = {page: 1, rows: pageSize}
    if (value) payload.keyword = value
    dispatch({
      type: 'sku/list',
      payload
    })
    this.setState({keyword: value})
  }

  handleDelete = (id) => {
    const self = this
    const {dispatch} = this.props;
    confirm({
      title: '确定要删除此SKU?',
      content: '删除后，可在"已删除的SKU"恢复',
      okText: '确定',
      cancelText: '取消',
      onOk() {
        dispatch({
          type: 'sku/remove',
          payload: {id},
          callback: () => {
            dispatch({
              type: 'sku/stat',
              payload: {page_type: 'sku'},
            })
            self.setState({hasDelete: true})
          }
        })
      },
      onCancel() {
      },
    })
  }

  handleDetailPage = (record) => {
    const {dispatch, match, location} = this.props
    router.push({
      pathname: `${match.url}/skuInfo`,
      search: `?id=${record.id}`,
    });
  }

  handleCreatePage = () => {
    const {dispatch, match, location} = this.props
    router.push(`${match.url}/skuCreate`);
  }

  handleDeleteListPage = () => {
    const {dispatch, match, location} = this.props
    router.push(`${match.url}/skuDeleteList`);
  }

  render() {
    const {sku: model, loading,} = this.props
    const {pageSize, curRowIndex, hasDelete} = this.state
    const {data, stat} = model
    const sku_count = stat.sku_count || 0
    const brand_count = stat.brand_count || 0
    const factory_count = stat.factory_count || 0
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
        width: '20%',
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
        width: '20%',
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
        title: '操作',
        width: '20%',
        render: (text, record, index) => (
          <Fragment>
            <a onClick={() => this.handleDetailPage(record)}>详情</a>
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
          <p>SKU总数</p>
          <p>{sku_count || 0}</p>
        </div>
        <div className={styles.statItem}>
          <p>品牌总数</p>
          <p>{brand_count || 0}</p>
        </div>
        <div className={styles.statItem}>
          <p>厂家总数</p>
          <p>{factory_count || 0}</p>
        </div>
      </div>
    )

    const extraContent = (
      <Button icon="plus" type="primary" onClick={() => this.handleCreatePage()}>
        新建SKU
      </Button>
    )

    return (
      <PageHeaderWrapper title="SKU库" action={action}>
        <Card bordered={false}
              title={<Search style={{width: '270px'}} placeholder="请输入关键字, 按Enter搜索" onSearch={(value) => this.handleSearch(value)}/>} extra={extraContent}>
          <div className={styles.tableList}>
            <Table
              rowKey="id"
              loading={loading}
              dataSource={listData.list}
              columns={columns}
              pagination={listData.pagination}
              onChange={this.handleStandardTableChange}
              onRow={this.handleRow}
              locale={{emptyText:'暂无SKU'}}
            />
            {
              hasDelete && <div style={{position: 'relative', zIndex: 1}}>
                <a onClick={() => this.handleDeleteListPage()} style={{position: 'absolute', left: 0, bottom: rows.length ? 20 : -25}}><Icon type="delete" theme="outlined" style={{fontSize: 20}} /><span style={{marginLeft:'5px'}}>已删除的SKU</span></a>
              </div>
            }
          </div>
        </Card>
      </PageHeaderWrapper>
    )
  }
}
