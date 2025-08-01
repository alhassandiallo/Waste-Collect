package com.wastecollect.backend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;

import java.io.IOException;

/**
 * Filter to wrap HttpServletRequest with ContentCachingRequestWrapper.
 * This allows the request body to be read multiple times by different filters
 * or by the DispatcherServlet for @RequestBody binding.
 * This is crucial when filters (like security filters) might consume the input stream
 * before the @RequestBody handler can process it.
 */
@Component
public class RequestCachingFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        // Wrap the request only if it's a POST, PUT, or PATCH request,
        // as these are the ones typically carrying a body that needs caching.
        // GET requests usually don't have a body.
        boolean isContentCacheable = "POST".equalsIgnoreCase(request.getMethod()) ||
                                     "PUT".equalsIgnoreCase(request.getMethod()) ||
                                     "PATCH".equalsIgnoreCase(request.getMethod());

        if (isContentCacheable && !(request instanceof ContentCachingRequestWrapper)) {
            // Wrap the request to cache its content
            ContentCachingRequestWrapper wrappedRequest = new ContentCachingRequestWrapper(request);
            filterChain.doFilter(wrappedRequest, response);
        } else {
            // For other methods or if already wrapped, just proceed
            filterChain.doFilter(request, response);
        }
    }
}

