import React, { Component } from 'react';
import { AccountBookOutlined, CloudUploadOutlined, EyeInvisibleOutlined, EyeOutlined, FormOutlined, FallOutlined, RiseOutlined, SmileOutlined } from '@ant-design/icons';

import Page from './base/Page';
import ThemeContext from '../context/ThemeContext';

import './styles/Event.css'
import { Button, Tabs, Timeline } from 'antd';
import dayjs from 'dayjs';
import AddEventDrawer from '../components/AddEventDrawer';
import { fetch } from '../config/Util';
import Loader from '../components/Loader';

class Event extends Component {

  theme = this.context.theme
  currentMonth = dayjs().format('YYYY-M')
  eventTypeList = []
  eventTypes = []

  state = {
    loading: false,
    events: [],
    selectedMonth: this.currentMonth,
    drawerOpen: false,
  }

  componentDidMount() {
    this.getAllEvents()
  }

  handleOpenAddrawer = () => {
    this.setState({ drawerOpen: true })
  }

  handleCloseAddDrawer = (values) => {
    if (values && values instanceof Array) {
      this.setState({ events: [...this.state.events, ...values] }, () => {
        this.formatEventTypeList(this.state.events)
      })
    }
    this.setState({ drawerOpen: false })
  }

  formatEventTypeList = (events) => {
    const temp = {}
    events.forEach(({ date, type, description }) => {
      if (temp[type]) {
        temp[type].push({ date, type, description })
      } else {
        temp[type] = [{ date, type, description }]
      }
    })

    this.eventTypeList = []
    this.eventTypes = Object.keys(temp).sort()
    this.eventTypes.forEach(type => {
      this.eventTypeList.push({
        type,
        events: temp[type] || []
      })
    })
  }

  getAllEvents = () => {
    this.setState({ loading: true })
    fetch(`/api/auth/event/all`)
      .then(res => {
        this.setState({ events: res }, () => {
          this.formatEventTypeList(res)
        })
      }).catch(console.error)
      .finally(() => { this.setState({ loading: false }) })
  }

  render() {
    if (this.context.theme !== this.theme) {
      this.theme = this.context.theme
    }

    return (
      <div className="event-page">
        <AddEventDrawer open={this.state.drawerOpen} types={this.eventTypes} onClose={this.handleCloseAddDrawer} />
        <div className="top-wrapper">
          <div>
            <Button size="small" icon={<SmileOutlined />} onClick={this.handleOpenAddrawer}>记录事件</Button>
          </div>
        </div>
        <div>
          {
            this.state.loading ? <Loader /> :
              <Tabs
                defaultActiveKey="1"
                // onChange={onChange}
                items={
                  this.eventTypeList.map(({ type, events }) => ({
                    label: type,
                    key: type,
                    children:
                      <Timeline>
                        {
                          events.map(({ date, description }) => <Timeline.Item>{description}<span style={{ fontSize: '12px', marginLeft: '10px', color: 'gray' }}>{date}</span></Timeline.Item>)
                        }
                      </Timeline>
                  }))}
              />
          }
        </div>
      </div>
    );
  }
}

Event.contextType = ThemeContext

export default Page(Event);
