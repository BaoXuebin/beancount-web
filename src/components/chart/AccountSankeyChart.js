import React, { useState, useEffect, Fragment, Component } from "react";
import {
  Chart,
  Geom,
  Axis,
  Tooltip,
  Legend,
  View,
  getTheme
} from "bizcharts";
import DataSet from "@antv/data-set";
import { AccountTypeDict, addAllSelector, defaultIfEmpty, fetch, formatCurrency, getAccountName } from "../../config/Util";
import { Segmented, Spin } from "antd";

const defaultAccount = [{ value: 'Assets', label: AccountTypeDict['Assets'] }]
const scale = {
  x: {
    sync: true,
  },
  y: {
    sync: true,
  },
};
const colors = getTheme().colors20;


class AccountSankeyChart extends Component {

  _ds = new DataSet();
  _nodeValues = {}

  state = {
    sankeyData: {
      nodes: [],
      links: []
    },
    dataView: {
      nodes: [],
      links: []
    },
    loading: false,
    accountPrefix: addAllSelector(defaultIfEmpty(this.props.selectedAccounts, defaultAccount))[0].value,
    level: ''
  }

  componentDidMount() {
    this.querySankeyData(this.props.selectedMonth)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedMonth !== this.props.selectedMonth) {
      this.querySankeyData(nextProps.selectedMonth)
    }
    if (nextProps.selectedAccounts !== this.props.selectedAccounts) {
      this.setState({ accountPrefix: addAllSelector(defaultIfEmpty(nextProps.selectedAccounts, defaultAccount))[0].value })
    }
  }

  querySankeyData = (selectedMonth) => {
    this.setState({ loading: true })
    const { accountPrefix, level } = this.state;
    let year, month;
    if (selectedMonth) {
      const yearAndMonth = selectedMonth.split('-').filter(a => a)
      if (yearAndMonth.length === 1) {
        year = yearAndMonth[0]
      } else if (yearAndMonth.length === 2) {
        year = yearAndMonth[0]
        month = yearAndMonth[1]
      }
    }
    fetch(`/api/auth/stats/account/flow?prefix=${accountPrefix}&year=${year || ''}&month=${month || ''}&level=${level}`)
      .then((sankeyData) => {
        if (sankeyData && sankeyData.links && sankeyData.links.length > 0) {
          this._nodeValues = {}
          const nodes = sankeyData.nodes
          for (let link of sankeyData.links) {
            this._nodeValues[nodes[link.source].name] = Number(this._nodeValues[nodes[link.source].name] || 0) + -1 * Number(link.value)
            this._nodeValues[nodes[link.target].name] = Number(this._nodeValues[nodes[link.target].name] || 0) + Number(link.value)
          }
          const dataView = this._ds.createView().source(sankeyData, {
            type: "graph",
            edges: (d) => d.links,
          });
          dataView.transform({
            type: 'diagram.sankey',
            sort: (a, b) => {
              if (a.value > b.value) {
                return 0
              } else if (a.value < b.value) {
                return -1
              }
              return 0
            }
          });
          this.setState({ sankeyData, dataView })
        }
      })
      .catch(function (error) {
        console.log("Request failed", error);
      })
      .finally(() => {
        this.setState({ loading: false })
      });
  }

  handleChangeAccount = (accountPrefix) => {
    this.setState({
      accountPrefix, dataView: {
        nodes: [],
        links: []
      }
    }, () => {
      this.querySankeyData(this.props.selectedMonth)
    })
  }

  handleChangeAccountLevel = (level) => {
    this.setState({
      level, dataView: {
        nodes: [],
        links: []
      }
    }, () => {
      this.querySankeyData(this.props.selectedMonth)
    })
  }

  render() {
    const { chartLoading } = this.props
    const { dataView, loading } = this.state
    if (chartLoading) {
      return <div style={{ height: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spin /></div>
    }

    // edge view
    const edges = (dataView && dataView.edges) ? dataView.edges.map((edge) => {
      return {
        source: edge.source.name,
        target: edge.target.name,
        x: edge.x,
        y: edge.y,
        value: edge.value,
      };
    }) : [];
    const colorsMap = (dataView && dataView.nodes) ? dataView.nodes.reduce((pre, cur, idx) => {
      pre[cur.name] = colors[idx]
      return pre;
    }, {}) : {}
    return (
      <Fragment>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <Segmented options={addAllSelector(defaultIfEmpty(this.props.selectedAccounts, defaultAccount))} value={this.state.accountPrefix} onChange={this.handleChangeAccount} />
          <Segmented options={[
            { value: '1', label: '账户类型' },
            { value: '', label: '所有账户' }
          ]} value={this.state.level} onChange={this.handleChangeAccountLevel} />
        </div>
        <Spin spinning={loading}>
          {
            (dataView.nodes.length === 0 || edges.length === 0) ?
              <div style={{ height: '500px' }}></div> :
              <Chart interactions={['element-highlight']} height={Math.min(dataView.nodes.length * 30 + 200, 1200)} autoFit={true} scale={scale} padding={[20, 20, 40]} >
                {/* <Tooltip showTitle={true} showMarkers={false} /> */}
                <Axis name="x" visible={false} />
                <Axis name="y" visible={false} />
                <Legend name='source' visible={false} />
                <View padding={0} data={edges}>
                  <Geom
                    type="edge"
                    position="x*y"
                    shape="arc"
                    color={['source', name => colorsMap[name]]}
                    state={{
                      default: {},
                      active: { style: { lineWidth: 1.5, strokeOpacity: 2 } },
                    }}
                    style={{ fillOpacity: 0.3, lineWidth: 0 }}
                    tooltip={
                      ["target*source*value",
                        (target, source, value) => {
                          return {
                            title: source + ' > ' + target,
                            name: '合计',
                            value: formatCurrency(value, this.props.commodity),
                          };
                        }]
                    }
                  />
                </View>
                <View padding={0} data={dataView.nodes}>
                  <Geom
                    type="polygon"
                    position="x*y"
                    color="name"
                    style={{
                      stroke: "#fff",
                    }}
                    state={{
                      default: {},
                      active: { style: { stroke: 'red', lineWidth: 1.5, strokeOpacity: 0.9 } },
                    }}
                    label={["name", (name) => {
                      return {
                        content: getAccountName(name),
                        offsetY: 10,
                        style: { fill: '#666' }
                      }
                    }]}
                    tooltip={
                      ["name*value",
                        (name) => {
                          return {
                            title: name,
                            name: '合计',
                            value: formatCurrency(this._nodeValues[name], this.props.commodity)
                          };
                        }]
                    }
                  >
                  </Geom>
                </View>
              </Chart>
          }
        </Spin>
      </Fragment>
    );
  }

}

export default AccountSankeyChart