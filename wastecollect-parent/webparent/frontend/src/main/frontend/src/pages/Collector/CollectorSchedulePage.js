// frontend/src/pages/Collector/CollectorSchedulePage.js
import React, { useState, useEffect } from 'react';
import { Card, Container, Row, Col, Button, Modal, Badge, ListGroup, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import collectorService from '../../services/collectorService';

// Setup the localizer by providing the moment Object
const localizer = momentLocalizer(moment);

/**
 * CollectorSchedulePage Component
 * This page provides a comprehensive schedule management tool for collectors,
 * featuring calendar, list, and map views of their assigned service requests.
 */
const CollectorSchedulePage = () => {
    const navigate = useNavigate();
    const [view, setView] = useState('calendar'); // 'calendar', 'list', 'map'
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                setLoading(true);
                const response = await collectorService.getRequestsForCollector();
                const formattedEvents = response.data.map(request => ({
                    id: request.id,
                    title: `Request #${request.id} - ${request.household?.firstName || 'N/A'}`,
                    start: new Date(request.preferredDate),
                    end: new Date(moment(request.preferredDate).add(1, 'hours')), // Assume 1-hour slot
                    allDay: false,
                    resource: request, // Full request object
                }));
                setEvents(formattedEvents);
                setError(null);
            } catch (err) {
                console.error("Failed to fetch schedule:", err);
                setError("Failed to load schedule. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchSchedule();
    }, []);

    const handleEventClick = (event) => {
        setSelectedEvent(event.resource);
        setShowModal(true);
    };

    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case 'PENDING': return 'warning';
            case 'ACCEPTED': return 'info';
            case 'IN_PROGRESS': return 'primary';
            case 'COMPLETED': return 'success';
            case 'REJECTED': return 'danger';
            default: return 'secondary';
        }
    };

    const eventStyleGetter = (event) => {
        const status = event.resource.status;
        let backgroundColor = '#cccccc'; // Default
        if (status === 'COMPLETED') backgroundColor = '#28a745';
        else if (status === 'ACCEPTED') backgroundColor = '#17a2b8';
        else if (status === 'IN_PROGRESS') backgroundColor = '#007bff';
        else if (status === 'PENDING') backgroundColor = '#ffc107';
        else if (status === 'REJECTED') backgroundColor = '#dc3545';

        const style = {
            backgroundColor,
            borderRadius: '5px',
            opacity: 0.8,
            color: 'white',
            border: '0px',
            display: 'block'
        };
        return {
            style: style
        };
    };

    const renderCalendarView = () => (
        <Card className="shadow-sm">
            <Card.Body>
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 600 }}
                    onSelectEvent={handleEventClick}
                    eventPropGetter={eventStyleGetter}
                />
            </Card.Body>
        </Card>
    );

    const renderListView = () => {
        const groupedEvents = events.reduce((acc, event) => {
            const date = moment(event.start).format('YYYY-MM-DD');
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(event);
            return acc;
        }, {});

        const sortedDates = Object.keys(groupedEvents).sort();

        return (
            <Card className="shadow-sm">
                <Card.Body>
                    {sortedDates.length > 0 ? sortedDates.map(date => (
                        <div key={date} className="mb-4">
                            <h4 className="text-lg font-semibold mb-2 border-b pb-2">
                                {moment(date).format('dddd, MMMM Do YYYY')}
                            </h4>
                            <ListGroup variant="flush">
                                {groupedEvents[date].map(event => (
                                    <ListGroup.Item key={event.id} action onClick={() => handleEventClick(event)} className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <p className="mb-1 font-weight-bold">{event.title}</p>
                                            <p className="mb-0 text-muted small">{event.resource.address}</p>
                                        </div>
                                        <Badge bg={getStatusBadgeVariant(event.resource.status)} pill>
                                            {event.resource.status}
                                        </Badge>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </div>
                    )) : <p>No service requests found.</p>}
                </Card.Body>
            </Card>
        );
    };
    
    const renderMapView = () => (
        <Card className="shadow-sm">
            <Card.Body className="text-center">
                <i className="fas fa-map-marked-alt fa-5x text-gray-400 my-4"></i>
                <h5 className="text-2xl font-semibold">Map View Under Construction</h5>
                <p className="text-lg text-gray-600">This feature will provide an interactive map of your collection route.</p>
            </Card.Body>
        </Card>
    );

    return (
        <Container className="py-5 font-inter bg-gray-50 min-h-screen">
        	{/* Added Return and Return to Dashboard buttons */}
              <div className="text-center mt-5 d-flex justify-content-center gap-3 flex-wrap">
                <Button
                  variant="outline-secondary"
                  onClick={() => navigate(-1)}
                  className="px-5 py-3 rounded-lg text-lg font-semibold shadow-md hover:bg-gray-100 transition-colors duration-200"
                >
                  <i className="fas fa-arrow-left me-2"></i> Retour
                </Button>
                <Button
                  variant="primary"
                  onClick={() => navigate('/collector/dashboard')}
                  className="px-5 py-3 rounded-lg text-lg font-semibold shadow-md hover:bg-blue-700 transition-colors duration-200"
                >
                  <i className="fas fa-tachometer-alt me-2"></i> Retour au Tableau de Bord
                </Button>
              </div>
            <Row className="justify-content-center">
                <Col md={12}>
                    <Card className="shadow-lg rounded-xl border-0 p-4 mb-4">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h2 className="text-3xl font-bold text-green-700">📅 My Schedule</h2>
                                <div className="d-flex gap-2">
                                    <Button variant={view === 'calendar' ? 'primary' : 'outline-primary'} onClick={() => setView('calendar')}>Calendar</Button>
                                    <Button variant={view === 'list' ? 'primary' : 'outline-primary'} onClick={() => setView('list')}>List</Button>
                                    <Button variant={view === 'map' ? 'primary' : 'outline-primary'} onClick={() => setView('map')}>Map</Button>
                                </div>
                            </div>

                            {loading && <div className="text-center"><Spinner animation="border" variant="primary" /> <p>Loading schedule...</p></div>}
                            {error && <Alert variant="danger">{error}</Alert>}

                            {!loading && !error && (
                                <>
                                    {view === 'calendar' && renderCalendarView()}
                                    {view === 'list' && renderListView()}
                                    {view === 'map' && renderMapView()}
                                </>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Service Request Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedEvent && (
                        <div>
                            <h5>Request #{selectedEvent.id}</h5>
                            <p><strong>Status:</strong> <Badge bg={getStatusBadgeVariant(selectedEvent.status)}>{selectedEvent.status}</Badge></p>
                            <p><strong>Description:</strong> {selectedEvent.description}</p>
                            <p><strong>Address:</strong> {selectedEvent.address}</p>
                            <p><strong>Preferred Date:</strong> {moment(selectedEvent.preferredDate).format('LLL')}</p>
                            <hr />
                            <h6>Household Information</h6>
                            <p><strong>Name:</strong> {selectedEvent.household?.firstName} {selectedEvent.household?.lastName}</p>
                            <p><strong>Phone:</strong> {selectedEvent.household?.phoneNumber}</p>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
                    <Button variant="primary" onClick={() => navigate(`/collector/service-requests`)}>Go to Requests</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default CollectorSchedulePage;
