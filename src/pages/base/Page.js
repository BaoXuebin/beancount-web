import React, { Component } from 'react'

const Page = ChildComponent => class extends Component {
  render() {
    return <ChildComponent {...this.props} />
  }
}

export default Page