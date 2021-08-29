import { Statistic } from 'antd'
import React from 'react'

const StatisticAmount = (props) => props.hide ? <Statistic {...props} value="***" prefix={props.hide ? '' : props.prefix} /> : <Statistic {...props} />

export default StatisticAmount