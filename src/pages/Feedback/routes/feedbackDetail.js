import React, { PureComponent } from 'react'
import { connect } from 'dva'
import { Table, Card, Col, Row, Button, Radio, Input, Form, message, Modal } from 'antd'
import moment from 'moment'
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './index.less';
import { getPageQuery } from '@/utils/utils'


const RadioGroup = Radio.Group
const {TextArea} = Input;

const CreateForm = Form.create()(props => {
  const {
    onSave, onCancel, handleModalVisible, handleTextareaChange, modalVisible, editMemo, contentLength
  } = props;
  const okHandle = () => {
    onSave(editMemo)
  };
  const cancelHandle = () => {
    onCancel()
    return handleModalVisible();
  };

  return (
    <Modal
      title="编辑备注"
      visible={modalVisible}
      width="50%"
      okText="保存"
      onOk={okHandle}
      onCancel={cancelHandle}
      footer={[
        <div style={{width:'100%',textAlign:'left'}}>
          <Button key="submit" type="primary" onClick={okHandle}>
            保存
          </Button>
        </div>,
      ]}
    >
      <TextArea placeholder="写下对本条反馈处理记录..." value={editMemo} onChange={(e) => handleTextareaChange(e)} autosize={{minRows: 5, maxRows: 25}}
                maxLength='1000' style={{display: 'block', resize: 'none', width: '100%', paddingBottom: '20px'}}/>
      <div style={{position: 'relative'}}>
        <span style={{position: 'absolute', right: 10, bottom: 0}}>{contentLength}/1000</span>
      </div>
    </Modal>
  );
})

@connect(({feedback, loading}) => ({
  feedback,
  loading: loading.effects['feedback/detail'],
}))
@Form.create()
export default class FeedbackDetail extends PureComponent {
  state = {
    modalVisible: false,
    status: 0,
    memo: '',
    editMemo: '',
    prevId: 1,
    contentLength: 0,
  }
  componentDidMount() {
    const { dispatch, match } = this.props;
    console.log(match)
    const params = getPageQuery()
    let id = params.id
    dispatch({
      type: 'feedback/detail',
      payload: {id: id},
      callback:(res) => {
        this.setState({
          prevId: id,
          status: res.status,
          memo: res.memo || '',
          editMemo: res.memo || '',
        })
      },
    })
  }
  componentWillUnmount() {

  }

  onChange = (e) => {
    this.setState({
      status: e.target.value,
    });
  }

  onSave = (editMemo) => {
    console.log(editMemo)
    this.setState({modalVisible: false, memo: editMemo});
  }

  onCancel = () => {
    const {memo} = this.state
    this.setState({editMemo: memo, contentLength: 0});
  }

  handleModalVisible = (flag) => {
    const {memo} = this.state
    let modalVisible = !!flag
    let contentLength = 0
    if (modalVisible) contentLength = memo.length
    this.setState({modalVisible, contentLength});
  };

  handleTextareaChange = (e) => {
    this.setState({editMemo:e.target.value, contentLength: e.target.value.length})
  }

  handleSave = () => {
    const { dispatch, match } = this.props;
    const {status, memo} = this.state
    dispatch({
      type: 'feedback/update',
      payload: {id: match.params.id, status, memo},
    })
  }

  handlePrev = () => {
    const { dispatch } = this.props;
    const {prevId} = this.state
    dispatch({
      type: 'feedback/prev',
      payload: {id: prevId},
      callback:(res) => {
        this.setState({
          prevId: res.id,
        })
      },
    })
  }

  render () {
    const {feedback: model} = this.props
    const {status, memo, editMemo, modalVisible, contentLength} = this.state
    const {item, data} = model
    if (!item.user) item.user = {}
    let gender = '未设置'
    if (item.user.gender == 1) gender = '男'
    if (item.user.gender == 2) gender = '女'
    let role = '无'
    if (item.user.role === 'patient') role = '患者'
    if (item.user.role === 'doctor') role = '医生'
    if (item.user.role === 'agent') role = 'BD'
    if (item.user.role === 'admin') role = '管理员'
    let type = '我的'
    if (item.type == 1) type = '我的'
    if (item.type == 2) type = '问诊结束'

    const parentMethods = {
      onSave: this.onSave,
      onCancel: this.onCancel,
      handleModalVisible: this.handleModalVisible,
      handleTextareaChange: this.handleTextareaChange
    };

    return (
      <PageHeaderWrapper title="反馈详情">
        <Card bordered={false}>
          <Row gutter={16}>
            <Row gutter={16} type="flex" justify="start">
              <Col span={3}><div className={styles.term}>{`角色`}</div><div className={styles.detail}>{role}</div></Col>
              <Col span={3}><div className={styles.term}>{`姓名`}</div><div className={styles.detail}>{item.user.name || ''}</div></Col>
              <Col span={3}><div className={styles.term}>{`年龄`}</div><div className={styles.detail}>{item.user.age || '未设置'}</div></Col>
              <Col span={3}><div className={styles.term}>{`性别`}</div><div className={styles.detail}>{gender}</div></Col>
            </Row>
            <Row gutter={16} type="flex" justify="start">
              <Col span={5}><div className={styles.term}>{`反馈时间`}</div><div className={styles.detail}>{moment(item.created_at).format('YYYY-MM-DD HH:mm')}</div></Col>
              <Col span={5}><div className={styles.term}>{`反馈入口`}</div><div className={styles.detail}>{type}</div></Col>
              <Col span={5}><div className={styles.term}>{`问诊医生`}</div><div className={styles.detail}>{item.target ? item.target.name : '无'}</div></Col>
            </Row>
            <Row gutter={16}>
              <Col><div className={styles.term}>{`反馈内容`}</div><div className={styles.detail}>{item.content || ''}</div></Col>
            </Row>
            <Row gutter={16}>
              <Col>
                <span className={styles.term}>{`处理状态`}</span>
                <div className={styles.detail}>
                  <RadioGroup onChange={this.onChange} value={status}>
                    <Radio value={0}>未处理</Radio>
                    <Radio value={1}>已处理</Radio>
                  </RadioGroup>
                </div>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col>
                <span className={styles.term}>{`备注`}</span>
                <div className={styles.detail}>
                  <Button onClick={() => this.handleModalVisible(true)}>编辑</Button>
                </div>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col style={{minHeight: '100px'}}><div className={styles.detail} style={{color:'rgba(0, 0, 0, 0.85)'}}>{memo || '无'}</div></Col>
            </Row>
            <Row>
              <Button type="primary" icon="save" onClick={() => this.handleSave()}>保存</Button>
              <Button style={{marginLeft: '50px'}} onClick={() => this.handlePrev()}>上一条</Button>
            </Row>
          </Row>
        </Card>
        <CreateForm {...parentMethods} modalVisible={modalVisible} editMemo={editMemo} contentLength={contentLength}/>
      </PageHeaderWrapper>
    )
  }
}
