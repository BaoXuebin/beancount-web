import React, { useState, useEffect, Fragment } from "react";
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

const AccountSankeyChart = ({ chartLoading = false, selectedAccounts: [] }) => {
  const [dataView, setDataView] = useState();
  const [loading, setLoading] = useState(false);
  const scale = {
    x: {
      sync: true,
    },
    y: {
      sync: true,
    },
  };

  useEffect(() => {
    const year = "2024"
    const month = "9"
    const accountPrefix = ""
    setLoading(true)
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
        setDataView(dv);
      })
      .catch(function (error) {
        console.log("Request failed", error);
      })
      .finally(() => {
        setLoading(false)
      });

  }, []);

  const handleChangeAccount = (accountPrefix) => {
    this.setState({ accountPrefix }, () => {
      this.queryAccountBalance(this.props.selectedMonth)
    })
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

  const colors = getTheme().colors20;
  const colorsMap = dataView?.nodes.reduce((pre, cur, idx) => {
    pre[cur.name] = colors[idx]
    return pre;
  }, {})

  if (chartLoading) {
    return <div style={{ height: 480, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spin /></div>
  }

  return (
    <Fragment>
      <div style={{ marginBottom: '1rem' }}>
        <Segmented options={defaultIfEmpty(selectedAccounts, defaultAccount)} value={this.state.accountPrefix} onChange={handleChangeAccount} />
      </div>
      <Spin spinning={loading}>
        <div style={{ height: 500 }}>
          {
            dataView &&
            <Chart interactions={['element-highlight']} height={500} autoFit={true} scale={scale} padding={[20, 20, 40]} >
              <Tooltip showTitle={false} showMarkers={false} />
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

export default AccountSankeyChart