package com.wastecollect.common.dto;

public class PerformanceMetricsSummaryDTO {
    private long totalCollections;
    private long completedCollections;
    private double totalRevenue;
    private double averageRating;
    private long totalHouseholds;
    private double completionRate; // As a percentage

    public PerformanceMetricsSummaryDTO() {}

    public PerformanceMetricsSummaryDTO(long totalCollections, long completedCollections, double totalRevenue, double averageRating, long totalHouseholds, double completionRate) {
        this.totalCollections = totalCollections;
        this.completedCollections = completedCollections;
        this.totalRevenue = totalRevenue;
        this.averageRating = averageRating;
        this.totalHouseholds = totalHouseholds;
        this.completionRate = completionRate;
    }

    // Getters and Setters
    public long getTotalCollections() {
        return totalCollections;
    }

    public void setTotalCollections(long totalCollections) {
        this.totalCollections = totalCollections;
    }

    public long getCompletedCollections() {
        return completedCollections;
    }

    public void setCompletedCollections(long completedCollections) {
        this.completedCollections = completedCollections;
    }

    public double getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(double totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(double averageRating) {
        this.averageRating = averageRating;
    }

    public long getTotalHouseholds() {
        return totalHouseholds;
    }

    public void setTotalHouseholds(long totalHouseholds) {
        this.totalHouseholds = totalHouseholds;
    }

    public double getCompletionRate() {
        return completionRate;
    }

    public void setCompletionRate(double completionRate) {
        this.completionRate = completionRate;
    }
}
