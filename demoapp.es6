/* eslint-disable id-match */
import React from 'react';
import { createI13nNode } from 'react-i13n';
// Mockup data.
const loggedin = 'logged_in';
const today = new Date().toString();
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
      i13n: React.PropTypes.object,
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
      // TODO: Detect User ID
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
        <p>Campaign link examples</p>
        <a href="?cid1=test/test/test/owned/owned/owned">Link 1</a>
        <a href="?cid1=test/test3/test/owned/owned/owned">Link 2</a>
        <a href="?cid1=test/test/test/paid/paid/paid/paid/paid">Link 3</a>
      </I13nDiv>
    );
  }
}
