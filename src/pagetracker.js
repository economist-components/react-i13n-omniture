import React from 'react';
/* eslint-disable id-match */
import ReactI13n from 'react-i13n';

export default function tracker(Component, config) {
  const tracked = React.createClass({
    componentDidMount() {
      this.emitPageView();
    },
    emitPageView() {
      /* eslint-disable id-match, no-underscore-dangle */
      const pageInfo = ReactI13n.getRootI13nNode()._model;
      /* eslint-enable id-match, no-underscore-dangle */
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
      ReactI13n.execute('pageview', pageInfo);
    },
    render() {
      return <Component {...this.props} />;
    },
  });
  return tracked;
}
