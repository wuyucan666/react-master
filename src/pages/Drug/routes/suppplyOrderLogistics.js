import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import {
  Card,
  Row,
  Form,
  Image,
  message,
  Timeline,
} from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { getPageQuery } from '../../../utils/utils';

@connect(({ supplierOrder, loading }) => ({
  supplierOrder,
  loading: loading.effects['supplierOrder/logistics'],
}))
@Form.create()
export default class logistics extends React.Component {
  state = {
    data:{},
  };

  componentDidMount () {
    const {dispatch} = this.props
    const params = getPageQuery();
    const id = params.id
    if (!id) message.error('物流信息不足，无法查看物流详情')
    else {
      dispatch({
        type: 'supplierOrder/logistics',
        payload: {id},
        callback: (data) => {
          if (data.com) {
            this.setState({
              data,
            })
          }
        },
      })
    }
  }

  render() {
    const { data } = this.state
    data.data || (data.data = [])
    return (
      <PageHeaderWrapper title="物流详情">
        <Card bordered={false}>
          <Row>
            <Timeline>
              {data && (data.data.map((item,index) => {
                return(
                  <Timeline.Item key={`Item${index}`}>{`${item.content} ${item.time}`}</Timeline.Item>
                )
              }))}
            </Timeline>
          </Row>
        </Card>
      </PageHeaderWrapper>
    )
  }
}

