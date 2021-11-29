import { Spin } from 'antd';
import { Chart, LineAdvance } from 'bizcharts';
import React, { Component } from 'react';
import { fetch } from '../../config/Util';

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
      .then(incomeExpenses => {
        this.setState({ incomeExpenses })
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
            />
          </Chart>
        </Spin>
      </div>
    )
  }
}

export default IncomeExpensesLineChart