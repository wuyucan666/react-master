import React, {PureComponent, Fragment} from 'react'
import {connect} from 'dva'
import {Table, Card, Divider, Alert, Button, Icon, Input, Form, message, Modal} from 'antd'
import router from 'umi/router';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './index.less';

const {Search} = Input
const confirm = Modal.confirm

@connect(({supplier, loading}) => ({
  supplier,
  loading: loading.effects['supplier/listDelete'],
}))
@Form.create()
export default class SupplyDeleteList extends PureComponent {
  state = {
    page: 1,
    pageSize: 10,
    curRowIndex: -1,
  }

  componentDidMount() {
    const {dispatch} = this.props
    const {pageSize} = this.state
    dispatch({
      type: 'supplier/listDelete',
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
      type: 'supplier/listDelete',
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
      type: 'supplier/listDelete',
      payload
    })
  }

  handleDetail = (record) => {
    const {dispatch, match, location} = this.props
    router.push({
      pathname: `${match.url}/supplyInfoList`,
      search: `?id=${record.id}&del=1`,
    });
  }

  handleRestore = (record) => {
    const {dispatch} = this.props
    confirm({
      title: '确认恢复该供货商吗?',
      content: '恢复该供货商后，所有SKU信息默认为非供货状态。',
      okText: '确定',
      cancelText: '取消',
      onOk() {
        dispatch({
          type: 'supplier/restore',
          payload: {id: record.id},
        })
      },
      onCancel() {
      },
    })
  }

  render() {
    const {supplier: model, loading,} = this.props
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
        title: '供货商名称',
        dataIndex: 'name',
        width: '40%',
        key: 'name',
        render: (text, record, index) => {
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
        width: '40%',
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
      <PageHeaderWrapper title="已删除的供货商">
        <Card bordered={false}
              title={<Search style={{width: '270px'}} placeholder="请输入供货商关键字, 按Enter搜索" onSearch={(value) => this.handleSearch(value)}/>}>
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
