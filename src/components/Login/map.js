import React from 'react';
import { Icon } from 'antd';
import styles from './index.less';

export default {
  UserName: {
    props: {
      size: 'large',
      prefix: <Icon type="user" className={styles.prefixIcon} />,
      placeholder: '账号',
    },
    rules: [
      {
        required: true,
        message: '请输入账号!',
      },
    ],
  },
  Password: {
    props: {
      size: 'large',
      prefix: <Icon type="lock" className={styles.prefixIcon} />,
      type: 'password',
      placeholder: '密码',
    },
    rules: [
      {
        required: true,
        message: '请输入密码!',
      },
    ],
  },
  Mobile: {
    props: {
      size: 'large',
      prefix: <Icon type="mobile" className={styles.prefixIcon} />,
      placeholder: '手机号码',
    },
    rules: [
      {
        required: true,
        message: '请输入手机号码!',
      },
      {
        pattern: /^1\d{10}$/,
        message: '手机号码格式错误!',
      },
    ],
  },
  Captcha: {
    props: {
      size: 'large',
      prefix: <Icon type="mail" className={styles.prefixIcon} />,
      placeholder: '验证码',
    },
    rules: [
      {
        required: true,
        message: '请输入验证码!',
      },
    ],
  },
};
