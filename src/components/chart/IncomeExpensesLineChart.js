import { Spin } from 'antd';
import { Chart, LineAdvance } from 'bizcharts';
import React, { Component } from 'react';
import { fetch, formatCurrency, formatDate } from '../../config/Util';

class IncomeExpensesLineChart extends Component {

  state = {
    loading: false,
    incomeExpenses: []
  }

  componentDidMount() {
    this.queryMonthIncomeExpenses();
  }

  queryMonthIncomeExpenses = () => {
    this.setState({ loading: true })
    fetch('/api/auth/stats/month/total')
      .then(data => {
        if (data && data.length > 0) {
          data.forEach(item => {
            item.month = formatDate(item.month)
          })
        }
        this.setState({ incomeExpenses: data })
      }).finally(() => { this.setState({ loading: false }) })
  }

  render() {
    if (this.props.chartLoading) {
      return <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spin /></div>
    }
    return (
      <div>
        <Spin spinning={this.state.loading}>
          <Chart animate={false} padding={[10, 20, 80, 40]} autoFit height={400} data={this.state.incomeExpenses} >
            <LineAdvance
              shape="smooth"
              point
              area
              position="month*amount"
              color="type"
              tooltip={['month*type*amount', (month, type, amount) => {
                return {
                  title: month,
                  name: type,
                  value: formatCurrency(amount, this.props.commodity)
                }
              }]}
            />
          </Chart>
        </Spin>
      </div>
    )
  }
}

export default IncomeExpensesLineChart