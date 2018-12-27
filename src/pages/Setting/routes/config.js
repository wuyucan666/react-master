import React, { PureComponent } from 'react'
import { connect } from 'dva'
import { Card, Col, Row, Button, Icon, Input, Form, message, Modal } from 'antd'
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './index.less';
import classNames from 'classnames';

const FormItem = Form.Item;
const confirm = Modal.confirm

@connect(({config, loading}) => ({
  config,
  loading: loading.effects['config/fetchConfigRoots'],
}))
@Form.create()
export default class Home extends PureComponent {
  state = {
    height: `${document.body.clientHeight-328}px`,
    itemIndex: -1,
    keyIndex: -1,
    search: '',
    key: '',
    isCollapsed: true,
    isGlobalEdit: false,
  }
  componentDidMount() {
    window.addEventListener('resize', this.resizeHeight)
    this.props.dispatch({
      type: 'config/fetchConfigRoots',
    })
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeHeight)
  }
  resizeHeight = () => {
    this.setState({ height: `${document.body.clientHeight-328}px` });
  }
  handleItemClick = (item, index) => {
    const {config:model, dispatch} = this.props
    const { hkeys } = model
    const hkey = hkeys[index]
    dispatch({
      type: 'config/clearValue',
    })
    dispatch({
      type: 'config/fetchConfigHKey',
      payload: {isGlobal: this.state.isGlobalEdit, hkey},
    })
    this.setState({itemIndex: index, keyIndex: -1})
  }
  handleKeyClick = (item, index) => {
    this.setState({keyIndex: index})
    this.props.dispatch({
      type: 'config/fetchConfigValue',
      payload: {isGlobal: this.state.isGlobalEdit, index},
    })
  }
  handleSearchChange = (e) => {
    this.setState({search: e.target.value})
  }
  handleInputKeyChange = (e) => {
    this.setState({key: e.target.value})
  }
  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if(!err){
        this.handleAddHKey(values)
      }
    });
  }
  handleCollapsed = () => {
    this.setState({isCollapsed: !this.state.isCollapsed})
  }
  handleGlobalEdit = () => {
    const {dispatch} = this.props
    const isGlobalEdit = !this.state.isGlobalEdit
    let state = {isGlobalEdit}
    dispatch({
      type: 'config/clearValue',
    })
    if (isGlobalEdit) {
      dispatch({
        type: 'config/fetchConfigValue',
        payload: {isGlobal: isGlobalEdit, index: this.state.itemIndex},
      })
    } else{
      state = {...state,itemIndex: -1, keyIndex: -1}
    }

    this.setState(state)
  }
  handleSave = () => {
    const {config:model, dispatch} = this.props
    const { hkeys, keys, value } = model
    const root = hkeys[this.state.itemIndex]
    const key = keys[this.state.keyIndex]
    const payload = this.state.isGlobalEdit ? {root, value} : {root, key, value}
    dispatch({
      type: 'config/saveConfigValue',
      payload,
    })
  }
  handleTextareaChange = (e) => {
    const {dispatch} = this.props
    dispatch({
      type: 'config/changeValue',
      payload: e.target.value,
    })
  }
  handleAddHKey = (payload) => {
    const {dispatch} = this.props
    dispatch({
      type: 'config/addConfigHKey',
      payload,
    })
    this.handleCollapsed()
  }
  handleAddKey = () => {
    if (!this.state.key) return message.error('输入配置键')
    const {config: model, dispatch} = this.props
    const {hkeys} = model
    const root = hkeys[this.state.itemIndex]
    dispatch({
      type: 'config/addConfigKey',
      payload: {root, key: this.state.key},
    })
  }
  handleDeleteConfig = (key, index) => {
    if (!key && index===-1) return message.error('请选择要清空的内容')
    const {config: model, dispatch} = this.props
    const {hkeys} = model
    const root = hkeys[index || this.state.itemIndex]
    if (!key) {
      dispatch({
        type: 'config/clearValue',
      })
    }
    dispatch({
      type: 'config/deleteConfig',
      payload: {root, key},
    })
    this.setState(key ? {keyIndex: -1} : {itemIndex: -1})
  }
  render () {
    const height = `calc(${this.state.height} - 20px)`
    const { getFieldDecorator } = this.props.form
    const { loading, config:model } = this.props
    const { hkItems, keys, value } = model

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 7 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 14 },
        md: { span: 14 },
      },
    }

    const itemButtonGroup = (
      <span>
        <span>
          <Input onChange={(e) => this.handleSearchChange(e)} defaultValue={this.state.search} placeholder="搜索" size="small" prefix={<Icon type="search" key="Icon" />} maxLength="25" style={{width:'150px'}} />
        </span>
        <Button type={this.state.isCollapsed ? 'primary' : 'default'} size="small" style={{ marginLeft: 4}} onClick={() => this.handleCollapsed()}>{this.state.isCollapsed ? '新增' : '取消'}</Button>
        <Button size="small" style={{ marginLeft: 3, color: '#fff',backgroundColor: '#27c24c',borderColor: '#27c24c'}} onClick={() => this.handleGlobalEdit()}>{this.state.isGlobalEdit ? '取消' : '编辑'}</Button>
      </span>
    )
    const keyButtonGroup = (
      <span>
        <span>
          <Input onChange={(e) => this.handleInputKeyChange(e)} defaultValue={this.state.key} placeholder='输入配置键增加' size="small" maxLength="25" style={{width:'150px'}} />
        </span>
        <Button type="primary" size="small" style={{ marginLeft: 4}} onClick={() => this.handleAddKey()}>新增</Button>
        <Button type="danger" size="small" style={{ marginLeft: 3}} onClick={() => showConfirm(null, this.state.itemIndex)}>清空</Button>
      </span>
    )
    const valButtonGroup = (
      <span>
        <Button type="primary" size="small" style={{ marginLeft: 3}} onClick={() => this.handleSave()}>保存</Button>
      </span>
    )

    let self = this
    function showConfirm(item, index) {
      confirm({
        title: '提示',
        content: '是否确定删除?',
        onOk() {
          self.handleDeleteConfig(item, index);
        },
        onCancel() {
        },
      });
    }

    return (
      <PageHeaderWrapper title="统一配置">
        <Row style={{top:'-10px'}}>
          <Col xl={7} lg={this.state.isGlobalEdit ? 24 : 12} md={this.state.isGlobalEdit ? 24 : 12} sm={24} xs={24} style={{marginTop:'10px'}}>
            <Card loading={loading} title="配置项" extra={itemButtonGroup} bodyStyle={{padding:0}}>
              {
                !this.state.isCollapsed && (
                  <Form onSubmit={this.handleSubmit} hideRequiredMark style={{ padding: '10px 15px', backgroundColor: '#fafafa' }}>
                    <FormItem {...formItemLayout} label="配置项">
                      {
                        getFieldDecorator('hkey', {
                          rules: [{
                            required: true,
                            message: '请输入配置项',
                          }],
                        })
                        (<Input placeholder="配置项" />)
                      }
                    </FormItem>
                    <FormItem {...formItemLayout} label="名称">
                      {
                        getFieldDecorator('title', {
                          rules: [{
                            required: true,
                            message: '请输入名称',
                          }],
                        })
                        (<Input placeholder="名称" />)
                      }
                    </FormItem>
                    <FormItem wrapperCol={{xs: { span: 14, offset: 8 },sm: { span: 14, offset: 8 }}} style={{ marginTop: 25 }}>
                      <Button type="primary" htmlType="submit">
                        添加
                      </Button>
                      <Button onClick={() => this.handleCollapsed()} style={{ marginLeft: 8 }}>取消</Button>
                    </FormItem>
                  </Form>
                )
              }

              <div className={styles.scrollYHidden} style={{height:this.state.height}}>
                <div style={{height: this.state.height}}>
                  <div className={styles.listGroup}>
                    {
                      hkItems.map((item, index) => {
                        if(this.state.search && this.state.search.indexOf(item) === -1) return ("")
                        return (
                          <a className={classNames(styles.listGroupItem,{[styles.selected]: index === this.state.itemIndex})} key={item} onClick={() => {this.handleItemClick(item, index)}}>
                            { index !== 0 && <Icon type="close" key="Icon" className={styles.hoverAction} onClick={() => {showConfirm(null, index)}} />}
                            {item}
                          </a>
                        )
                      })
                    }
                  </div>
                </div>
              </div>

            </Card>
          </Col>
          {
            !this.state.isGlobalEdit && (
              <Col xl={7} lg={12} md={12} sm={24} xs={24} style={{marginTop:'10px'}}>
                <Card title="配置键" extra={keyButtonGroup} bodyStyle={{padding:0}}>
                  <div className={styles.scrollYHidden} style={{height:this.state.height}}>
                    <div style={{height: this.state.height}}>
                      <div className={styles.listGroup}>
                        {
                          keys.map((item, index) => {
                            return (
                              <a className={classNames(styles.listGroupItem,{[styles.selected]: index === this.state.keyIndex})} key={item} onClick={() => {this.handleKeyClick(item, index)}}>
                                <Icon type="close" key="Icon" className={styles.hoverAction} onClick={() => {showConfirm(item)}} />
                                {item}
                              </a>
                            )
                          })
                        }
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
            )
          }

          <Col xl={this.state.isGlobalEdit ? 17 : 10} lg={24} md={24} sm={24} xs={24} style={{marginTop:'10px'}}>
            <Card title="配置值" extra={valButtonGroup} bodyStyle={{padding:'10px'}}>
              <textarea placeholder="请输入JSON格式数据" value={value} onChange={(e) => this.handleTextareaChange(e)} style={{border: '1px solid #ccc', width: '98%', minHeight: '80px', display: 'block', resize: 'none', padding: '6px', height}} />
            </Card>
          </Col>
        </Row>
      </PageHeaderWrapper>
    )
  }
}
