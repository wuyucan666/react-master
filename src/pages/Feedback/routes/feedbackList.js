import React, { PureComponent, Fragment } from 'react'
import { connect } from 'dva'
import { Table, Card, Col, Row, Button, Icon, Input, Form, message, Modal } from 'antd'
import router from 'umi/router';
import moment from 'moment'
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './index.less';


@connect(({feedback, loading}) => ({
  feedback,
  loading: loading.effects['feedback/list'],
}))
@Form.create()
export default class FeedbackList extends PureComponent {
  state = {
    selectedRows: [],
    page: 1,
    pageSize: 10,
    curTab: 'all'
  }
  componentDidMount() {
    const {dispatch} = this.props
    dispatch({
      type: 'feedback/list',
      payload: {page: 1, rows: this.state.pageSize},
    })
  }
  componentWillUnmount() {

  }

  handleTabChange = key => {
    const { dispatch, match } = this.props;
    let payload = {page: 1, rows: this.state.pageSize}
    if (key === '0') payload.status = 0
    if (key === '1') payload.status = 1
    dispatch({
      type: 'feedback/list',
      payload
    })
    this.setState({curTab: key})
  }

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const {dispatch} = this.props;
    const {curTab} = this.state

    let payload = {page: pagination.current, rows: pagination.pageSize}
    if (curTab === '0') payload.status = 0
    if (curTab === '1') payload.status = 1

    dispatch({
      type: 'feedback/list',
      payload
    })
    this.setState({pageSize: pagination.pageSize, page: pagination.current})
  }

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  }

  handleFeedbackDetail = (record) => {
    const { dispatch, match, location } = this.props
    router.push({
      pathname: `${match.url}/feedbackDetail`,
      search: `?id=${record.id}`,
    });
  }

  render () {
    const {feedback: model, loading,} = this.props
    const {selectedRows, pageSize} = this.state
    const {data, stat} = model
    const rows = data.rows || []
    const listData = {list: rows, pagination: {showSizeChanger: true, showQuickJumper: true, current: Number(data.page), total: Number(data.total), pageSize}}
    const columns = [
      {
        title: '用户',
        dataIndex: 'user',
        width: '10%',
        key: 'name',
        render: (user, record, index) => (
          <Fragment>
            <span>{user.name}</span>
          </Fragment>
        )
      },
      {
        title: '角色',
        dataIndex: 'user',
        width: '10%',
        key: 'role',
        render: (user, record, index) => {
          let role = '游客'
          if (user.role === 'patient') role = '患者'
          if (user.role === 'doctor') role = '医生'
          if (user.role === 'agent') role = 'BD'
          if (user.role === 'admin') role = '管理员'
          return (
          <Fragment>
            <span>{role}</span>
          </Fragment>
        )
        }
      },
      {
        title: '状态',
        dataIndex: 'status',
        width: '10%',
        render: (status) => {
          let text = '未处理'
          if (status == 1) text = '已处理'
          return (
            <Fragment>
              <span>{text}</span>
            </Fragment>
          )
        }
      },
      {
        title: '反馈时间',
        dataIndex: 'created_at',
        width: '15%',
        render: (time) => {
          let date = moment(time).format('YYYY-MM-DD HH:mm')
          return(
            <Fragment>
              <Row>{date}</Row>
            </Fragment>
          )
        }
      },
      {
        title: '反馈内容',
        dataIndex: 'content',
        width: '45%',
        render: (text) => {
          if (text.length > 15){
            text = text.slice(0, 15)
            text += '...'
          }
          return (
            <Fragment>
              <span>{text}</span>
            </Fragment>
          )
        }
      },
      {
        title: '操作',
        width: '10%',
        render: (text, record, index) => (
          <Fragment>
            <a onClick={() => this.handleFeedbackDetail(record)}>查看</a>
          </Fragment>
        )
      },
    ];
    const tabList = [
      {
        key: 'all',
        tab: '全部',
      },
      {
        key: '0',
        tab: `未处理(${((stat['0'] > 999)? '999+':stat['0']) || '0'})`,
      },
      {
        key: '1',
        tab: '已处理',
      },
    ]
    return (
      <PageHeaderWrapper title="反馈列表" tabList={tabList} onTabChange={this.handleTabChange}>
        <Card bordered={false}>
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
