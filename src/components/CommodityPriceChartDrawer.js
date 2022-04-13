import { Drawer, Spin } from 'antd';
import { Chart, Legend, LineAdvance } from 'bizcharts';
import React, { Component } from 'react';
import { fetch } from '../config/Util';

class AccountCommodityChartDrawer extends Component {

  state = {
    loading: false,
    commodityPrices: []
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && this.state.commodityPrices.length === 0) {
      this.queryCommodityPrices();
    }
  }

  queryCommodityPrices = () => {
    this.setState({ loading: true })
    fetch('/api/auth/stats/commodity/price')
      .then(prices => {
        const commodityPrices = []
        prices.forEach(price => {
          commodityPrices.push({
            date: price.date,
            commodity: price.commodity,
            value: Number(price.value),
          })
        })
        this.setState({ commodityPrices })
      }).finally(() => { this.setState({ loading: false }) })
  }

  render() {
    return (
      <Drawer
        title={<div style={{ fontSize: 14 }}><div>汇率曲线</div></div>}
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
            <Chart animate={false} padding={[10, 80, 80, 80]} autoFit height={400} data={this.state.commodityPrices} >
              <Legend
              />
              <LineAdvance
                point
                position="date*value"
                color="commodity"
              />
            </Chart>
          </Spin>
        </div>
      </Drawer>
    )
  }
}

export default AccountCommodityChartDrawer