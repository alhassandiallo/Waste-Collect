package com.wastecollect.common.dto;

public class ObjectiveDTO {
    private int monthlyTarget;
    private int currentProgress;
    private double revenueTarget;
    private double currentRevenue;
    private double ratingTarget;
    private double currentRating;

    public ObjectiveDTO() {}

    public ObjectiveDTO(int monthlyTarget, int currentProgress, double revenueTarget, double currentRevenue, double ratingTarget, double currentRating) {
        this.monthlyTarget = monthlyTarget;
        this.currentProgress = currentProgress;
        this.revenueTarget = revenueTarget;
        this.currentRevenue = currentRevenue;
        this.ratingTarget = ratingTarget;
        this.currentRating = currentRating;
    }

    // Getters and Setters
    public int getMonthlyTarget() {
        return monthlyTarget;
    }

    public void setMonthlyTarget(int monthlyTarget) {
        this.monthlyTarget = monthlyTarget;
    }

    public int getCurrentProgress() {
        return currentProgress;
    }

    public void setCurrentProgress(int currentProgress) {
        this.currentProgress = currentProgress;
    }

    public double getRevenueTarget() {
        return revenueTarget;
    }

    public void setRevenueTarget(double revenueTarget) {
        this.revenueTarget = revenueTarget;
    }

    public double getCurrentRevenue() {
        return currentRevenue;
    }

    public void setCurrentRevenue(double currentRevenue) {
        this.currentRevenue = currentRevenue;
    }

    public double getRatingTarget() {
        return ratingTarget;
    }

    public void setRatingTarget(double ratingTarget) {
        this.ratingTarget = ratingTarget;
    }

    public double getCurrentRating() {
        return currentRating;
    }

    public void setCurrentRating(double currentRating) {
        this.currentRating = currentRating;
    }
}
