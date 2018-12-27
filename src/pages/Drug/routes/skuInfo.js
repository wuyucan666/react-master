import React, { PureComponent } from 'react'
import { connect } from 'dva'
import {
  Form,
  Input,
  Select,
  Button,
  Card,
  Tag,
  AutoComplete,
  Radio,
  Icon,
  Tooltip,
  Modal,
} from 'antd'
import router from 'umi/router';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './index.less';
import classNames from 'classnames';
import { getPageQuery } from '../../../utils/utils';

const FormItem = Form.Item;
const {Option} = Select;
const {TextArea} = Input;
const {CheckableTag} = Tag;
const confirm = Modal.confirm


@connect(({sku, loading}) => ({
  sku,
}))
@Form.create()
export default class SkuInfo extends PureComponent {
  state = {
    editState: {},
    isDel: false,
    skuId: '',
    strLength: {},
    cacheUsage: [],
    cacheUsageAmount: [],
  }
  componentDidMount() {
    const self = this
    const { dispatch, match } = this.props
    const params = getPageQuery()
    let isDel = false
    let skuId = params.id
    if (params.del) {
      isDel = !!params.del
    }
    this.setState({isDel, skuId})
    dispatch({
      type: 'sku/get',
      payload: {id: skuId},
      callback: function (info) {
        if (!isDel) {
          self.handleAddTagsOption(info)
          self.refreshStrLength(info)
        }
      }
    })
  }
  componentWillUnmount() {

  }

  refreshStrLength = (info, field) => {
    const {strLength} = this.state
    const spu = info.spu || {}
    const brand = spu.brand || ''
    const cadn = spu.cadn || ''
    const factory = spu.factory || ''
    const spec = info.spec || ''
    const instruction = spu.instruction || ''
    if (field) {
      spu.spec = spec
      const str = spu[field] || ''
      strLength[field] = str.length
    } else {
      strLength['brand'] = brand.length
      strLength['cadn'] = cadn.length
      strLength['factory'] = factory.length
      strLength['spec'] = spec.length
      strLength['instruction'] = instruction.length
    }
    const newObj = Object.assign({}, strLength)
    this.setState({strLength: newObj})
  }

  handleAutoCompleteSearch = (field, value) => {
    if (value && value.length > 50) return
    const { dispatch } = this.props
    dispatch({
      type: 'sku/autoComplete',
      payload: {type: field, keyword: value},
    })
  }

  handleEditEnter = (field) => {
    const { dispatch, form } = this.props
    const {skuId, isDel} = this.state
    if (form.getFieldError(field)) return
    const formData = form.getFieldsValue()
    console.log(formData[field])
    this.handleCancelEditState(field)
    let payload = {id: skuId}
    payload[field] = formData[field]
    dispatch({
      type: 'sku/update',
      payload,
      callback: (info) => {
        if (!isDel) {
          this.refreshStrLength(info, field)
        }
      }
    })
  }

  handleEditState = (itemName) => {
    const {editState, isDel} = this.state
    if (isDel) return
    editState[itemName] = true
    const newObj = Object.assign({}, editState)
    this.setState({editState: newObj})
  }

  handleCancelEditState = (itemName) => {
    const { sku: model } = this.props;
    const {editState} = this.state
    editState[itemName] = false
    const newObj = Object.assign({}, editState)
    this.setState({editState: newObj})
    this.refreshStrLength(model.info, itemName)
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

  handleDelete = () => {
    const {dispatch} = this.props;
    const {skuId} = this.state
    confirm({
      title: '确定要删除此SKU?',
      content: '删除后，可在"已删除的SKU"恢复',
      okText: '确定',
      cancelText: '取消',
      onOk() {
        dispatch({
          type: 'sku/remove',
          payload: {id:skuId},
          callback: () => {
            router.push(`/drug/sku/skuList`);
          }
        })
      },
      onCancel() {
      },
    })
  }

  handleAddTagsOption = (info) => {
    const {cacheUsageAmount, cacheUsage} = this.state
    if (info.usage_amount) {
      info.usage_amount.forEach((item) => {
        cacheUsageAmount.push(<Option key={item}>{item}</Option>)
      })
    }
    if (info.usage) {
      info.usage.forEach((item) => {
        cacheUsage.push(<Option key={item}>{item}</Option>)
      })
    }
    this.setState({cacheUsageAmount, cacheUsage})
  }

  handleUsageAmountChange = (value) => {
    const {cacheUsageAmount} = this.state
    let option = <Option key={value}>{value}</Option>
    for (let elem of cacheUsageAmount.values()) {
      if (elem.key === option.key) return
    }
    cacheUsageAmount.push(option)
    this.setState({cacheUsageAmount})
  }

  handleUsageChange = (value) => {
    const {cacheUsage} = this.state
    let option = <Option key={value}>{value}</Option>
    for (let elem of cacheUsage.values()) {
      if (elem.key === option.key) return
    }
    cacheUsage.push(option)
    this.setState({cacheUsage})
  }

  render () {
    const { sku: model, form } = this.props;
    const { getFieldDecorator } = form;
    const {editState, skuId, isDel, strLength, cacheUsage, cacheUsageAmount} = this.state
    const {info, autoData} = model
    const skuIdStr = 'SKU-' + skuId.toString().padStart(8, '0')
    const spu = info.spu || {}
    const brand = spu.brand || ''
    const cadn = spu.cadn || ''
    const factory = spu.factory || ''
    const spec = info.spec || ''
    const instruction = spu.instruction || ''
    const usage_amount = info.usage_amount || []
    const usage = info.usage || []
    const autoDataSource = autoData.rows || []

    const action = (
      !isDel && <Button onClick={() => this.handleDelete()}>
        删除此SKU
      </Button>
    )

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

    return (
      <PageHeaderWrapper title={skuIdStr} action={action}>
        <Card bordered={false}>
          <Form hideRequiredMark style={{ marginTop: 8 }}>
            <FormItem {...formItemLayout} label={
              <span>
                  SKU编号
                  <em className={styles.optional}>
                    <Tooltip title="SKU编号是由系统自动生成的8位编号, 不能手动修改">
                      <Icon type="info-circle-o" style={{ marginRight: 4 }} />
                    </Tooltip>
                  </em>
                </span>
            }>
              <span className="ant-form-text">{skuIdStr}</span>
            </FormItem>
            <FormItem {...formItemLayout} label="通用名">
              {
                !editState["cadn"] ?
                  <Tooltip title={!isDel&&"点击可编辑"}>
                    <span className="ant-form-text" style={{whiteSpace:'pre'}} onClick={() => this.handleEditState('cadn')}>{cadn}</span>
                  </Tooltip>
                  :
                  <span>
                    {getFieldDecorator('cadn', {
                      rules: [
                        {required: true, message: '请输入通用名'},
                        {max: 50, message: '不能超过最大字符数'},
                        {whitespace: true, message: '不能输入纯空格字符'},
                      ],
                      initialValue: cadn || '',
                    })(
                      <AutoComplete
                      dataSource={autoDataSource}
                      onBlur={(value) => this.handleAutoCompleteSearch('cadn', value) }
                      onSearch={(value) => this.handleAutoCompleteSearch('cadn', value)}
                      onFocus={() => this.handleAutoCompleteSearch('cadn')}
                      onChange={(value) => this.handleInputChange(value, 'cadn')}
                      placeholder="请输入通用名"
                      className={styles.autoCompleteFontSize}
                      />
                    )}
                    <span style={{position: 'absolute', right: 10 }}>{strLength['cadn'] || 0}/50
                      <span style={{position: 'absolute', width: '150px', marginLeft: 20}}>
                        <Button type="primary" htmlType="submit" onClick={() => this.handleEditEnter('cadn')}>确定</Button>
                        <Button style={{ marginLeft: 15 }} onClick={() => this.handleCancelEditState('cadn')}>取消</Button>
                      </span>
                    </span>
                  </span>
              }
            </FormItem>
            <FormItem {...formItemLayout} label="品牌">
              {
                !editState["brand"] ?
                  <Tooltip title={!isDel&&"点击可编辑"}>
                    <span className="ant-form-text" style={{whiteSpace:'pre'}} onClick={() => this.handleEditState('brand')}>{brand}</span>
                  </Tooltip>
                  :
                  <span>
                    {getFieldDecorator('brand', {
                      rules: [
                        {required: true, message: '请输入品牌',},
                        {max: 50, message: '不能超过最大字符数'},
                        {whitespace: true, message: '不能输入纯空格字符'},
                      ],
                      initialValue: brand || '',
                    })(
                      <AutoComplete
                      dataSource={autoDataSource}
                      onBlur={(value) => this.handleAutoCompleteSearch('brand', value) }
                      onSearch={(value) => this.handleAutoCompleteSearch('brand', value)}
                      onFocus={() => this.handleAutoCompleteSearch('brand')}
                      onChange={(value) => this.handleInputChange(value, 'brand')}
                      placeholder="请输入品牌名"
                      className={styles.autoCompleteFontSize}
                      />
                    )}
                    <span style={{position: 'absolute', right: 10}}>{strLength['brand'] || 0}/50
                      <span style={{position: 'absolute', width: '150px', marginLeft: 20}}>
                        <Button type="primary" htmlType="submit" onClick={() => this.handleEditEnter('brand')}>确定</Button>
                        <Button style={{ marginLeft: 15 }} onClick={() => this.handleCancelEditState('brand')}>取消</Button>
                      </span>
                    </span>
                  </span>
              }
            </FormItem>
            <FormItem {...formItemLayout} label="厂家">
              {
                !editState["factory"] ?
                  <Tooltip title={!isDel&&"点击可编辑"}>
                    <span className="ant-form-text" style={{whiteSpace:'pre'}} onClick={() => this.handleEditState('factory')}>{factory}</span>
                  </Tooltip>
                  :
                  <span>
                    {getFieldDecorator('factory', {
                      rules: [
                        {required: true, message: '请输入厂家',},
                        {max: 50, message: '不能超过最大字符数'},
                        {whitespace: true, message: '不能输入纯空格字符'},
                      ],
                      initialValue: factory || '',
                    })(
                      <AutoComplete
                      dataSource={autoDataSource}
                      onBlur={(value) => this.handleAutoCompleteSearch('factory', value) }
                      onSearch={(value) => this.handleAutoCompleteSearch('factory', value)}
                      onFocus={() => this.handleAutoCompleteSearch('factory')}
                      onChange={(value) => this.handleInputChange(value, 'factory')}
                      placeholder="请输入厂家名"
                      className={styles.autoCompleteFontSize}
                      />
                    )}
                    <span style={{position: 'absolute', right: 10}}>{strLength['factory'] || 0}/50
                      <span style={{position: 'absolute', width: '150px', marginLeft: 20}}>
                        <Button type="primary" htmlType="submit" onClick={() => this.handleEditEnter('factory')}>确定</Button>
                        <Button style={{ marginLeft: 15 }} onClick={() => this.handleCancelEditState('factory')}>取消</Button>
                      </span>
                    </span>
                  </span>
              }
            </FormItem>
            <FormItem {...formItemLayout} label="规格">
              {
                !editState["spec"] ?
                  <Tooltip title={!isDel&&"点击可编辑"}>
                    <span className="ant-form-text" style={{whiteSpace:'pre'}} onClick={() => this.handleEditState('spec')}>{spec}</span>
                  </Tooltip>
                  :
                  <span>
                    {getFieldDecorator('spec', {
                      rules: [
                        {required: true, message: '请输入规格',},
                        {max: 50, message: '不能超过最大字符数'},
                        {whitespace: true, message: '不能输入纯空格字符'},
                      ],
                      initialValue: spec || '',
                    })(<Input style={{paddingRight: '50px'}} maxLength="50" placeholder="请输入规格" onChange={(value) => this.handleInputChange(value, 'spec')}/>)}
                    <span style={{position: 'absolute', right: 10}}>{strLength['spec'] || 0}/50
                      <span style={{position: 'absolute', width: '150px', marginLeft: 20}}>
                        <Button type="primary" htmlType="submit" onClick={() => this.handleEditEnter('spec')}>确定</Button>
                        <Button style={{ marginLeft: 15 }} onClick={() => this.handleCancelEditState('spec')}>取消</Button>
                      </span>
                    </span>
                  </span>
              }
            </FormItem>
            <FormItem {...formItemLayout} label={
              <span>
                  说明书用法用量
                  <em className={styles.optional}>
                    <Tooltip title="此字段用于医生端修改用法页面的辅助说明">
                      <Icon type="info-circle-o" style={{ marginRight: 4 }} />
                    </Tooltip>
                  </em>
                </span>
            }>
              {
                !editState["instruction"] ?
                  <Tooltip title={!isDel&&"点击可编辑"}>
                    <span className="ant-form-text" style={{whiteSpace: 'pre-wrap'}} onClick={() => this.handleEditState('instruction')}>{instruction || '无'}</span>
                  </Tooltip>
                  :
                  <span>
                    {getFieldDecorator('instruction', {
                      rules: [
                        {required: true, message: '请输入说明书用法用量',},
                        {max: 1000, message: '不能超过最大字符数'},
                        {whitespace: true, message: '不能输入纯空格字符'},
                      ],
                      initialValue: instruction || '',
                    })(
                      <TextArea style={{display: 'block', resize: 'none', width: '100%', paddingBottom: '20px'}}
                                placeholder="请输入说明书参考用法用量" autosize={{minRows: 1, maxRows: 35}} maxLength='1000'
                                onChange={(value) => this.handleInputChange(value, 'instruction')}/>
                    )}
                    <div style={{position: 'relative', height: 15}}>
                      <span style={{position: 'absolute', right: 10, bottom: 8}}>{strLength['instruction'] || 0}/1000
                        <span style={{position: 'absolute', width: '150px', right: -17, marginTop: 33}}>
                          <Button type="primary" htmlType="submit" onClick={() => this.handleEditEnter('instruction')}>确定</Button>
                          <Button style={{ marginLeft: 15 }} onClick={() => this.handleCancelEditState('instruction')}>取消</Button>
                        </span>
                      </span>
                    </div>
                  </span>
              }
            </FormItem>
            <FormItem {...formItemLayout} label={
              <span>
                  可选用量
                  <em className={styles.optional}>
                    <Tooltip title="此字段用于配置医生端修改用量的可选项">
                      <Icon type="info-circle-o" style={{ marginRight: 4 }} />
                    </Tooltip>
                  </em>
                </span>
            }>
              {
                !editState["usage_amount"] ?
                  <Tooltip title={!isDel&&"点击可编辑"}>
                    <span className="ant-form-text" onClick={() => this.handleEditState('usage_amount')}>
                      {usage_amount.map((item, index) => (
                        <CheckableTag key={index} style={{borderColor: '#d9d9d9'}}>
                          {item}
                        </CheckableTag>
                      ))}
                    </span>
                  </Tooltip>
                  :
                  <span>
                    {getFieldDecorator('usage_amount', {
                      rules: [
                        {required: true, message: '请输入可选用量',},
                        {
                          validator: function (rule, value, callback) {
                            if (!value) return callback(false)
                            if (value.length > 10){
                              rule.message ='标签数量不得超过10个'
                              return callback(false)
                            }
                            let v = value[value.length-1] || ''
                            v = v.trim()
                            if (!v.length) return callback(false)
                            if (v.length < 1 || v.length > 20) return callback('每个标签不得超过20个字')
                            callback()
                          },
                        }
                      ],
                      initialValue: usage_amount || [],
                    })(<Select
                      mode="tags"
                      style={{ width: '100%' }}
                      placeholder="请输入可选的医嘱用量"
                      onSelect={this.handleUsageAmountChange}
                    >
                      {cacheUsageAmount}
                    </Select>)}
                    <span style={{position: 'absolute', width: '150px', marginLeft: 10}}>
                        <Button type="primary" htmlType="submit" onClick={() => this.handleEditEnter('usage_amount')}>确定</Button>
                        <Button style={{ marginLeft: 15 }} onClick={() => this.handleCancelEditState('usage_amount')}>取消</Button>
                    </span>
                  </span>
              }
            </FormItem>
            <FormItem {...formItemLayout} label={
              <span>
                  可选用法
                  <em className={styles.optional}>
                    <Tooltip title="此字段用于配置医生端修改用法的可选项">
                      <Icon type="info-circle-o" style={{ marginRight: 4 }} />
                    </Tooltip>
                  </em>
                </span>
            }>
              {
                !editState["usage"] ?
                  <Tooltip title={!isDel&&"点击可编辑"}>
                    <span className="ant-form-text" onClick={() => this.handleEditState('usage')}>
                      {usage.map((item, index) => (
                        <CheckableTag key={index} style={{borderColor: '#d9d9d9'}}>
                          {item}
                        </CheckableTag>
                      ))}
                    </span>
                  </Tooltip>
                  :
                  <span>
                    {getFieldDecorator('usage', {
                      rules: [
                        {required: true, message: '请输入可选用法',},
                        {
                          validator: function (rule, value, callback) {
                            if (!value) return callback(false)
                            if (value.length > 10){
                              rule.message ='标签数量不得超过10个'
                              return callback(false)
                            }
                            let v = value[value.length-1] || ''
                            v = v.trim()
                            if (!v.length) return callback(false)
                            if (v.length < 1 || v.length > 20) return callback('每个标签不得超过20个字')
                            callback()
                          },
                        }
                      ],
                      initialValue: usage || [],
                    })(<Select
                      mode="tags"
                      style={{ width: '100%' }}
                      placeholder="请输入可选的医嘱用法"
                      onSelect={this.handleUsageChange}
                    >
                      {cacheUsage}
                    </Select>)}
                    <span style={{position: 'absolute', width: '150px', marginLeft: 10}}>
                        <Button type="primary" htmlType="submit" onClick={() => this.handleEditEnter('usage')}>确定</Button>
                        <Button style={{ marginLeft: 15 }} onClick={() => this.handleCancelEditState('usage')}>取消</Button>
                    </span>
                  </span>
              }
            </FormItem>
          </Form>
        </Card>
      </PageHeaderWrapper>
    )
  }
}
