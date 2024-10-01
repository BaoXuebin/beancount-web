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
import { AccountTypeDict, defaultIfEmpty, fetch } from "../../config/Util";
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

  state = {
    dataView: null,
    loading: false,
    accountPrefix: defaultIfEmpty(this.props.selectedAccounts, defaultAccount)[0].value
  }

  componentDidMount() {
    this.querySankeyData(this.props.selectedMonth)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedMonth !== this.props.selectedMonth) {
      this.querySankeyData(nextProps.selectedMonth)
    }
    if (nextProps.selectedAccounts !== this.props.selectedAccounts) {
      this.setState({ accountPrefix: defaultIfEmpty(nextProps.selectedAccounts, defaultAccount)[0].value })
    }
  }

  querySankeyData = (selectedMonth) => {
    this.setState({ loading: true })
    let year, month;
    const { accountPrefix } = this.state;
    if (selectedMonth) {
      const yearAndMonth = selectedMonth.split('-').filter(a => a)
      if (yearAndMonth.length === 1) {
        year = yearAndMonth[0]
      } else if (yearAndMonth.length === 2) {
        year = yearAndMonth[0]
        month = yearAndMonth[1]
      }
    }
    fetch(`/api/auth/stats/account/flow?prefix=${accountPrefix}&year=${year || ''}&month=${month || ''}`)
      .then((sankeyData) => {
        const ds = new DataSet();
        const dv = ds.createView().source(sankeyData, {
          type: "graph",
          edges: (d) => d.links,
        });
        dv.transform({
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
        this.setState({ dataView: dv })
      })
      .catch(function (error) {
        console.log("Request failed", error);
      })
      .finally(() => {
        this.setState({ loading: false })
      });
  }

  handleChangeAccount = (accountPrefix) => {
    this.setState({ accountPrefix }, () => {
      this.querySankeyData(this.props.selectedMonth)
    })
  }

  render() {
    const { selectedAccounts, chartLoading } = this.props
    const { dataView, loading } = this.state
    if (chartLoading) {
      return <div style={{ height: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spin /></div>
    }
    // edge view
    const edges = dataView && dataView.edges.map((edge) => {
      return {
        source: edge.source.name,
        target: edge.target.name,
        x: edge.x,
        y: edge.y,
        value: edge.value,
      };
    });
    const colorsMap = dataView?.nodes.reduce((pre, cur, idx) => {
      pre[cur.name] = colors[idx]
      return pre;
    }, {})
    return (
      <Fragment>
        {/* <div style={{ marginBottom: '1rem' }}>
          <Segmented options={defaultIfEmpty(selectedAccounts, defaultAccount)} value={this.state.accountPrefix} onChange={this.handleChangeAccount} />
        </div> */}
        <Spin spinning={loading}>
          <div style={{ height: 800 }}>
            {
              dataView &&
              <Chart interactions={['element-highlight']} height={800} autoFit={true} scale={scale} padding={[20, 20, 40]} >
                <Tooltip showTitle={false} showMarkers={false} />
                <Axis name="x" visible={true} />
                <Axis name="y" visible={true} />
                <Legend name='source' visible={true} />
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
                            name: source + " to " + target + "</span>",
                            value,
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
                    label={["name", {
                      offsetY: 10,
                      style: { fill: '#666' }
                    }]}
                  >
                  </Geom>
                </View>
              </Chart>
            }
          </div>
        </Spin>
      </Fragment>
    );
  }

}

export default AccountSankeyChart