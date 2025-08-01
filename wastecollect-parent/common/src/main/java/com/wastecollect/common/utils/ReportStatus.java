package com.wastecollect.common.utils;

/**
 * Defines the possible states of a report generation task.
 */
public enum ReportStatus {
    PENDING,    // The task is queued but not yet started.
    GENERATING, // The report file is actively being created.
    COMPLETED,  // The report was successfully generated and is available.
    FAILED      // An error occurred during generation.
}