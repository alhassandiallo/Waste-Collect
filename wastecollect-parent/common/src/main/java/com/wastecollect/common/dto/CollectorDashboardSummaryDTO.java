package com.wastecollect.common.dto;

import java.io.Serializable;

/**
 * DTO for summarizing a collector's performance indicators for the dashboard.
 * This provides a structured way to send key metrics to the frontend.
 */
public class CollectorDashboardSummaryDTO implements Serializable {

    private long totalRequests;
    private long pendingRequests;
    private long completedToday;
    private double totalRevenue;
    private double weeklyRevenue;
    private double rating;
    private long totalRatings;
    private long totalHouseholds; // Added for PerformanceMetrics general stats
    private double completionRate; // Added for PerformanceMetrics general stats

    // Constructors
    public CollectorDashboardSummaryDTO() {
    }

    public CollectorDashboardSummaryDTO(long totalRequests, long pendingRequests, long completedToday, double totalRevenue, double weeklyRevenue, double rating, long totalRatings) {
        this.totalRequests = totalRequests;
        this.pendingRequests = pendingRequests;
        this.completedToday = completedToday;
        this.totalRevenue = totalRevenue;
        this.weeklyRevenue = weeklyRevenue;
        this.rating = rating;
        this.totalRatings = totalRatings;
        // Default values for new fields in this constructor for backward compatibility
        this.totalHouseholds = 0;
        this.completionRate = 0.0;
    }

    // New constructor including all fields for full control
    public CollectorDashboardSummaryDTO(long totalRequests, long pendingRequests, long completedToday, double totalRevenue, double weeklyRevenue, double rating, long totalRatings, long totalHouseholds, double completionRate) {
        this.totalRequests = totalRequests;
        this.pendingRequests = pendingRequests;
        this.completedToday = completedToday;
        this.totalRevenue = totalRevenue;
        this.weeklyRevenue = weeklyRevenue;
        this.rating = rating;
        this.totalRatings = totalRatings;
        this.totalHouseholds = totalHouseholds;
        this.completionRate = completionRate;
    }

    // Getters
    public long getTotalRequests() {
        return totalRequests;
    }

    public long getPendingRequests() {
        return pendingRequests;
    }

    public long getCompletedToday() {
        return completedToday;
    }

    public double getTotalRevenue() {
        return totalRevenue;
    }

    public double getWeeklyRevenue() {
        return weeklyRevenue;
    }

    public double getRating() {
        return rating;
    }

    public long getTotalRatings() {
        return totalRatings;
    }

    public long getTotalHouseholds() {
        return totalHouseholds;
    }

    public double getCompletionRate() {
        return completionRate;
    }

    // Setters
    public void setTotalRequests(long totalRequests) {
        this.totalRequests = totalRequests;
    }

    public void setPendingRequests(long pendingRequests) {
        this.pendingRequests = pendingRequests;
    }

    public void setCompletedToday(long completedToday) {
        this.completedToday = completedToday;
    }

    public void setTotalRevenue(double totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public void setWeeklyRevenue(double weeklyRevenue) {
        this.weeklyRevenue = weeklyRevenue;
    }

    public void setRating(double rating) {
        this.rating = rating;
    }

    public void setTotalRatings(long totalRatings) {
        this.totalRatings = totalRatings;
    }

    public void setTotalHouseholds(long totalHouseholds) {
        this.totalHouseholds = totalHouseholds;
    }

    public void setCompletionRate(double completionRate) {
        this.completionRate = completionRate;
    }

    @Override
    public String toString() {
        return "CollectorDashboardSummaryDTO{" +
               "totalRequests=" + totalRequests +
               ", pendingRequests=" + pendingRequests +
               ", completedToday=" + completedToday +
               ", totalRevenue=" + totalRevenue +
               ", weeklyRevenue=" + weeklyRevenue +
               ", rating=" + rating +
               ", totalRatings=" + totalRatings +
               ", totalHouseholds=" + totalHouseholds +
               ", completionRate=" + completionRate +
               '}';
    }
}
