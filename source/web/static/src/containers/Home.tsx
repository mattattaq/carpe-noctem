import * as React from 'react';
import { connect } from 'react-redux';
import { Row, Col, Panel } from 'react-bootstrap';
import MarketingBanner from '../components/MarketingBanner';

export class Home extends React.Component<{}, {}> {
  public render() {
    return (
      <Row>
        <Col xs={12}>
          <MarketingBanner />
        </Col>
        <Col xs={12}>
          <Panel header={'Panel Header'} footer={'Panel Footer'}>
            Maybe this panel can be used for something.
          </Panel>
        </Col>
      </Row>
    );
  };
};

export default connect()(Home);
