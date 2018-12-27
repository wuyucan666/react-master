import React, { PureComponent } from 'react'
import { connect } from 'dva'
import { Card, Col, Row, Button, InputNumber, Input, Form, message, Modal, Switch, Tree, Checkbox, Tooltip, Select } from 'antd'
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './index.less';
import classNames from 'classnames';

const FormItem = Form.Item;
const confirm = Modal.confirm
const TreeNode = Tree.TreeNode;
const {Option} = Select;


@connect(({acl, loading}) => ({
  acl,
  loading: loading.effects['acl/queryAclResourceTree'],
}))
@Form.create()
class Resources extends PureComponent {
  state = {
    height: `${document.body.clientHeight-100}px`,
    isNew: false,
    resourceTree: [],
    targetResource: {},
    parentResource: {},

    expandedKeys: [],
    autoExpandParent: true,
  }
  componentDidMount() {
    const { dispatch, match } = this.props
    window.addEventListener('resize', this.resizeHeight)
    this.queryAclResourceTree()
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeHeight)
  }
  resizeHeight = () => {
    this.setState({ height: `${document.body.clientHeight-100}px` });
  }

  queryAclResourceTree = () => {
    const { dispatch } = this.props
    dispatch({
      type: 'acl/queryAclResourceTree',
      payload: {},
      callback: (rows) => {
        let resourceTree = [{_id: 1, title: '默认'}].concat(rows);
        this.setState({ resourceTree });
      }
    })
  }

  handleItemClick = (item, parent) => {
    const {form, dispatch} = this.props
    form.resetFields();
    let targetResource = Object.assign({}, item)
    if (parent) {
      targetResource.pTitle = parent.title
    }
    let parentResource = Object.assign({}, parent)

    this.setState({ targetResource, parentResource, isNew: false });
  }

  handleSubmit = e => {
    e.preventDefault();
    const self = this;
    const { form, dispatch } = this.props;
    const {isNew, targetResource, parentResource} = this.state
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        form.resetFields();
        let type = 'acl/addAclResource'
        let update = {isCollapsed: true, editStatus: -1, itemIndex: -1}
        if (!isNew){
          values._id = targetResource._id
          type = 'acl/updateAclResource'
        }
        if (parentResource && parentResource._id != 1) {
          values.parent = parentResource._id
        }
        console.log(parentResource)
        console.log(values)
        dispatch({
          type: type,
          payload: values,
          callback: (doc) => {
            // console.log(doc)
            this.setState({targetResource: {}})
            this.queryAclResourceTree()
          }
        });
      }
    });
  }

  handleAdd = () => {
    let {isNew, targetResource, parentResource} = this.state
    isNew = !isNew
    if (isNew) {
      parentResource = Object.assign({}, targetResource)
      targetResource = {pTitle: targetResource.title}
    } else {
      targetResource = Object.assign({}, parentResource)
      parentResource = {}
    }
    this.setState({isNew, parentResource, targetResource})
  }

  handleDelete = () => {
    const self = this
    const {dispatch} = this.props
    const {targetResource} = this.state
    confirm({
      title: '提示',
      content: '是否确定删除?',
      onOk() {
        dispatch({
          type: 'acl/removeAclResource',
          payload: {id: targetResource._id},
          callback: (doc) => {
            self.setState({targetResource: {}})
            self.queryAclResourceTree()
          }
        });
      },
      onCancel() {
      },
    });
  }

  onExpand = (expandedKeys) => {
    this.setState({
      expandedKeys,
      autoExpandParent: true,
    });
  }

  render () {
    const { expandedKeys, autoExpandParent, resourceTree, targetResource, isNew } = this.state;
    const { getFieldDecorator } = this.props.form
    const { loading, acl:model } = this.props
    const isDefault = (targetResource._id && targetResource._id === 1 || false)

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 },
        md: { span: 5 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
        md: { span: 16 },
      },
    }

    const itemButtonGroup = (
      <span>
        <Button type={!isNew ? 'primary' : 'default'} size="small" onClick={() => this.handleAdd()}>{!isNew ? '新增' : '取消'}</Button>
      </span>
    )

    const loop = (rows, parent) => rows.map((item) => {
      const title = (
        <span onClick={() => this.handleItemClick(item, parent)}>
          {item.title}
        </span>
      );
      if (item.children) {
        return (
          <TreeNode key={item._id} title={title}>
            {loop(item.children, item)}
          </TreeNode>
        );
      }
      return <TreeNode key={item._id} title={title}/>;
    });

    return (
      <PageHeaderWrapper title="角色管理">
        <Card bodyStyle={{padding:0}}>
          <Row style={{top:'-10px'}}>
            <Col xl={6} lg={24} md={24} sm={24} xs={24} style={{marginTop:'10px'}}>
              <Card loading={loading} title="资源" extra={itemButtonGroup} bordered={true} style={{borderRight: '1px solid #E4EAEC'}} bodyStyle={{padding:0, height: '100%'}}>
                <div className={styles.scrollYHidden} style={{height:this.state.height}}>
                  <div style={{height: this.state.height, padding: 0}}>
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

            <Col xl={18} lg={24} md={24} sm={24} xs={24} style={{marginTop:'10px'}}>
              <Card title={"编辑资源"} bordered={false} style={{borderLeft: '1px solid #E4EAEC'}}>
                <Form onSubmit={this.handleSubmit}>
                  <FormItem {...formItemLayout} label="上级资源">
                    {
                      getFieldDecorator('pTitle', {
                        rules: [],
                        initialValue: targetResource.pTitle || '',
                      })
                      (<Input placeholder="上级资源" disabled={isNew || isDefault || !!targetResource._id} />)
                    }
                  </FormItem>
                  <FormItem {...formItemLayout} label="编码">
                    {
                      getFieldDecorator('code', {
                        rules: [{
                          required: true,
                          message: '请输入编码',
                        }],
                        initialValue: targetResource.code || '',
                      })
                      (<Input placeholder="编码(a-z|A-Z|0-9字符)" disabled={isDefault || !!targetResource._id} />)
                    }
                  </FormItem>
                  <FormItem {...formItemLayout} label="名称">
                    {
                      getFieldDecorator('title', {
                        rules: [{
                          required: true,
                          message: '请输入名称',
                        }],
                        initialValue: targetResource.title || '',
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
                        initialValue: targetResource.description || '',
                      })
                      (<Input placeholder="描述" />)
                    }
                  </FormItem>
                  <FormItem {...formItemLayout} label="权限">
                    {
                      getFieldDecorator('permissions', {
                        rules: [{
                          required: true,
                          message: '请选择权限',
                        }],
                        initialValue: targetResource.permissions || [],
                      })
                      (<Select
                        mode="multiple"
                        placeholder="请选择权限"
                      >
                        <Option key="*">*</Option>
                        <Option key="post">增</Option>
                        <Option key="put">改</Option>
                        <Option key="delete">删</Option>
                        <Option key="get">查</Option>
                      </Select>)
                    }
                  </FormItem>
                  <FormItem {...formItemLayout} label="顺序">
                    {
                      getFieldDecorator('sort', {
                        initialValue: targetResource.sort || 0,
                      })
                      (<InputNumber placeholder="顺序" min={0} />)
                    }
                  </FormItem>
                  <FormItem {...formItemLayout} label="禁止传递权限">
                    {
                      getFieldDecorator('noRecursion', {
                        valuePropName: 'checked',
                        initialValue: targetResource.noRecursion || false,
                      })
                      (<Checkbox></Checkbox>)
                    }
                  </FormItem>
                  <FormItem {...formItemLayout} label="是否显示">
                    {
                      getFieldDecorator('visible', {
                        valuePropName: 'checked',
                        initialValue: targetResource.visible || false,
                      })
                      (<Checkbox></Checkbox>)
                    }
                  </FormItem>

                  {
                    !isDefault && (isNew || targetResource._id !== undefined) &&
                    <FormItem wrapperCol={{xs: { span: 14, offset: 8 },sm: { span: 14, offset: 8 }}} style={{ marginTop: 25 }}>
                      <Button type="primary" htmlType="submit">{isNew ?  '创建' : '更新'}</Button>
                      {!isNew && <Button onClick={() => this.handleDelete()} style={{ marginLeft: 8 }}>删除</Button>}
                    </FormItem>
                  }

                </Form>
              </Card>
            </Col>
          </Row>
        </Card>

      </PageHeaderWrapper>
    )
  }
}

export default Resources
