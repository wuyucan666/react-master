import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Select,
  Button,
  Modal,
  message,
} from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import StandardTable from '@/components/StandardTable';

import styles from './TagList.less';

const { TextArea } = Input;
const FormItem = Form.Item;
const confirm = Modal.confirm;
const { Option } = Select;
const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');

const CreateForm = Form.create()(props => {
  const { modalVisible, form, handleAdd, handleModalVisible, data, handleUpdate, handleInputChange, handleTextAreaChange, titleLength, contentLength,checkName } = props;
  const callbackError = (text) => {
    form.setFields({
      name: {
        value: '',
        errors: [new Error(text)],
      },
    });
  }
  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      form.resetFields();
      if (data.id) {
        let update = {...data, ...fieldsValue}
        handleUpdate(update);
      } else {
        handleAdd(fieldsValue, callbackError);
      }
    });
  };
  const cancelHandle = () => {
    form.resetFields()
    handleModalVisible(false)
  };
  const o =
    <FormItem labelCol={{ span: 2 }} wrapperCol={{ span: 20 }} label="名称:">
      {form.getFieldDecorator('name', {
        rules: [
          { required: true,
            message: '标题为空',
            transform: function (value){
              return value.trim();
            },
          },
        ],
        initialValue: data.name,
      })(
        <Input
          style={{paddingRight: '50px'}}
          maxLength='10'
          onChange={(e) => handleInputChange(e)}
          disabled={!!data.id}
        />
      )}
      <span style={{position: 'absolute', right: 10}}>{titleLength}/10</span>
    </FormItem>
  return (
    <Modal
      title="新建标签"
      visible={modalVisible}
      width='50%'
      okText="保存"
      onOk={okHandle}
      onCancel={() => cancelHandle()}
    >
      {o}
      <FormItem labelCol={{ span: 2 }} wrapperCol={{ span: 20 }} label="描述">
        {form.getFieldDecorator('description', {
          initialValue: data.description,
        })(<TextArea
          onChange={(e) => handleTextAreaChange(e)}
          autosize={{minRows: 5, maxRows: 8}}
          maxLength='100'
          style={{display: 'block', resize: 'none', width: '100%', paddingBottom: '20px'}}
        />)}
        <div style={{position: 'relative'}}>
          <span style={{position: 'absolute', right: 10, bottom: -5}}>{contentLength}/100</span>
        </div>
      </FormItem>

    </Modal>
  );
});

@connect(({ Tag, loading }) => ({
  Tag,
  loading: loading.effects['Tag/fetch'],
}))
@Form.create()
export default class TagList extends PureComponent {
  state = {
    modalVisible: false,
    expandForm: false,
    selectedRows: [],
    formValues: {},
    pageSize: 10,
    page: 1,
    modifiedData: {},
    titleLength: 0,
    contentLength: 0,
    search:{},
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'Tag/fetch',
    });
  }

  handleMenuClick = e => {
    const { dispatch } = this.props;
    const { selectedRows,page,pageSize } = this.state;

    if (!selectedRows) return;
    dispatch({
      type: 'Tag/remove',
      payload: {
        ids: selectedRows.map(row => row.id).join(','),
        page,
        rows:pageSize,
      },
      callback: (data) => {
        this.setState({
          page:data.page || 1,
          selectedRows: [],
        });
      },
    });
  };

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  handleAdd = (fields,funError) => {
    const { dispatch } = this.props
    const { pageSize} = this.state
    let params = fields
    params.page = 1
    params.rows = pageSize
    dispatch({
      type: 'Tag/add',
      payload: params,
      callback: (res) => {
        if (!res.err){
          this.setState({page: 1, modalVisible: false, titleLength: 0, contentLength: 0});
        } else {
          this.setState({ titleLength: 0, contentLength: 0});
          funError(res.msg)
        }
        const state = this.props
        console.log(state)
      },
    });
  }

  handleInputChange = (e) => {
    this.setState({titleLength: e.target.value.length})
  };
  handleTextAreaChange = (e) => {
    this.setState({contentLength: e.target.value.length})
  }

  handleSearch = e => {
    e.preventDefault();

    const { dispatch, form } = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const values = {
        ...fieldsValue,
        updatedAt: fieldsValue.updatedAt && fieldsValue.updatedAt.valueOf(),
      };

      this.setState({
        formValues: values,
      });
      let payload = {search:1}
      if(values.name) payload.name = values.name
      this.setState({search: {search:1,name:values.name}})
      dispatch({
        type: 'Tag/fetch',
        payload,
      });
    });
  };

  handleModalVisible = (flag, data) => {
    const modalVisible = !!flag
    let update = {modalVisible}
    update.modifiedData = data || {}
    if (!modalVisible) {
      update.selectedTags = []
      update.titleLength = 0
      update.contentLength = 0
    }
    if(data){
      update.titleLength = data.name.length
      update.contentLength = data.description.length
    }
    this.setState(update);
    this.setState({
      modalVisible:flag,
    })
  };


  handleUpdate = fields => {
    const {dispatch} = this.props;
    this.setState({modalVisible: false});
    let params = fields
    console.log('params.id',params.id)
    params.page = this.state.page
    params.rows = this.state.pageSize
    console.log('params',params)
    dispatch({
      type: 'Tag/update',
      payload: params,
    })
  }

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const {dispatch} = this.props;
    const { search } = this.state;

    this.setState({
      pageSize: pagination.pageSize,
      page: pagination.current,

    })
    dispatch({
      type: 'Tag/fetch',
      payload: {page: pagination.current, rows: pagination.pageSize, ...search},
    })
    this.setState({selectedRows: []})
  };


  renderForm() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label='标签名称'>
              {getFieldDecorator('name')(<Input placeholder='' />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <span className={styles.submitButtons}>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
            </span>
          </Col>
        </Row>
      </Form>
    );
  }


  render () {
    const { Tag: { data }, loading } = this.props;
    const {selectedRows, modalVisible, pageSize, modifiedData, titleLength, contentLength} = this.state
    const listData = {
      list: data.rows,
      pagination: {
        total: data.total,
        pageSize,
        current: Number(data.page),
      },
    }
    const columns = [
      {
        title: '标签ID',
        dataIndex: 'id',
        key: 'key',
        width: 100,
      },
      {
        title: '标签名称',
        dataIndex: 'name',
      },
      {
        title: '关联次数',
        dataIndex: 'card_count',
      },
      {
        title: '标签描述',
        dataIndex: 'description',
        render: (description) => {
          let str = description
          if (str.length > 35) {
            str = str.slice(0,35)
            str += '...'
          }
          return(
            <Fragment>
              <Row>{str}</Row>
            </Fragment>
          )
        },
      },
      {
        title: '关联用户数',
        dataIndex: 'user_count',
      },
      {
        title: '操作',
        render: (text, record, index) => (
          <Fragment>
            <a onClick={() => this.handleModalVisible(true, record)}>修改描述</a>
          </Fragment>
        ),
      },
    ];
    const parentMethods = {
      handleAdd: this.handleAdd,
      handleModalVisible: this.handleModalVisible,
      handleUpdate: this.handleUpdate,
      handleInputChange: this.handleInputChange,
      handleTextAreaChange: this.handleTextAreaChange,
      CheckName: this.CheckName,
    };
    function showConfirm (fun) {
      confirm({
        title: '删除标签',
        content: '删除标签可能会影响已经关联该标签的卡片，确定删除？',
        onOk() {
          fun();
        },
        onCancel() {
        },
      });
    }
    return (
      <PageHeaderWrapper title="标签列表">
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderForm()}</div>
            <div className={styles.tableListOperator}>
              <Button icon="plus" type="primary" onClick={() => this.handleModalVisible(true)}>
                新建
              </Button>
              {selectedRows.length > 0 && (
                <span>
                  <Button onClick={() => showConfirm(this.handleMenuClick)}>删除</Button>
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
        <CreateForm {...parentMethods} modalVisible={modalVisible} data={modifiedData} titleLength={titleLength} contentLength={contentLength} />
      </PageHeaderWrapper>
    );
  }
}
