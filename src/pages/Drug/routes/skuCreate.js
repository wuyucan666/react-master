import React, { PureComponent } from 'react'
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
  Icon,
  Tooltip,
} from 'antd'
import router from 'umi/router';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './index.less';

const FormItem = Form.Item;
const {TextArea} = Input;
const {Option} = Select;

@connect(({sku, loading}) => ({
  sku,
  submitting: loading.effects['sku/add'],
}))
@Form.create()
export default class SkuCreate extends PureComponent {
  state = {
    strLength: {},
    cacheUsage: [],
    cacheUsageAmount: [],
  }
  componentDidMount() {
    const { dispatch } = this.props;

  }
  componentWillUnmount() {

  }

  handleAutoCompleteSearch = (field, value) => {
    if (value && value.length > 50) return
    const { dispatch } = this.props
    dispatch({
      type: 'sku/autoComplete',
      payload: {type: field, keyword: value},
    })
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

  handleSubmit = e => {
    e.preventDefault();
    const { form, dispatch } = this.props;
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        dispatch({
          type: 'sku/add',
          payload: values,
          callback: (doc) => {
            this.handleListPage()
          }
        });
      }
    });
  }

  handleListPage = () => {
    router.push(`/drug/sku/skuList`);
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
    const { sku: model, submitting, form } = this.props;
    const { strLength, cacheUsageAmount, cacheUsage } = this.state
    const { getFieldDecorator } = form;
    const {autoData} = model
    const autoDataSource = autoData.rows || []

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

    return (
      <PageHeaderWrapper title="新建SKU">
        <Card bordered={false}>
          <Alert
            closable={false}
            showIcon
            message="以下各项均为必填项"
            style={{ marginBottom: 24 }}
          />
          <Form onSubmit={this.handleSubmit} hideRequiredMark style={{ marginTop: 8 }}>
            <FormItem {...formItemLayout} label="通用名">
              {getFieldDecorator('cadn', {
                rules: [
                  {required: true, message: '请输入通用名'},
                  {max: 50, message: '不能超过最大字符数'},
                  {whitespace: true, message: '不能输入纯空格字符'},
                ],
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
              <span style={{position: 'absolute', right: 10}}>{strLength['cadn'] || 0}/50</span>
            </FormItem>
            <FormItem {...formItemLayout} label="品牌">
              {getFieldDecorator('brand', {
                rules: [
                  {required: true, message: '请输入品牌',},
                  {max: 50, message: '不能超过最大字符数'},
                  {whitespace: true, message: '不能输入纯空格字符'},
                ],
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
              <span style={{position: 'absolute', right: 10}}>{strLength['brand'] || 0}/50</span>
            </FormItem>
            <FormItem {...formItemLayout} label="厂家">
              {getFieldDecorator('factory', {
                rules: [
                  {required: true, message: '请输入厂家',},
                  {max: 50, message: '不能超过最大字符数'},
                  {whitespace: true, message: '不能输入纯空格字符'},
                ],
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
              <span style={{position: 'absolute', right: 10}}>{strLength['factory'] || 0}/50</span>
            </FormItem>
            <FormItem {...formItemLayout} label="规格">
              {getFieldDecorator('spec', {
                rules: [
                  {required: true, message: '请输入规格',},
                  {max: 50, message: '不能超过最大字符数'},
                  {whitespace: true, message: '不能输入纯空格字符'},
                ],
              })(<Input style={{paddingRight: '50px'}} maxLength="50" placeholder="请输入规格" onChange={(value) => this.handleInputChange(value, 'spec')}/>)}
              <span style={{position: 'absolute', right: 10}}>{strLength['spec'] || 0}/50</span>
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
              {getFieldDecorator('instruction', {
                rules: [
                  {required: true, message: '请输入说明书用法用量',},
                  {max: 1000, message: '不能超过最大字符数'},
                  {whitespace: true, message: '不能输入纯空格字符'},
                ],
              })(
                <TextArea style={{display: 'block', resize: 'none', width: '100%', paddingBottom: '20px'}}
                          placeholder="请输入说明书参考用法用量" autosize={{minRows: 1, maxRows: 35}} maxLength='1000'
                          onChange={(value) => this.handleInputChange(value, 'instruction')}/>
              )}
              <div style={{position: 'relative'}}>
                <span style={{position: 'absolute', right: 10, bottom: -5}}>{strLength['instruction'] || 0}/1000</span>
              </div>
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
              })(<Select
                mode="tags"
                style={{ width: '100%' }}
                placeholder="请输入可选的医嘱用量"
                onSelect={this.handleUsageAmountChange}
              >
                {cacheUsageAmount}
              </Select>)}
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
              })(<Select
                mode="tags"
                style={{ width: '100%' }}
                placeholder="请输入可选的医嘱用法"
                onSelect={this.handleUsageChange}
              >
                {cacheUsage}
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
