import axios from 'axios';

/**
 * This file exports the single, globally configured Axios instance.
 * * Your index.js file has already set the baseURL and, crucially, the
 * authentication interceptors on the default instance of Axios.
 * * By importing this default instance in your other services, you ensure
 * all API requests will correctly use that central configuration and
 * automatically include the authorization token.
 */
export default axios;
