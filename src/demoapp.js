/* eslint-disable id-match */
import React from 'react';
import PropTypes from 'prop-types';
import { createI13nNode } from 'react-i13n';
// Mockup data.
const I13nAnchor = createI13nNode('a', {
  isLeafNode: true,
  bindClickEvent: true,
  follow: true,
});

const I13nDiv = createI13nNode('div', {
  isLeafNode: false,
  bindClickEvent: false,
  follow: false,
});
// Simulation of a basic App.
export default class DemoApp extends React.Component {

  static get propTypes() {
    return {
      i13n: PropTypes.object,
    };
  }

  componentWillMount() {
    this.props.i13n.executeEvent('pageview', {
      title: 'Title of the article',
      template: 'article',
      topic: 'Science',
      publishDate: new Date(),
      // This will overwrite the default
      articleSource: 'web',
      userID: 15,
    });
  }

  render() {
    return (
      <I13nDiv
        i13nModel={{ position: 'Inside a div' }}
      >
        <I13nAnchor
          href="#"
          i13nModel={{
            action: 'click',
            element: 'Go somewhere link',
          }}
        >Open the console and click me please.</I13nAnchor>
      </I13nDiv>
    );
  }
}
