import React from 'react';

export default function tracker(Component, config) {
  const tracked = React.createClass({
    componentDidMount() {
      this.emitPageView();
    },
    emitPageView() {
      /* global reactI13n */
      /* eslint-disable id-match, no-underscore-dangle */
      const pageInfo = reactI13n.getRootI13nNode()._model;
      [ 'title', 'template', 'topic', 'publishDate' ]
      .map((currentValue) => {
        let newProp = {};
        if (config[currentValue]) {
          if (typeof config[currentValue] === 'function') {
            newProp = config[currentValue](this);
          } else if (typeof config[currentValue] === 'string') {
            newProp = config[currentValue];
          }
        } else {
          newProp = this.props[currentValue];
        }
        pageInfo[currentValue] = newProp;
        return pageInfo;
      });
      reactI13n.execute('pageview', pageInfo);
    },
    render() {
      return <Component {...this.props} />;
    },
  });
  return tracked;
}
