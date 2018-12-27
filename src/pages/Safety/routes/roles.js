import React, { PureComponent } from 'react'
import { connect } from 'dva'
import { Card, Col, Row, Button, Icon, Input, Form, message, Modal, Switch, Tree, Checkbox, Tooltip, Select } from 'antd'
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './index.less';
import classNames from 'classnames';

const FormItem = Form.Item;
const confirm = Modal.confirm
const TreeNode = Tree.TreeNode;
const {Option} = Select;


@connect(({acl, loading}) => ({
  acl,
  loading: loading.effects['acl/queryAclUserPerRoles'],
  resLoading: loading.effects['acl/queryAclResourceTree'],
}))
@Form.create()
class Roles extends PureComponent {
  state = {
    height: `${document.body.clientHeight-360}px`,
    itemIndex: -1,
    search: '',
    key: '',
    isCollapsed: true,
    editStatus: -1,
    roleOptions: [],
    targetRole: {},
    resourcePer: {},
    addPermission: {},
    removePermission: {},

    expandedKeys: [],
    autoExpandParent: true,
  }
  componentDidMount() {
    const { dispatch, match } = this.props
    window.addEventListener('resize', this.resizeHeight)
    this.queryAclUserPerRoles()
    dispatch({
      type: 'acl/queryAclResourceTree',
      payload: {},
      callback: (doc) => {
      }
    })
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeHeight)
  }
  resizeHeight = () => {
    this.setState({ height: `${document.body.clientHeight-360}px` });
  }

  queryAclUserPerRoles = () => {
    const { dispatch } = this.props
    dispatch({
      type: 'acl/queryAclUserPerRoles',
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

  handleItemClick = (item, index) => {
    const {dispatch} = this.props
    const {itemIndex} = this.state
    if (itemIndex === index) return
    dispatch({
      type: 'acl/queryAclResourcePer',
      payload: {id: item._id, role: item.code},
      callback: (resourcePer) => {
        this.setState({itemIndex: index, targetRole: item, resourcePer, addPermission: {}, removePermission: {}})
      }
    })
  }

  handleSubmit = e => {
    e.preventDefault();
    const self = this;
    const { form, dispatch } = this.props;
    const {editStatus, targetRole} = this.state
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        let type = 'acl/addAclRole'
        let update = {isCollapsed: true, editStatus: -1, itemIndex: -1}
        if (editStatus === 2){
          values._id = targetRole._id
          type = 'acl/updateAclRole'
          delete update.itemIndex
        }
        values.status === true ? values.status = 1 : values.status = 0

        dispatch({
          type: type,
          payload: values,
          callback: (doc) => {
            console.log(doc)
            self.setState({targetRole: doc, ...update})
            self.queryAclUserPerRoles()
          }
        });
      }
    });
  }
  handleCancel = () => {
    this.setState({isCollapsed: true, editStatus: -1})
  }
  handleAdd = () => {
    let {isCollapsed} = this.state
    isCollapsed = !isCollapsed
    let editStatus = -1
    isCollapsed ? (editStatus = -1) : (editStatus = 1)
    this.setState({isCollapsed, editStatus})
  }
  handleUpdate = () => {
    let {isCollapsed} = this.state
    isCollapsed = !isCollapsed
    let editStatus = -1
    isCollapsed ? (editStatus = -1) : (editStatus = 2)
    this.setState({isCollapsed, editStatus})
  }
  changePermisssion = (e, item, type) => {
    let {addPermission, removePermission, resourcePer, itemIndex} = this.state
    if (itemIndex === -1) return
    const checked = e.target.checked
    const code = item.code
    resourcePer[code] || (resourcePer[code] = [])
    addPermission[code] || (addPermission[code] = [])
    removePermission[code] || (removePermission[code] = [])
    if (checked) {
      if (!removePermission[code] || removePermission[code].indexOf(type) === -1) {
        if (!addPermission[code]) {
          addPermission[code] = [type]
        } else {
          if (addPermission[code].indexOf(type) === -1) {
            addPermission[code].push(type)
          }
        }
      } else {
        removePermission[code].splice(removePermission[code].indexOf(type), 1)
      }
      resourcePer[code].push(type)
    } else {
      if (!addPermission[code] || addPermission[code].indexOf(type) === -1) {
        if (!removePermission[code]) {
          removePermission[code] = [type]
        } else {
          if (removePermission[code].indexOf(type) === -1) {
            removePermission[code].push(type)
          }
        }
      } else {
        addPermission[code].splice(addPermission[code].indexOf(type), 1)
      }
      resourcePer[code].splice(resourcePer[code].indexOf(type), 1)
    }
    addPermission = Object.assign({}, addPermission)
    removePermission = Object.assign({}, removePermission)
    resourcePer = Object.assign({}, resourcePer)
    this.setState({resourcePer, addPermission, removePermission})
  }
  handleSave = () => {
    const {acl:model, dispatch} = this.props
    let {addPermission, removePermission, targetRole} = this.state
    function formatPermission(ary) {
      let allow=[];
      for (let key in ary) {
        if (ary.hasOwnProperty(key) && ary[key].length){
          let per={
            permissions:ary[key],
            resources:key
          };
          allow.push(per);
        }
      }
      return allow;
    }
    addPermission = formatPermission(addPermission)
    removePermission = formatPermission(removePermission)
    dispatch({
      type: 'acl/updateAclRoleResource',
      payload: {
        id: targetRole._id, roles: targetRole.code, addPermission, removePermission
      },
      callback: (doc) => {
        this.setState({addPermission: {}, removePermission: {}})
      }
    })
  }

  handleDelete = (item) => {
    const self = this
    const {dispatch} = this.props
    let {targetRole} = this.state
    let update = {itemIndex: -1}
    if (targetRole._id === item._id) {
      update.targetRole = {}
    }
    dispatch({
      type: 'acl/removeAclRole',
      payload: {id: item._id},
      callback: (doc) => {
        self.setState(update)
        self.queryAclUserPerRoles()
      }
    });
  }

  onExpand = (expandedKeys) => {
    this.setState({
      expandedKeys,
      autoExpandParent: true,
    });
  }

  render () {
    const height = `calc(${this.state.height} - 20px)`
    const { expandedKeys, autoExpandParent, itemIndex, isCollapsed, editStatus, roleOptions, targetRole, resourcePer } = this.state;
    const { getFieldDecorator } = this.props.form
    const { loading, resLoading, acl:model } = this.props
    const { perRoles, userRoles, resourceTree } = model
    let curRole = {}
    if (editStatus === 2) {
      curRole = targetRole
    }

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
        {editStatus !== 2 && <Button type={isCollapsed ? 'primary' : 'default'} size="small" style={{ marginLeft: 4}} onClick={() => this.handleAdd()}>{isCollapsed ? '新增' : '取消'}</Button>}
        {itemIndex !== -1 && editStatus !== 1 && <Button size="small" style={{ marginLeft: 3, color: '#fff', backgroundColor: '#27c24c', borderColor: '#27c24c'}} onClick={() => this.handleUpdate()}>{isCollapsed ? '编辑' : '取消'}</Button>}
      </span>
    )

    const leftTitle = (
      <span>
        <Form layout="inline">
          <Row type="flex" justify="start">
            <Col md={10} sm={24}>
              <FormItem label="角色">
                <Input size="small" value={targetRole.title || '角色'} disabled={true}/>
              </FormItem>
            </Col>
            <Col md={10} sm={24}>
              <FormItem label="描述">
                <Input size="small" value={targetRole.description || '描述'} disabled={true}/>
              </FormItem>
            </Col>
          </Row>
        </Form>
      </span>
    )

    const rightExtra = (
      <span>
        <Button type="primary" size="small" style={{ marginLeft: 3}} onClick={() => this.handleSave()}>保存</Button>
      </span>
    )

    let self = this
    function showConfirm(item) {
      confirm({
        title: '提示',
        content: '是否确定删除?',
        onOk() {
          self.handleDelete(item);
        },
        onCancel() {
        },
      });
    }


    const loop = data => data.map((item) => {
      const permissions = item.permissions || []
      const per = itemIndex !== -1 && resourcePer[item.code] || []
      const title = (
        <span>
          <Tooltip title={item.code} key={item._id}>
            {item.title}
          </Tooltip>
          <div className={styles.pullRight}>
            <span style={{marginRight: 44, width: 16, display: 'inline-block'}}>{permissions.indexOf('post') > -1 &&
            <Checkbox checked={per.indexOf('post') > -1} onChange={(e) => this.changePermisssion(e, item, 'post')}></Checkbox>}</span>
            <span style={{marginRight: 42, width: 16, display: 'inline-block'}}>{permissions.indexOf('put') > -1 &&
            <Checkbox checked={per.indexOf('put') > -1} onChange={(e) => this.changePermisssion(e, item, 'put')}></Checkbox>}</span>
            <span style={{marginRight: 40, width: 16, display: 'inline-block'}}>{permissions.indexOf('delete') > -1 &&
            <Checkbox checked={per.indexOf('delete') > -1} onChange={(e) => this.changePermisssion(e, item, 'delete')}></Checkbox>}</span>
            <span style={{marginRight: 15, width: 16, display: 'inline-block'}}>{permissions.indexOf('get') > -1 &&
            <Checkbox checked={per.indexOf('get') > -1} onChange={(e) => this.changePermisssion(e, item, 'get')}></Checkbox>}</span>
          </div>
        </span>
      );
      if (item.children) {
        return (
          <TreeNode key={item._id} title={title} className={styles.bottomborder} selectable={false} style={{padding: 0}}>
            {loop(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode key={item._id} title={title} className={styles.bottomborder} selectable={false} style={{padding: 0}}/>;
    });

    return (
      <PageHeaderWrapper title="角色管理">
        <Card bodyStyle={{padding:0}}>
          <Row style={{top:'-10px'}}>
            <Col xl={6} lg={24} md={24} sm={24} xs={24} style={{marginTop:'10px'}}>
              <Card loading={loading} title="角色" extra={itemButtonGroup} bordered={false} style={{borderRight: '1px solid #E4EAEC'}} bodyStyle={{padding:0, height: '100%'}}>
                {
                  !this.state.isCollapsed && (
                    <Form onSubmit={this.handleSubmit} hideRequiredMark style={{ padding: '10px 15px', backgroundColor: '#fafafa' }}>
                      <FormItem {...formItemLayout} label="上级">
                        {
                          getFieldDecorator('parents', {
                            rules: [],
                            initialValue: curRole.parents || [],
                          })
                          (<Select
                            mode="multiple"
                            placeholder="上级角色"
                          >
                            {roleOptions}
                          </Select>)
                        }
                      </FormItem>
                      <FormItem {...formItemLayout} label="编码">
                        {
                          getFieldDecorator('code', {
                            rules: [{
                              required: true,
                              message: '请输入编码',
                            }],
                            initialValue: curRole.code || '',
                          })
                          (<Input placeholder="编码(a-z|A-Z|0-9字符)" />)
                        }
                      </FormItem>
                      <FormItem {...formItemLayout} label="名称">
                        {
                          getFieldDecorator('title', {
                            rules: [{
                              required: true,
                              message: '请输入名称',
                            }],
                            initialValue: curRole.title || '',
                          })
                          (<Input placeholder="名称" />)
                        }
                      </FormItem>
                      <FormItem {...formItemLayout} label="描述">
                        {
                          getFieldDecorator('description', {
                            rules: [{
                              required: true,
                              message: '请输入描述',
                            }],
                            initialValue: curRole.description || '',
                          })
                          (<Input placeholder="描述" />)
                        }
                      </FormItem>
                      <FormItem {...formItemLayout} label="开/关">
                        {
                          getFieldDecorator('status', {
                            rules: [],
                            initialValue: curRole.status === 1 ? true : false,
                          })
                          (<Switch checkedChildren="开" unCheckedChildren="关" defaultChecked={curRole.status === 1 ? true : false} />)
                        }
                      </FormItem>
                      <FormItem wrapperCol={{xs: { span: 14, offset: 8 },sm: { span: 14, offset: 8 }}} style={{ marginTop: 25 }}>
                        <Button type="primary" htmlType="submit">保存</Button>
                        <Button onClick={() => this.handleCancel()} style={{ marginLeft: 8 }}>取消</Button>
                      </FormItem>
                    </Form>
                  )
                }

                <div className={styles.scrollYHidden} style={{height:this.state.height}}>
                  <div style={{height: this.state.height}}>
                    <div className={styles.listGroup}>
                      {
                        perRoles.map((item, index) => {
                          return (
                            <Tooltip title={`${item.code}:${item.description}`} key={item._id}>
                              <a className={classNames(styles.listGroupItem,{[styles.selected]: index === this.state.itemIndex})} key={item._id} onClick={() => {this.handleItemClick(item, index)}}>
                                {!userRoles[item.code] && isCollapsed && <Icon type="close" key="Icon" className={styles.hoverAction} onClick={() => {showConfirm(item)}} />}
                                {item.title}
                              </a>
                            </Tooltip>
                          )
                        })
                      }
                    </div>
                  </div>
                </div>

              </Card>
            </Col>

            <Col xl={18} lg={24} md={24} sm={24} xs={24} style={{marginTop:'10px'}}>
              <Card loading={resLoading} title={leftTitle} extra={rightExtra} bordered={false} style={{borderLeft: '1px solid #E4EAEC'}} bodyStyle={{padding:0}} className={styles.headTitle}>
                <div style={{paddingLeft: 0, backgroundColor: '#f6f6f6'}}>
                  <span className={styles.listGroupItem} onClick={() => {}}>资源
                    <div className={styles.pullRight}>
                      <Tooltip title={`POST`}><span style={{marginRight: 30}}>新增</span></Tooltip>
                      <Tooltip title={`PUT`}><span style={{marginRight: 30}}>修改</span></Tooltip>
                      <Tooltip title={`DELETE`}><span style={{marginRight: 30}}>删除</span></Tooltip>
                      <Tooltip title={`GET`}><span>查询</span></Tooltip>
                    </div>
                  </span>
                </div>
                <div className={styles.scrollYHidden} style={{height:this.state.height}}>
                  <div style={{height: this.state.height, width: '102%', padding: 0}}>
                    <Tree
                      onExpand={this.onExpand}
                      expandedKeys={expandedKeys}
                      autoExpandParent={autoExpandParent}
                    >
                      {loop(resourceTree)}
                    </Tree>
                  </div>

                </div>

              </Card>
            </Col>
          </Row>
        </Card>

      </PageHeaderWrapper>
    )
  }
}

export default Roles
