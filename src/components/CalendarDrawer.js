import { Calendar, Drawer, Spin } from 'antd';
import dayjs from 'dayjs';
import React, { Component } from 'react';
import { fetch, formatCurrency } from '../config/Util';
import MonthSelector from './MonthSelector';
import './styles/CalendarDrawer.css';

class CalendarDrawer extends Component {

  cache = {};

  state = {
    calendarData: [],
    loading: false,
    selectedMonth: this.props.month
  }

  componentDidMount() {
    const dayjsInstance = this.getCurrentMonth();
    this.queryTransactionList(dayjsInstance.year(), dayjsInstance.month() + 1);
  }

  getCurrentMonth = () => {
    let dayjsInstance;
    if (this.state.selectedMonth) {
      dayjsInstance = dayjs(this.state.selectedMonth)
    } else {
      dayjsInstance = dayjs()
    }
    return dayjsInstance;
  }

  queryTransactionList = (year, month) => {
    if (Object.keys(this.cache).includes(`${year}-${month}`)) {
      this.setState({
        calendarData: this.cache[`${year}-${month}`]
      })
      return
    }
    this.setState({ loading: true })
    fetch(`/api/auth/stats/month/calendar?year=${year}&month=${month}`)
      .then(calendarData => {
        this.cache[`${year}-${month}`] = calendarData;
        this.setState({ calendarData })
      }).catch(console.error).finally(() => { this.setState({ loading: false }) })
  }

  handleChangeMonth = (value) => {
    this.setState({ selectedMonth: value.format('yyyy-M') }, () => {
      this.queryTransactionList(value.year(), value.month() + 1);
    })
  };

  getListData = (value) => {
    return this.state.calendarData.filter(data => {
      var date = dayjs(data.date);
      return date.year() === value.year() && date.month() + 1 === value.month() + 1 && date.date() === value.date()
    })
  };

  dateCellRender = (value) => {
    // 年份和月份不同，则不进行渲染
    const dayjsInstance = this.getCurrentMonth()
    if (dayjsInstance.year() !== value.year() || dayjsInstance.month() !== value.month()) {
      return <div onClick={(e) => { e.stopPropagation(); }} style={{ height: '100px', cursor: 'default' }}></div>;
    }
    const listData = this.getListData(value);
    return (
      <div className="date-cell">
        <div className='date'>{value.date()}</div>
        {listData.map((item, idx) => (
          <div key={idx}>
            {
              item.account === 'Expenses' &&
              <span className='expenses'>{formatCurrency(item.amount, this.props.commodity, 'Expenses')}</span>
            }
            {
              item.account === 'Income' &&
              <span className='income'>{formatCurrency(item.amount, this.props.commodity, 'Income')}</span>
            }
          </div>
        ))}
      </div>
    );
  }

  render() {
    return (
      <Drawer
        title={<div style={{ fontSize: 14 }}><div>账单日历</div></div>}
        placement="bottom"
        closable={true}
        className="calendar-drawer"
        height="700px"
        bodyStyle={{ display: 'flex', justifyContent: 'center' }}
        {
        ...this.props
        }
      >
        <Spin spinning={this.state.loading}>
          <Calendar
            className='calendar'
            fullscreen={false}
            onChange={this.handleChangeMonth}
            dateFullCellRender={this.dateCellRender}
            headerRender={({ value, onChange }) => (
              <div style={{ padding: 8, textAlign: 'center' }}>
                <MonthSelector value={this.state.selectedMonth} onlyShowMonth={true} onChange={(month) => {
                  const newValue = value.clone();
                  newValue.year(dayjs(month).year());
                  newValue.month(dayjs(month).month());
                  onChange(newValue);
                }} />
              </div>
            )}
          />
        </Spin>
      </Drawer>
    )
  }
}

export default CalendarDrawer;