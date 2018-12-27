import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
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

@connect(({ order, loading }) => ({
  order,
  loading: loading.effects['order/getSupplyLogistics'],
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
        type: 'order/getSupplyLogistics',
        payload: {order_id: id},
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

