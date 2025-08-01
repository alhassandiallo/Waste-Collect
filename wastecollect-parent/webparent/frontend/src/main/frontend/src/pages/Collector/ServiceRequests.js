// frontend/src/pages/Collector/ServiceRequests.js
import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  Card, Row, Col, Badge, Button, Modal, Form,
  Alert, Table, Pagination, InputGroup, FormControl,
  ButtonGroup, ToastContainer, Container
} from 'react-bootstrap';
import AuthContext from '../../contexts/AuthContext';
import collectorService from '../../services/collectorService';
import LoadingSpinner from '../../components/LoadingSpinner';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

/**
 * ServiceRequests Component - Manages service requests for collectors.
 * Allows viewing, filtering, accepting/rejecting, and tracking requests in real-time.
 */
const ServiceRequests = () => {
  // States for managing requests
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // States for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [requestsPerPage] = useState(10); // Fixed number of requests per page

  // States for filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // States for action modal (Accept/Reject/Complete)
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionType, setActionType] = useState(''); // 'accept', 'reject', 'complete'
  const [actionNote, setActionNote] = useState('');
  const [actualWeight, setActualWeight] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  const navigate = useNavigate();
  const { user } = useContext(AuthContext); // Get user from AuthContext

  /**
   * Fetches service requests for the current collector.
   */
  const loadRequests = useCallback(async () => {
    console.log("ServiceRequests: Attempting to load requests...");
    try {
      setLoading(true);
      setError(null);
      const response = await collectorService.getRequestsForCollector();
      console.log("ServiceRequests: Raw response data from API:", response.data);
      if (!Array.isArray(response.data)) {
        console.error("ServiceRequests: API response data is not an array:", response.data);
        throw new Error("Invalid data format received from API.");
      }
      setRequests(response.data);
      setFilteredRequests(response.data); // Initialize filtered requests with all data
      console.log("ServiceRequests: Requests loaded successfully.");
    } catch (err) {
      console.error('ServiceRequests: Error loading service requests:', err);
      setError('Failed to load service requests. ' + (err.message || ''));
      toast.error('Failed to load service requests.');
    } finally {
      setLoading(false);
      console.log("ServiceRequests: Loading finished.");
    }
  }, []);

  /**
   * Applies filters and search query to the requests list.
   */
  const applyFilters = useCallback(() => {
    console.log("ServiceRequests: Applying filters...");
    let tempRequests = [...requests];

    // Filter by status
    if (statusFilter !== 'ALL') {
      tempRequests = tempRequests.filter(request => request.status === statusFilter);
    }

    // Filter by date (e.g., 'TODAY', 'PAST', 'UPCOMING')
    if (dateFilter !== 'ALL') {
      const now = new Date();
      tempRequests = tempRequests.filter(request => {
        // Ensure preferredDate is a valid date string/object
        if (!request.preferredDate) return false;
        const requestDate = new Date(request.preferredDate);
        if (isNaN(requestDate.getTime())) { // Check for invalid date
          console.warn("ServiceRequests: Invalid preferredDate found for request:", request.id, request.preferredDate);
          return false;
        }

        if (dateFilter === 'TODAY') {
          return requestDate.toDateString() === now.toDateString();
        } else if (dateFilter === 'PAST') {
          return requestDate < now;
        } else if (dateFilter === 'UPCOMING') {
          return requestDate > now;
        }
        return true;
      });
    }

    // Filter by search query (description, address, household name, etc.)
    if (searchQuery.trim() !== '') {
      const lowerCaseQuery = searchQuery.toLowerCase();
      tempRequests = tempRequests.filter(request =>
        (request.description && request.description.toLowerCase().includes(lowerCaseQuery)) ||
        (request.address && request.address.toLowerCase().includes(lowerCaseQuery)) ||
        (request.household && request.household.firstName && request.household.lastName && 
         `${request.household.firstName} ${request.household.lastName}`.toLowerCase().includes(lowerCaseQuery))
      );
    }

    setFilteredRequests(tempRequests);
    setCurrentPage(1); // Reset to first page after filtering
    console.log(`ServiceRequests: Filters applied. Total requests: ${requests.length}, Filtered requests: ${tempRequests.length}`);
  }, [requests, statusFilter, dateFilter, searchQuery]);

  // Effect to apply filters whenever filter states or requests change
  useEffect(() => {
    applyFilters();
  }, [requests, statusFilter, dateFilter, searchQuery, applyFilters]);

  // Load requests on component mount, dependent on user being a COLLECTOR
  useEffect(() => {
    if (user && user.roleName === 'COLLECTOR') { // Changed user.role to user.roleName
      loadRequests();
    } else if (!user) {
      console.log("ServiceRequests: User not authenticated, redirecting to login.");
      navigate('/login'); // Redirect to login if not authenticated
      toast.error('Please log in to access service requests.');
    } else {
      console.log(`ServiceRequests: User is authenticated but not a COLLECTOR (${user.roleName}), redirecting to unauthorized.`);
      navigate('/unauthorized'); // Redirect if authenticated but not a collector
    }
  }, [user, navigate, loadRequests]); // Added loadRequests to dependency array

  // Pagination logic
  const indexOfLastRequest = currentPage * requestsPerPage;
  const indexOfFirstRequest = indexOfLastRequest - requestsPerPage;
  const currentRequests = filteredRequests.slice(indexOfFirstRequest, indexOfLastRequest);
  const totalPages = Math.ceil(filteredRequests.length / requestsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'PENDING': return 'info';
      case 'ACCEPTED': return 'primary';
      case 'IN_PROGRESS': return 'warning';
      case 'COMPLETED': return 'success';
      case 'REJECTED': return 'danger';
      default: return 'secondary';
    }
  };

  const handleShowActionModal = (request, type) => {
    setSelectedRequest(request);
    setActionType(type);
    setActionNote(''); // Clear previous note
    setActualWeight(''); // Clear previous weight
    setLatitude(''); // Clear previous latitude
    setLongitude(''); // Clear previous longitude
    setShowActionModal(true);
  };

  const handleCloseActionModal = () => {
    setShowActionModal(false);
    setSelectedRequest(null);
    setActionType('');
    setActionNote('');
    setActualWeight('');
    setLatitude('');
    setLongitude('');
  };

  const acceptRequest = async (request) => {
    try {
      setLoading(true);
      await collectorService.acceptRequest(request.id, { note: actionNote });
      toast.success('Service request accepted successfully!');
      loadRequests(); // Reload requests to update status
      handleCloseActionModal();
    } catch (err) {
      console.error('Error accepting request:', err);
      toast.error(err.response?.data?.message || 'Failed to accept request.');
    } finally {
      setLoading(false);
    }
  };

  const rejectRequest = async (request) => {
    if (!actionNote.trim()) {
      toast.error('Reason for rejection is required.');
      return;
    }
    try {
      setLoading(true);
      await collectorService.rejectRequest(request.id, { reason: actionNote });
      toast.success('Service request rejected successfully!');
      loadRequests();
      handleCloseActionModal();
    } catch (err) {
      console.error('Error rejecting request:', err);
      toast.error(err.response?.data?.message || 'Failed to reject request.');
    } finally {
      setLoading(false);
    }
  };

  const completeRequest = async (request) => {
    if (actionType === 'complete' && (!actualWeight || isNaN(actualWeight))) {
      toast.error('Actual weight is required and must be a number.');
      return;
    }
    if (actionType === 'complete' && (!latitude || isNaN(latitude) || !longitude || isNaN(longitude))) {
      toast.error('Valid Latitude and Longitude are required.');
      return;
    }
    try {
      setLoading(true);
      const actionData = {
        note: actionNote,
        actualWeight: parseFloat(actualWeight),
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      };
      await collectorService.completeRequest(request.id, actionData);
      toast.success('Service request completed successfully!');
      loadRequests();
      handleCloseActionModal();
    } catch (err) {
      console.error('Error completing request:', err);
      toast.error(err.response?.data?.message || 'Failed to complete request.');
    } finally {
      setLoading(false);
    }
  };

  const startRequest = async (request) => {
    try {
      setLoading(true);
      await collectorService.startRequest(request.id);
      toast.success('Service request marked as in progress!');
      loadRequests();
    } catch (err) {
      console.error('Error starting request:', err);
      toast.error(err.response?.data?.message || 'Failed to mark request as in progress.');
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <Alert variant="danger" className="text-center m-5">{error}</Alert>;
  }

  return (
    <Container className="py-5 font-inter bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <Row className="justify-content-center">
        <Col md={12} lg={10}>
          <Card className="shadow-lg rounded-xl border-0 p-4">
            <Card.Body>
              <h2 className="text-4xl font-bold text-green-700 mb-6 text-center">♻️ Service Requests</h2>

              {/* Filters and Search */}
              <Row className="mb-4 g-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="text-gray-700 font-medium">Filter by Status</Form.Label>
                    <Form.Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="PENDING">Pending</option>
                      <option value="ACCEPTED">Accepted</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="REJECTED">Rejected</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="text-gray-700 font-medium">Filter by Date</Form.Label>
                    <Form.Select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="ALL">All Dates</option>
                      <option value="TODAY">Today</option>
                      <option value="UPCOMING">Upcoming</option>
                      <option value="PAST">Past</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="text-gray-700 font-medium">Search</Form.Label>
                    <InputGroup>
                      <FormControl
                        placeholder="Search by description or address"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <Button variant="outline-secondary" onClick={() => setSearchQuery('')} className="rounded-lg ms-2">Clear</Button>
                    </InputGroup>
                  </Form.Group>
                </Col>
              </Row>

              {/* Requests Table */}
              {currentRequests.length > 0 ? (
                <div className="table-responsive">
                  <Table striped bordered hover className="mt-4 shadow-sm rounded-lg overflow-hidden">
                    <thead className="bg-green-600 text-white">
                      <tr>
                        <th className="py-3 px-4">Request ID</th>
                        <th className="py-3 px-4">Household</th>
                        <th className="py-3 px-4">Waste Type</th>
                        <th className="py-3 px-4">Preferred Date</th>
                        <th className="py-3 px-4">Address</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentRequests.map((request) => (
                        <tr key={request.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="py-3 px-4 text-sm text-gray-800 font-semibold">{request.id}</td>
                          <td className="py-3 px-4 text-sm text-gray-800">{request.household?.firstName} {request.household?.lastName}</td>
                          <td className="py-3 px-4 text-sm text-gray-800">{request.wasteType}</td>
                          <td className="py-3 px-4 text-sm text-gray-800">{new Date(request.preferredDate).toLocaleString()}</td>
                          <td className="py-3 px-4 text-sm text-gray-800">{request.address}</td>
                          <td className="py-3 px-4 text-sm">
                            <Badge bg={getStatusBadgeVariant(request.status)} className="rounded-full px-3 py-1">
                              {request.status.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <ButtonGroup size="sm">
                              {request.status === 'PENDING' && (
                                <Button
                                  variant="success"
                                  className="me-2 px-3 py-1 rounded-lg hover:bg-green-700 transition-colors duration-200"
                                  onClick={() => handleShowActionModal(request, 'accept')}
                                >
                                  Accept
                                </Button>
                              )}
                              {request.status === 'ACCEPTED' && (
                                <Button
                                  variant="warning"
                                  className="me-2 px-3 py-1 rounded-lg hover:bg-yellow-600 transition-colors duration-200"
                                  onClick={() => startRequest(request)}
                                >
                                  Start
                                </Button>
                              )}
                              {request.status === 'IN_PROGRESS' && (
                                <Button
                                  variant="primary"
                                  className="me-2 px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                                  onClick={() => handleShowActionModal(request, 'complete')}
                                >
                                  Complete
                                </Button>
                              )}
                              {request.status === 'PENDING' && (
                                <Button
                                  variant="danger"
                                  className="px-3 py-1 rounded-lg hover:bg-red-700 transition-colors duration-200"
                                  onClick={() => handleShowActionModal(request, 'reject')}
                                >
                                  Reject
                                </Button>
                              )}
                            </ButtonGroup>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-5 text-gray-500">
                  <i className="fas fa-box-open fa-5x mb-4"></i>
                  <h5 className="text-2xl font-semibold">No Service Requests Found</h5>
                  <p className="text-lg">Adjust your filters or check back later for new requests.</p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination className="justify-content-center mt-4">
                  <Pagination.Prev onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} />
                  {[...Array(totalPages)].map((_, index) => (
                    <Pagination.Item key={index + 1} active={index + 1 === currentPage} onClick={() => paginate(index + 1)}>
                      {index + 1}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} />
                </Pagination>
              )}
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
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Action Confirmation Modal */}
      <Modal show={showActionModal} onHide={handleCloseActionModal} centered>
        <Modal.Header closeButton className="border-b-2 border-gray-200 pb-3">
          <Modal.Title className="text-2xl font-bold text-gray-800">
            {actionType === 'accept' && 'Accept Service Request'}
            {actionType === 'reject' && 'Reject Service Request'}
            {actionType === 'complete' && 'Complete Service Request'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedRequest && (
            <>
              <p className="text-lg text-gray-700 mb-3">
                Request ID: <strong className="text-blue-600">{selectedRequest.id}</strong>
              </p>
              <p className="text-gray-700 mb-4">
                Description: {selectedRequest.description}
              </p>
              <Form.Group className="mb-3">
                <Form.Label className="text-gray-700 font-medium">
                  {actionType === 'reject' ? 'Reason for Rejection' : 'Notes/Comments'}
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  placeholder={
                    actionType === 'reject'
                      ? 'Please provide a reason for rejecting this request.'
                      : 'Add any relevant notes about the collection...'
                  }
                  required={actionType === 'reject'}
                  className="rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </Form.Group>

              {actionType === 'complete' && (
                <>
                  <Form.Group className="mb-3">
                    <Form.Label className="text-gray-700 font-medium">Actual Weight (kg)</Form.Label>
                    <Form.Control
                      type="number"
                      value={actualWeight}
                      onChange={(e) => setActualWeight(e.target.value)}
                      placeholder="Enter actual weight collected in kg"
                      required
                      className="rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label className="text-gray-700 font-medium">Latitude</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.000001"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      placeholder="Enter latitude of collection (e.g., 9.5370)"
                      required
                      className="rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label className="text-gray-700 font-medium">Longitude</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.000001"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      placeholder="Enter longitude of collection (e.g., -13.6780)"
                      required
                      className="rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </Form.Group>
                </>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="border-t-2 border-gray-200 pt-3">
          <Button variant="secondary" onClick={handleCloseActionModal} className="px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200">
            Cancel
          </Button>
          <Button
            variant={actionType === 'accept' ? 'success' : (actionType === 'reject' ? 'danger' : 'primary')}
            onClick={() => {
              if (actionType === 'accept') {
                acceptRequest(selectedRequest);
              } else if (actionType === 'reject') {
                rejectRequest(selectedRequest);
              } else if (actionType === 'complete') {
                completeRequest(selectedRequest);
              }
            }}
            disabled={actionType === 'reject' && !actionNote.trim()}
            className="px-4 py-2 rounded-lg transition-colors duration-200"
          >
            {actionType === 'accept' ? 'Accept' : (actionType === 'reject' ? 'Reject' : 'Complete')}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ServiceRequests;
