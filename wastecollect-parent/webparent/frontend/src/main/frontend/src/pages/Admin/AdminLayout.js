import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Container, Row, Col, Nav } from 'react-bootstrap';

const AdminLayout = () => {
  return (
    <Container fluid>
      <Row>
        {/* The sidebar column has been removed */}
        <Col md={12} lg={12} className="px-md-4"> {/* Adjusted to take full width */}
          <main>
            {/* The content of the specific admin page will be rendered here */}
            <Outlet />
          </main>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminLayout;
