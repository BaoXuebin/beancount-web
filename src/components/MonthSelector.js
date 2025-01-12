import { Select } from 'antd';
import dayjs from 'dayjs';
import React, { Component } from 'react';
import { fetch } from '../config/Util';

class MonthSelector extends Component {

  currentYear = dayjs().format('YYYY')
  currentMonth = dayjs().format('YYYY-M')

  state = {
    loading: false,
    years: [this.currentYear],
    months: [this.currentMonth]
  }

  componentDidMount() {
    this.queryMonthList();
  }

  queryMonthList = () => {
    this.setState({ loading: true })
    fetch('/api/auth/stats/months')
      .then(months => {
        let years = Array.from(new Set(months.map(m => m.split('-')[0])))
        this.setState({ months: months || [], years: years || [] })
      }).catch(console.error).finally(() => { this.setState({ loading: false }) })
  }

  render() {
    return (
      <Select
        size="small"
        showSearch
        placeholder="选择月份"
        style={{ width: '120px' }}
        {
        ...this.props
        }
      >
        {
          !this.props.onlyShowMonth && <Select.Option value="">不限</Select.Option>
        }
        {
          !this.props.onlyShowMonth && this.state.years.map(year => <Select.Option key={year} value={year}>{dayjs(year).format('YYYY年')}</Select.Option>)
        }
        {
          this.state.months.map(month => <Select.Option key={month} value={month}>{dayjs(month).format('YYYY年MM月')}</Select.Option>)
        }
      </Select>
    )
  }
}

export default MonthSelector