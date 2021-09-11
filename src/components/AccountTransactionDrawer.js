import { FallOutlined, RiseOutlined } from '@ant-design/icons';
import { Drawer, List, Tag } from 'antd';
import { Component, Fragment } from 'react';
import { fetch, getAccountIcon } from '../config/Util';
import AccountAmount from './AccountAmount';
import AccountIcon from './AccountIcon';

class AccountTransactionDrawer extends Component {

  state = {
    transactions: [],
    loading: false,
  }

  componentDidMount() {
    if (this.props.account) {
      this.handleQueryAccountTransaction(this.props.account)
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.account !== nextProps.account) {
      this.handleQueryAccountTransaction(nextProps.account)
    }
  }

  handleQueryAccountTransaction = (account) => {
    this.setState({ loading: true })
    fetch(`/api/auth/account/transaction?account=${account}`)
      .then(transactions => {
        this.setState({ transactions })
      }).catch(console.error).finally(() => { this.setState({ loading: false }) })
  }

  render() {
    const editAccount = this.props.account
    const { transactions, loading } = this.state
    return (
      <Drawer
        title={<div style={{ fontSize: 14 }}><div>{editAccount}</div><div>最近{transactions.length}条交易记录</div></div>}
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
                  actions={[
                    item.amount ? AccountAmount(editAccount, item.amount, item.commoditySymbol, item.commodity) : ''
                  ]}
                >
                  <List.Item.Meta
                    avatar={<AccountIcon iconType={getAccountIcon(editAccount)} />}
                    title={item.desc}
                    description={
                      <div>
                        <span>{item.date}&nbsp;{item.payee}&nbsp;{item.commodity}</span>
                        {
                          isInvestAccount &&
                          <div style={{ marginTop: '13px' }}>
                            {
                              isSale ?
                                <Fragment>
                                  <Tag>持仓: {item.costPrice} / {AccountAmount(editAccount, costAmount, item.costCommoditySymbol)}</Tag>
                                  <Tag>净值: {item.salePrice} / {AccountAmount(editAccount, saleAmount, item.saleCommoditySymbol)}</Tag>
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
                                  <Tag>持仓: {item.costPrice} / {AccountAmount(editAccount, costAmount, item.costCommoditySymbol)}</Tag>
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
        </div>
      </Drawer>
    )
  }
}


export default AccountTransactionDrawer