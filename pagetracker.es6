import React, { PropTypes } from 'react';

export default function tracker(Component, config) {
  const tracked = React.createClass({
    componentDidMount() {
      this.emitPageView();
    },
    emitPageView() {
      let pageInfo = reactI13n.getRootI13nNode()._model;
      ['title','template','topic','publishDate']
      .map((currentValue) => {
        let newProp = {};
        if (config[currentValue]) {
          if(typeof config[currentValue] === 'function'){
            newProp = config[currentValue](this);
          } else if (typeof config[currentValue] === 'string'){
            newProp = config[currentValue];
          }
        } else {
          newProp = this.props[currentValue];
        }
        pageInfo[currentValue] = newProp;
      });
      reactI13n.execute('pageview', pageInfo );
    },
    render() {
      return <Component {...this.props} />;
    },
  });
  return tracked;
}
