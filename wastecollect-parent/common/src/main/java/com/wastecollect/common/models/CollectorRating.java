package com.wastecollect.common.models;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "rating")
public class CollectorRating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "collector_id", nullable = false)
    private Collector collector; // The collector being rated

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "household_id", nullable = false)
    private Household household; // The household giving the rating

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_request_id", unique = true, nullable = false)
    private ServiceRequest serviceRequest; // The specific service request this rating is for

    @Column(name = "overall_rating", nullable = false)
    private Integer overallRating; // Overall rating (e.g., 1-5 stars)

	/*
	 * @Column(name = "punctuality_rating") private Integer punctualityRating; //
	 * Rating for punctuality
	 * 
	 * @Column(name = "cleanliness_rating") private Integer cleanlinessRating; //
	 * Rating for cleanliness
	 * 
	 * @Column(name = "courtesy_rating") private Integer courtesyRating; // Rating
	 * for courtesy
	 */
    @Column(name = "comment", length = 1000)
    private String comment; // Detailed comment

    @Column(name = "rating_date", nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date ratingDate;

    // Constructors
    public CollectorRating() {}

    public CollectorRating(Collector collector, Household household, ServiceRequest serviceRequest,
                           Integer overallRating, String comment, Date ratingDate) {
        this.collector = collector;
        this.household = household;
        this.serviceRequest = serviceRequest;
        this.overallRating = overallRating;
        this.comment = comment;
        this.ratingDate = ratingDate;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Collector getCollector() {
        return collector;
    }

    public void setCollector(Collector collector) {
        this.collector = collector;
    }

    public Household getHousehold() {
        return household;
    }

    public void setHousehold(Household household) {
        this.household = household;
    }

    public ServiceRequest getServiceRequest() {
        return serviceRequest;
    }

    public void setServiceRequest(ServiceRequest serviceRequest) {
        this.serviceRequest = serviceRequest;
    }

    public Integer getOverallRating() {
        return overallRating;
    }

    public void setOverallRating(Integer overallRating) {
        this.overallRating = overallRating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public Date getRatingDate() {
        return ratingDate;
    }

    public void setRatingDate(Date ratingDate) {
        this.ratingDate = ratingDate;
    }
}
