import { Cascader } from "antd"
import { useEffect, useState } from "react";
import { AccountTypeDict, defaultIfEmpty, fetch, getAccountCata, getAccountName } from "../config/Util";

let treeObj = {}
export default ({ value, onChange }) => {

  const [options, setOptions] = useState([]);
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    setAccounts(defaultIfEmpty(value, []).map(a => a.value))
  }, [value])

  useEffect(() => {
    // 初始化账户数据
    fetch('/api/auth/account/all')
      .then(accounts => {
        const options = []
        for (let accObj of accounts) {
          const account = accObj.account
          const rootType = { key: getAccountCata(account) }
          const secondType = accObj.type ? accObj.type : { type: accObj.account, name: getAccountName(accObj.account) }
          if (!treeObj[rootType.key]) {
            const node = {}
            node['children'] = [secondType]
            node[secondType.key] = {
              key: secondType.key,
              name: secondType.name,
              children: [accObj]
            }
            treeObj[rootType.key] = node
          } else {
            let secondTypeNode = treeObj[rootType.key][secondType.key]
            if (!secondTypeNode) {
              secondTypeNode = {
                key: secondType.key,
                name: secondType.name,
                children: [accObj]
              }
              treeObj[rootType.key].children.push(accObj.type)
              treeObj[rootType.key][secondType.key] = secondTypeNode
            } else {
              secondTypeNode.children.push(accObj)
            }
          }
        }
        const allRoot = ['Expenses', 'Income', 'Assets', 'Liabilities', 'Equity']
        for (let root of allRoot) {
          options.push({
            value: root,
            label: AccountTypeDict[root],
            children: ((treeObj[root] || {}).children || []).filter(sub => sub).map(sub => {
              const node = treeObj[root][sub.key]
              return {
                value: node.key,
                label: node.name,
                children: (node.children || []).map(acc => ({
                  label: getAccountName(acc.account),
                  value: acc.account
                })),
              }
            })
          })
        }
        setOptions(options)
      }).catch(console.error).finally(() => { })
  }, [])

  const handleChange = ([a, b, c]) => {
    const values = [
      { value: a, label: AccountTypeDict[a] },
      { value: b, label: (treeObj[a] && treeObj[a][b]) ? treeObj[a][b].name : b },
      { value: c, label: getAccountName(c) }
    ]
    localStorage.setItem('accounts', JSON.stringify(values))
    onChange(values)
  };

  const filter = (inputValue, path) =>
    path.some((option) => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);
    
  return (
    <Cascader value={accounts} style={{ width: '240px' }} size="small" options={options} onChange={handleChange} showSearch={{
      filter,
    }} placeholder="请选择" />
  )
}