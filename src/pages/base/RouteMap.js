
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

const RouteMap = () => (
  <React.Fragment>
    <Switch>
      <Route exact path="/" component={Index} />
      <Route exact path="/ledger" component={Ledger} />
      <Route exact path="/account" component={Account} />
      <Route exact path="/about" component={About} />
      <Route exact path="/edit" component={Edit} />
      <Route exact path="/stats" component={Stats} />
    </Switch>
  </React.Fragment>
);

export default RouteMap;