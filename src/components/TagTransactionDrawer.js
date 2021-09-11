import { FallOutlined, RiseOutlined } from '@ant-design/icons';
import { Drawer, List, Tag } from 'antd';
import { Component, Fragment } from 'react';
import { fetch, getAccountIcon } from '../config/Util';
import AccountAmount from './AccountAmount';
import AccountIcon from './AccountIcon';

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
                            const isInvestAccount = item.commodity !== item.costCommodity
                            const isSale = Boolean(item.saleAmount)
                            // 成本
                            const costAmount = isSale ? -item.costAmount : item.costAmount
                            // 售价
                            const saleAmount = isSale ? -item.saleAmount : item.saleAmount
                            // 收益
                            const investProfit = saleAmount - costAmount
                            return (
                              <List.Item
                                style={{ marginLeft: '40px' }}
                                actions={[
                                  item.amount + ' ' + item.commodity
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
                                                <Tag>持仓: {item.costPrice} / {AccountAmount(item.account, costAmount, item.costCommoditySymbol)}</Tag>
                                                <Tag>净值: {item.salePrice} / {AccountAmount(item.account, saleAmount, item.saleCommoditySymbol)}</Tag>
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
                                                <Tag>持仓: {item.costPrice} / {AccountAmount(item.account, costAmount, item.costCommoditySymbol)}</Tag>
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