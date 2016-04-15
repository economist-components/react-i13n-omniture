import React from 'react';
/* eslint-disable id-match */
import Reacti13n from 'react-i13n';
/* eslint-enable id-match */

export default function tracker(Component, config) {
  const tracked = React.createClass({
    componentDidMount() {
      this.emitPageView();
    },
    emitPageView() {
      /* eslint-disable id-match, no-underscore-dangle */
      const reactI13nInstance = Reacti13n.getInstance();
      const pageInfo = reactI13nInstance.getRootI13nNode()._model;
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
      reactI13nInstance.execute('pageview', pageInfo);
    },
    render() {
      return <Component {...this.props} />;
    },
  });
  return tracked;
}
