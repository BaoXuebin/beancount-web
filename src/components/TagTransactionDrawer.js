import { FallOutlined, RiseOutlined } from '@ant-design/icons';
import { Drawer, List, Tag } from 'antd';
import { Component, Fragment } from 'react';
import { fetch, getAccountIcon } from '../config/Util';
import AccountAmount from './AccountAmount';
import AccountIcon from './AccountIcon';
import Decimal from 'decimal.js';

class TagTransactionDrawer extends Component {

  state = {
    transactions: [],
    loading: false,
  }

  componentDidMount() {
    if (this.props.tag) {
      this.handleQueryTagTransaction(this.props.tag)
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.tag !== nextProps.tag) {
      this.handleQueryTagTransaction(nextProps.tag)
    }
  }

  handleQueryTagTransaction = (tag) => {
    if (!tag) return;
    this.setState({ loading: true })
    fetch(`/api/auth/transaction?tag=${tag}`)
      .then(transactions => {
        const dict = {}
        transactions.forEach(t => {
          if (dict[t.id]) {
            dict[t.id].childs.push(t)
          } else {
            dict[t.id] = {
              date: t.date,
              payee: t.payee,
              desc: t.desc,
              tags: t.tags,
              childs: [t]
            }
          }
        })
        this.setState({ transactions: Object.values(dict) })
      }).catch(console.error).finally(() => { this.setState({ loading: false }) })
  }

  render() {
    const tag = this.props.tag
    const { transactions, loading } = this.state
    return (
      <Drawer
        title={<div style={{ fontSize: 14 }}><div>标签：{tag}</div><div>最近{transactions.length}条交易记录</div></div>}
        placement="bottom"
        closable={true}
        className="page-drawer"
        height="90vh"
        bodyStyle={{ display: 'flex', justifyContent: 'center' }}
        {
        ...this.props
        }
      >
        <div className="page-form">
          <List
            itemLayout="horizontal"
            loading={loading}
            dataSource={transactions}
            renderItem={item => {
              return (
                <List.Item>
                  <List.Item.Meta
                    title={item.desc}
                    description={
                      <Fragment>
                        <div>{item.tags.map(t => <a style={{ marginRight: '4px' }}>#{t}</a>)}</div>
                        <span>{item.date}&nbsp;{item.payee}</span>
                        <List
                          itemLayout="horizontal"
                          dataSource={item.childs}
                          renderItem={item => {
                            // 是否是投资账户
                            const isInvestAccount = item.costCurrency && (item.currency !== item.costCurrency)
                            const isSale = Boolean(item.price)
                            let costAmount
                            let investProfit
                            if (isInvestAccount) {
                              costAmount = Decimal(item.costPrice).mul(Decimal(item.number).abs())
                              if (isSale) {
                                investProfit = Decimal(item.price).sub(Decimal(item.costPrice)).mul(Decimal(item.number).abs())
                              }
                            }
                            return (
                              <List.Item
                                style={{ marginLeft: '40px' }}
                                actions={[
                                  item.number + " " + item.currency
                                ]}
                              >
                                <List.Item.Meta
                                  avatar={<AccountIcon iconType={getAccountIcon(item.account)} />}
                                  title={item.account}
                                  description={
                                    <div>
                                      {
                                        isInvestAccount &&
                                        <div style={{ marginTop: '13px' }}>
                                          {
                                            isSale ?
                                              <Fragment>
                                                <Tag>成本: {item.costPrice} ({item.costDate})</Tag>
                                                <Tag>确认净值: {item.price}</Tag>
                                                {
                                                  investProfit >= 0 ?
                                                    <Fragment>
                                                      <Tag icon={<RiseOutlined />} color="#f50">{(100 * Number(investProfit) / Number(costAmount)).toFixed(2)}%</Tag>
                                                      <Tag color="#f50">+{Math.abs(investProfit).toFixed(2)}</Tag>
                                                    </Fragment> :
                                                    <Fragment>
                                                      <Tag icon={<FallOutlined />} color="#1DA57A">{(100 * Number(investProfit) / Number(costAmount)).toFixed(2)}%</Tag>
                                                      <Tag color="#1DA57A">-{Math.abs(investProfit).toFixed(2)}</Tag>
                                                    </Fragment>
                                                }
                                              </Fragment> :
                                              <Fragment>
                                                <Tag>净值: {item.costPrice}</Tag>
                                              </Fragment>
                                          }
                                        </div>
                                      }
                                    </div>
                                  }
                                />
                              </List.Item>
                            )
                          }}
                        />
                      </Fragment>
                    }
                  />
                </List.Item>
              )
            }}
          />
        </div>
      </Drawer>
    )
  }
}


export default TagTransactionDrawer