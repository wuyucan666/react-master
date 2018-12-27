import React, { PureComponent, Fragment } from 'react'
import { connect } from 'dva'
import {
  Form,
  Input,
  Select,
  Button,
  Card,
  Alert,
  AutoComplete,
  Tag,
  Table,
  Popover,
} from 'antd'
import router from 'umi/router';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './index.less';

const FormItem = Form.Item;
const {TextArea} = Input;
const {Option} = Select;

@connect(({acl, loading}) => ({
  acl,
  submitting: loading.effects['acl/addAclUser'],
}))
@Form.create()
class UserCreate extends PureComponent {
  state = {
    strLength: {},
    cacheRoles: [],
    cacheTags: [],
    visible: false,
    search:'',
    page: 1,
    pageSize: 5,
    roleOptions: [],
  }
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'acl/queryAclRoles',
      payload: {},
      callback: (roles) => {
        let options = [];
        roles.forEach((role)=>{
          options.push(<Option key={role.code}>{role.title}</Option>);
        })
        this.setState({roleOptions: options})
      }
    })
  }
  componentWillUnmount() {

  }

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    console.log('pagination', pagination)
    const {dispatch} = this.props;
    const {search} = this.state

    this.setState({pageSize: pagination.pageSize, page: pagination.current})
    let payload = {rows: pagination.pageSize, page: pagination.current}
    if (search) payload.search = search
    dispatch({
      type: 'acl/queryUsers',
      payload
    })
  }

  handleRow = (record, index) => {
    const { dispatch, form } = this.props
    const {strLength} = this.state
    return {
      onClick: () => {
        const nick = record.nick || ''
        form.setFieldsValue({'_id': record._id});
        form.setFieldsValue({'nick': nick});
        strLength['nick'] = nick.length
        const newObj = Object.assign({}, strLength)
        this.setState({ visible: false, search: `${nick}(${record._id})`, strLength: newObj});
      },  // 鼠标点击行
    };
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

  handleInputSearch = (e) => {
    const { dispatch, form } = this.props
    let str = e
    if (typeof e !== 'string') {
      str = e.target.value
    }
    this.setState({search: str, visible: true})

    dispatch({
      type: 'acl/queryUsers',
      payload: {search: str},
    })
  }

  handleSubmit = e => {
    e.preventDefault();
    const { form, dispatch } = this.props;
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        dispatch({
          type: 'acl/addAclUser',
          payload: values,
          callback: (doc) => {
            this.handleListPage()
          }
        });
      }
    });
  }

  handleListPage = () => {
    router.push(`/safety/users`);
  }

  handleTagsChange = (value) => {
    const {cacheTags} = this.state
    let option = <Option key={value}>{value}</Option>
    for (let elem of cacheTags.values()) {
      if (elem.key === option.key) return
    }
    cacheTags.push(option)
    this.setState({cacheTags})
  }

  handleRolesChange = (value) => {
    const {cacheRoles} = this.state
    let option = <Option key={value}>{value}</Option>
    for (let elem of cacheRoles.values()) {
      if (elem.key === option.key) return
    }
    cacheRoles.push(option)
    this.setState({cacheRoles})
  }

  handleVisibleChange = (visible) => {
    const { dispatch, form } = this.props
    this.setState({ visible });
    if (!visible) {
      form.setFieldsValue({'_id': ''})
      this.setState({search: ''})
    }
  }

  render () {
    const { acl: model, submitting, form } = this.props;
    const { pageSize, strLength, cacheTags, search, roleOptions } = this.state
    const { getFieldDecorator } = form;
    const {users:data, roles} = model
    const rows = data.rows || []

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 7 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 12 },
        md: { span: 10 },
      },
    };

    const submitFormLayout = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 10, offset: 7 },
      },
    };

    const columns = [
      {
        title: '用户ID',
        dataIndex: '_id',
        width: '50%',
        key: '_id',
        render: (text, record, index) => {
          text = text || ''
          return text
        }
      },
      {
        title: '昵称',
        dataIndex: 'nick',
        width: '50%',
        key: 'nick',
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
    ];

    const listData = {
      list: rows,
      pagination: {
        // showSizeChanger: true,
        // showQuickJumper: true,
        current: Number(data.page),
        total: Number(data.total),
        showTotal: function (total) { return `共${total}条`},
        pageSize
      }
    }

    const clickContent = (
      <div style={{maxWidth: '480px'}}>
        <Table
          rowKey="_id"
          dataSource={listData.list}
          columns={columns}
          pagination={listData.pagination}
          onChange={this.handleStandardTableChange}
          onRow={this.handleRow}
          locale={{emptyText:'暂无用户'}}
        />
      </div>
    );

    return (
      <PageHeaderWrapper title="分配角色">
        <Card bordered={false}>
          <Form onSubmit={this.handleSubmit} style={{ marginTop: 8 }}>
            <FormItem {...formItemLayout} label="用户">
              {getFieldDecorator('_id', {
                rules: [
                  {required: true, message: '请输入昵称或用户ID搜索'},
                  {whitespace: true, message: '不能输入纯空格字符'},
                ],
                initialValue: search || '',
              })(
                <Popover
                  content={clickContent}
                  trigger="click"
                  placement="bottomLeft"
                  autoAdjustOverflow={false}
                  visible={this.state.visible}
                  onVisibleChange={this.handleVisibleChange}
                >
                  <Input style={{paddingRight: '50px'}} maxLength="50" placeholder="请输入昵称或用户ID搜索" value={search} onChange={(value) => this.handleInputSearch(value)}/>
                </Popover>
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="昵称">
              {getFieldDecorator('nick', {
                rules: [
                  {max: 50, message: '不能超过最大字符数'},
                  {whitespace: true, message: '不能输入纯空格字符'},
                ],
              })(<Input style={{paddingRight: '50px'}} maxLength="50" placeholder="请输入昵称" onChange={(value) => this.handleInputChange(value, 'nick')}/>)}
              <span style={{position: 'absolute', right: 10}}>{strLength['nick'] || 0}/50</span>
            </FormItem>
            <FormItem {...formItemLayout} label="标签">
              {getFieldDecorator('tags', {
                rules: [
                  {
                    validator: function (rule, value, callback) {
                      if (!value) return callback()
                      if (value.length > 10){
                        rule.message ='标签数量不得超过10个'
                        return callback(false)
                      }
                      let v = value[value.length-1]
                      if (!v) return callback()
                      v = v.trim()
                      if (!v.length) return callback('不能输入纯空格字符')
                      if (v.length > 20) return callback('每个标签不得超过20个字')
                      callback()
                    },
                  }
                ],
              })(<Select
                mode="tags"
                style={{ width: '100%' }}
                placeholder="请输入用户标签"
                onSelect={this.handleTagsChange}
              >
                {cacheTags}
              </Select>)}
            </FormItem>
            <FormItem {...formItemLayout} label="角色">
              {getFieldDecorator('roles', {
                rules: [
                  {
                    validator: function (rule, value, callback) {
                      if (!value) return callback()
                      if (value.length > 5){
                        rule.message ='标签数量不得超过10个'
                        return callback(false)
                      }
                      let v = value[value.length-1]
                      if (!v) return callback()
                      v = v.trim()
                      if (!v.length) return callback('不能输入纯空格字符')
                      if (v.length > 20) return callback('每个标签不得超过20个字')
                      callback()
                    },
                  }
                ],
              })(<Select
                mode="multiple"
                style={{ width: '100%' }}
                placeholder="请选择角色"
                onSelect={this.handleRolesChange}
              >
                {roleOptions}
              </Select>)}
            </FormItem>
            <FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
              <Button type="primary" htmlType="submit" loading={submitting}>
                确定
              </Button>
              <Button style={{ marginLeft: 15 }} onClick={() => this.handleListPage()}>取消</Button>
            </FormItem>
          </Form>
        </Card>
      </PageHeaderWrapper>
    )
  }
}

export default UserCreate
