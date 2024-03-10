
import React from 'react';
import Loadable from 'react-loadable';
import { Route, Switch } from "react-router-dom";
import Loader from '../../components/Loader';

const Ledger = Loadable({ loader: () => import('../Ledger'), loading: Loader });
const Index = Loadable({ loader: () => import('../Index'), loading: Loader });
const Account = Loadable({ loader: () => import('../Account'), loading: Loader });
const About = Loadable({ loader: () => import('../About'), loading: Loader });
const Stats = Loadable({ loader: () => import('../stats/Stats'), loading: Loader });
const Edit = Loadable({ loader: () => import('../Edit'), loading: Loader });
const Init = Loadable({ loader: () => import('../Init'), loading: Loader });
const Import = Loadable({ loader: () => import('../Import'), loading: Loader });
const Setting = Loadable({ loader: () => import('../Setting'), loading: Loader });
const Event = Loadable({ loader: () => import('../Event'), loading: Loader });

const RouteMap = () => (
  <React.Fragment>
    <Switch>
      <Route exact path="/" component={Index} />
      <Route exact path="/init" component={Init} />
      <Route exact path="/ledger" component={Ledger} />
      <Route exact path="/account" component={Account} />
      <Route exact path="/about" component={About} />
      <Route exact path="/edit" component={Edit} />
      <Route exact path="/stats" component={Stats} />
      <Route exact path="/import" component={Import} />
      <Route exact path="/setting" component={Setting} />
      <Route exact path="/events" component={Event} />
      <Route component={Index} />
    </Switch>
  </React.Fragment>
);

export default RouteMap;