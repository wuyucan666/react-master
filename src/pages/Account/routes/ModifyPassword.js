import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Modal, Alert, message } from 'antd';
import CounterInput from '@/components/CounterInput';

const FormItem = Form.Item;
const maxInputLength = 20;
const minInputLength = 6;
const formContainer = {
  width: '80%',
  margin: '24px auto 0',
};

@connect(({ loading }) => ({
  loading: loading.effects['accountSettings/modifyPassword'],
}))
@Form.create()
class ModifyPassword extends PureComponent {
  passwordTypeValidate = (rule, value, callback) => {
    const pattern = /^[A-Za-z0-9]+$/;
    const tips = '仅可输入6-20位数字或大小写字母的组合';
    if (value && !pattern.test(value)) {
      callback(tips);
    } else if (value && value.length < minInputLength) {
      callback(tips);
    } else {
      callback();
    }
  };

  compareToNewPassword = (rule, value, callback) => {
    const { form } = this.props;
    if (value && value !== form.getFieldValue('newPassword')) {
      callback('两次输入的新密码不一致');
    } else {
      callback();
    }
  };

  compareToOriginPassword = (rule, value, callback) => {
    const { form } = this.props;
    if (value && value === form.getFieldValue('originPassword')) {
      callback('新密码不能与原密码相同');
    } else {
      callback();
    }
  };

  handleSubmitPassword = e => {
    e.preventDefault();
    const { form, dispatch } = this.props;
    form.validateFields(
      ['originPassword', 'newPassword', 'confirmPassword'],
      { firstFields: true },
      async (err, values) => {
        if(err) console.error(err)
        if (!err) {
          const { onCancel } = this.props;
          const { originPassword: oldPassword, newPassword: password } = values;
          const params = {
            oldPassword,
            password,
          };
          dispatch({
            type: 'accountSettings/modifyPassword',
            payload: {
              params,
            },
          }).then(data => {
            if (data.err === 2610) {
              form.setFields({
                originPassword: {
                  value: oldPassword,
                  errors: [new Error('与原密码不一致')],
                },
              });
            } else if (data.err) {
              message.error(data.msg);
            } else if (onCancel) {
              form.resetFields();
              onCancel();
              message.success('成功修改密码');
            }
          });
        }
      }
    );
  };

  cancelEditPassword = () => {
    const { onCancel, form } = this.props;
    form.resetFields();
    if (onCancel) {
      onCancel();
    }
  };

  render() {
    const { form, visible, loading } = this.props;
    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 20 },
      },
    };
    return (
      <Modal
        title="修改密码"
        width="80%"
        visible={visible}
        onOk={this.handleSubmitPassword}
        onCancel={this.cancelEditPassword}
        okButtonProps={{ loading }}
      >
        <Alert message="以下带*均为必填项" type="info" showIcon />
        <Form style={formContainer}>
          <FormItem {...formItemLayout} label="原密码">
            {getFieldDecorator('originPassword', {
              rules: [
                { required: true, message: '请输入原密码' },
                { validator: this.passwordTypeValidate },
              ],
              validateTrigger: '',
            })(
              <CounterInput placeholder="请输入原密码" type="password" maxLength={maxInputLength} />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="新密码">
            {getFieldDecorator('newPassword', {
              rules: [
                { required: true, message: '请输入新密码' },
                { validator: this.passwordTypeValidate },
                { validator: this.compareToOriginPassword },
              ],
              validateTrigger: '',
            })(
              <CounterInput placeholder="请输入新密码" type="password" maxLength={maxInputLength} />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="确认新密码">
            {getFieldDecorator('confirmPassword', {
              rules: [
                { required: true, message: '请再次输入新密码' },
                { validator: this.compareToNewPassword },
                { validator: this.compareToOriginPassword },
                { validator: this.passwordTypeValidate },
              ],
              validateTrigger: '',
            })(
              <CounterInput placeholder="请确认新密码" type="password" maxLength={maxInputLength} />
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

export default ModifyPassword;
