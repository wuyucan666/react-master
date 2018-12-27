import React, {PureComponent, Fragment} from 'react';
import {connect} from 'dva';
import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Tag,
  Button,
  Modal,
} from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import StandardTable from '@/components/StandardTable';

import styles from './index.less';

const {TextArea} = Input;
const {CheckableTag} = Tag;
const FormItem = Form.Item;
const confirm = Modal.confirm;

const CreateForm = Form.create()(props => {
  const {
    handleAdd, handleUpdate, handleModalVisible, handleTagChange, handleInputChange, handleTextAreaChange,
    modalVisible, form, selectedTags, tags, data, titleLength, contentLength
  } = props;
  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      form.resetFields();
      if (data.id) {
        let update = {...data, ...fieldsValue}
        handleUpdate(update);
      } else {
        handleAdd(fieldsValue);
      }
    });
  };
  const cancelHandle = () => {
    console.log('cancelHandle')
    form.resetFields();
    return handleModalVisible();
  };

  const formItemLayout = {
    labelCol: {
      span: 3
    },
    wrapperCol: {
      span: 19
    },
  }

  return (
    <Modal
      title="新建/修改卡片"
      visible={modalVisible}
      width="50%"
      okText="保存"
      onOk={okHandle}
      onCancel={cancelHandle}
    >
      <FormItem {...formItemLayout} label="标题">
        {form.getFieldDecorator('title', {
          rules: [{
            required: true, message: '请填写“标题”', transform: function (value){
              if (!value) return
              return value.trim();
            }
          }],
          initialValue: data.title
        })(
          <Input style={{paddingRight: '50px'}} maxLength='15' onChange={(e) => handleInputChange(e)}
                 placeholder="请输入"/>
        )}
        <span style={{position: 'absolute', right: 10}}>{titleLength}/15</span>
      </FormItem>
      <FormItem {...formItemLayout} label="内容">
        {form.getFieldDecorator('content', {
          rules: [{
            required: true, message: '请填写“内容”', transform: function (value){
              if (!value) return
              return value.trim();
            }
          }],
          initialValue: data.content
        })(
          <TextArea placeholder="请输入" onChange={(e) => handleTextAreaChange(e)} autosize={{minRows: 5, maxRows: 8}}
                    maxLength='100' style={{display: 'block', resize: 'none', width: '100%', paddingBottom: '20px'}}/>
        )}
        <div style={{position: 'relative'}}>
          <span style={{position: 'absolute', right: 10, bottom: -5}}>{contentLength}/100</span>
        </div>
      </FormItem>
      <FormItem {...formItemLayout} label="关联标签">
        <div style={{maxHeight: 150, overflowY: 'auto'}}>
          {tags.map(item => (
            <CheckableTag key={item.id} style={{borderColor: '#d9d9d9'}}
                          checked={selectedTags.indexOf(item.id) > -1}
                          onChange={checked => handleTagChange(item.id, checked)}>
              {item.name}
            </CheckableTag>
          ))}
        </div>
      </FormItem>
    </Modal>
  );
})

@connect(({KnowledgeCard, loading}) => ({
  KnowledgeCard,
  loading: loading.effects['KnowledgeCard/list'],
}))
@Form.create()
export default class TableList extends PureComponent {
  state = {
    modalVisible: false,
    selectedRows: [],
    formValues: {},
    selectedTags: [],
    modifiedData: {},
    page: 1,
    pageSize: 10,
    titleLength: 0,
    contentLength: 0,
  };

  componentDidMount() {
    const {dispatch} = this.props
    dispatch({
      type: 'KnowledgeCard/list',
      payload: {page: 1, rows: this.state.pageSize},
    })
    dispatch({
      type: 'KnowledgeCard/tags'
    })
  }

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    console.log('pagination', pagination)
    console.log('filtersArg', filtersArg)
    console.log('sorter', sorter)
    const {dispatch} = this.props;
    const { search } = this.state;

    this.setState({pageSize: pagination.pageSize, page: pagination.current, selectedRows: []})
    dispatch({
      type: 'KnowledgeCard/list',
      payload: {page: pagination.current, rows: pagination.pageSize, ...search},
    })
  };

  handleFormReset = () => {
    const {form, dispatch} = this.props;
    form.resetFields();
  };

  handleSelectRows = rows => {
    console.log('handleSelectRows', rows)
    this.setState({
      selectedRows: rows,
    });
  };

  handleDeleteData = () => {
    console.log('handleDeleteData')
    const {dispatch} = this.props;
    const {selectedRows, page, pageSize} = this.state;
    const rows = selectedRows
    if (!rows.length) return
    let id = rows.map(row => row.id).join(',')
    dispatch({
      type: 'KnowledgeCard/remove',
      payload: {id, page, pageSize},
      callback: (data) => {
        console.log(data)
        this.setState({
          page: data.page || 1,
          selectedRows: [],
        });
      },
    })
  }

  handleSearch = e => {
    e.preventDefault();
    const {dispatch, form} = this.props;
    form.validateFields((err, fields) => {
      if (err) return;
      let query = {page: 1, rows: this.state.pageSize, search: 1}
      this.setState({search:{search:1,title:fields.search}})
      if (fields.search) {
        query.title = fields.search
      }
      dispatch({
        type: 'KnowledgeCard/list',
        payload: query,
      })
    });
  };

  handleModalVisible = (flag, data) => {
    const {form} = this.props;
    let modalVisible = !!flag
    let update = {modalVisible}
    if (!modalVisible) {
      update.selectedTags = []
      update.titleLength = 0
      update.contentLength = 0
    }
    data ? update.modifiedData = data : update.modifiedData = {}
    if (data) {
      data.tags || (data.tags = [])
      let ary = []
      data.tags.forEach(function (item) {
        ary.push(item.id)
      })
      update.selectedTags = ary
      update.titleLength = data.title.length
      update.contentLength = data.content.length
    }
    this.setState(update);
  };

  getSelectTags = () => {
    const {KnowledgeCard: model} = this.props;
    const {selectedTags} = this.state;
    let newTags = []
    model.tags.forEach(function (item) {
      if (selectedTags.indexOf(item.id) !== -1) {
        newTags.push(item)
      }
    })
    return newTags
  }

  handleAdd = fields => {
    const {dispatch} = this.props;
    const { pageSize} = this.state
    fields.tags = this.getSelectTags()
    fields.page = 1
    fields.rows = pageSize
    console.log('handleAdd', fields)
    this.setState({page: 1, modalVisible: false, selectedTags: [], titleLength: 0, contentLength: 0});
    dispatch({
      type: 'KnowledgeCard/create',
      payload: fields,
    })
  }

  handleUpdate = fields => {
    const {dispatch} = this.props;
    const {page, pageSize} = this.state;
    fields.tags = this.getSelectTags()
    fields.page = page
    fields.rows = pageSize
    console.log('handleUpdate', fields)
    this.setState({modalVisible: false, selectedTags: [], titleLength: 0, contentLength: 0});
    dispatch({
      type: 'KnowledgeCard/update',
      payload: fields,
    })
  }

  handleTagChange = (tag, checked) => {
    const {selectedTags} = this.state;
    const nextSelectedTags = checked
      ? [...selectedTags, tag]
      : selectedTags.filter(t => t !== tag);
    console.log('You are interested in: ', nextSelectedTags);
    this.setState({selectedTags: nextSelectedTags})
  }

  handleInputChange = (e) => {
    this.setState({titleLength: e.target.value.length})
  };
  handleTextAreaChange = (e) => {
    this.setState({contentLength: e.target.value.length})
  }

  renderSimpleForm() {
    const {getFieldDecorator} = this.props.form
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{md: 8, lg: 24, xl: 48}}>
          <Col md={8} sm={24}>
            <FormItem label="卡片标题">
              {getFieldDecorator('search', {})(<Input placeholder="搜索标题"/>)}
            </FormItem>
          </Col>
          <Col md={16} sm={24}>
            <span className={styles.submitButtons}>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
              {/*<Button style={{marginLeft: 8}} onClick={this.handleFormReset}>*/}
                {/*重置*/}
              {/*</Button>*/}
            </span>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    let self = this
    const {KnowledgeCard: model, loading,} = this.props
    const {selectedRows, modalVisible, selectedTags, pageSize, modifiedData, titleLength, contentLength} = this.state
    const {data, tags} = model
    const rows = data.rows || []
    const listData = {list: rows, pagination: {current: Number(data.page), total: Number(data.total), pageSize}}

    const columns = [
      {
        title: '卡片ID',
        dataIndex: 'id',
        width: '10%',
      },
      {
        title: '卡片标题',
        dataIndex: 'title',
        width: '30%',
        render: (text, record, index) => (
          <Fragment>
            <span>{text}</span>
          </Fragment>
        )
      },
      {
        title: '关联标签',
        dataIndex: 'tags',
        width: '50%',
        render: (tags) => {
          tags || (tags = [])
          let ary = []
          tags.forEach(function (item) {
            ary.push(item.name)
          })
          let str = ary.join('，')
          if (str.length > 35){
            str = str.slice(0, 35)
            str += '...'
          }
          return (
            <Fragment>
              <Row>{str}</Row>
            </Fragment>
          )
        }
      },
      {
        title: '操作',
        width: '10%',
        render: (text, record, index) => (
          <Fragment>
            <a onClick={() => this.handleModalVisible(true, record)}>修改</a>
          </Fragment>
        )
      },
    ];

    const parentMethods = {
      handleAdd: this.handleAdd,
      handleUpdate: this.handleUpdate,
      handleModalVisible: this.handleModalVisible,
      handleTagChange: this.handleTagChange,
      handleInputChange: this.handleInputChange,
      handleTextAreaChange: this.handleTextAreaChange
    };

    function showConfirm(fun) {
      confirm({
        title: '删除卡片',
        content: '确定删除卡片?',
        onOk() {
          fun();
        },
        onCancel() {
        },
      });
    }

    return (
      <PageHeaderWrapper title="知识卡片">
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderSimpleForm()}</div>
            <div className={styles.tableListOperator}>
              <Button icon="plus" type="primary" onClick={() => this.handleModalVisible(true)}>
                新建
              </Button>
              {selectedRows.length > 0 && (
                <span>
                  <Button type="danger" onClick={() => showConfirm(this.handleDeleteData)}>删除</Button>
                </span>
              )}
            </div>
            <StandardTable
              selectedRows={selectedRows}
              loading={loading}
              data={listData}
              columns={columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
        <CreateForm {...parentMethods} modalVisible={modalVisible} selectedTags={selectedTags} tags={tags}
                    data={modifiedData} titleLength={titleLength} contentLength={contentLength}/>
      </PageHeaderWrapper>
    );
  }
}
