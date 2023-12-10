import { Avatar, Drawer, List, Skeleton, Spin } from 'antd';
import { Chart, Legend, LineAdvance } from 'bizcharts';
import React, { Component } from 'react';
import { fetch } from '../config/Util';

class MultiCommodityChartDrawer extends Component {

  state = {
    loading: false,
    currencies: []
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.visible) {
      this.queryCommodityCurrencies();
    }
  }

  queryCommodityCurrencies = () => {
    this.setState({ loading: true })
    fetch('/api/auth/commodity/currencies')
      .then(currencies => {
        this.setState({ currencies })
      }).finally(() => { this.setState({ loading: false }) })
  }

  render() {
    return (
      <Drawer
        title={<div style={{ fontSize: 14 }}><div>全部货币</div></div>}
        placement="bottom"
        closable={true}
        className="page-drawer"
        height="530px"
        bodyStyle={{ display: 'flex', justifyContent: 'center' }}
        {
        ...this.props
        }
      >
        <div className="page-form" style={{ maxWidth: '100%' }}>
          <Spin spinning={this.state.loading}>
            <List
              className="multi-commodity-list-component"
              loading={false}
              itemLayout="horizontal"
              dataSource={this.state.currencies}
              renderItem={(currency) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar style={{ color: '#f56a00', backgroundColor: '#fde3cf' }}>{currency.symbol}</Avatar>}
                    title={currency.name}
                    description={currency.price ? `1${currency.currency}=${currency.price}${this.props.sysCurrency} (${currency.priceDate})` : '汇率未定义'}
                  />
                </List.Item>
              )}
            />
          </Spin>
        </div>
      </Drawer>
    )
  }
}

export default MultiCommodityChartDrawer