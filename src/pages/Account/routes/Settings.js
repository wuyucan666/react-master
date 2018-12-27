import React, { PureComponent, Suspense } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import PageLoading from '@/components/PageLoading';
import { Card, Form, Button } from 'antd';
import ModifyPassword from './ModifyPassword'

// const ModifyPassword = React.lazy(() => import('./routes/ModifyPassword'));

const FormItem = Form.Item;

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 4 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 19, offset: 1 },
  },
};
const rightSide = {
  textAlign: 'right',
};
@connect(({ accountSettings }) => ({
  accountSettings,
}))
class AccountSettings extends PureComponent {
  state = {
    editPasswordVisible: false,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'accountSettings/fetchData',
    });
  }

  openEditPassword = () => {
    this.setState({
      editPasswordVisible: true,
    });
  };

  cancelEditPassword = () => {
    this.setState({
      editPasswordVisible: false,
    });
  };

  render() {
    const { currentUser } = this.props;
    const { editPasswordVisible } = this.state;
    return (
      <PageHeaderWrapper title={formatMessage({ id: 'menu.account.settings' })}>
        <Card title="基本信息" style={{ marginBottom: 24 }} bordered={false}>
          <Form>
            <FormItem {...formItemLayout} label={`帐号：${currentUser.name}`} colon={false}>
              <div style={rightSide}>
                <Button onClick={this.openEditPassword} size="small">
                  修改密码
                </Button>
              </div>
            </FormItem>
          </Form>
        </Card>
        <Suspense fallback={<PageLoading />}>
          <ModifyPassword
            title="修改密码"
            width="70%"
            visible={editPasswordVisible}
            onOk={this.handleSubmitPassword}
            onCancel={this.cancelEditPassword}
            {...this.props}
          />
        </Suspense>
      </PageHeaderWrapper>
    );
  }
}

export default connect(({ user }) => ({
  currentUser: user.currentUser
}))(AccountSettings);

// export default AccountSettings;
