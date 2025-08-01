package com.wastecollect.backend.controller;

import com.wastecollect.common.dto.StatisticsDTO;
import com.wastecollect.backend.service.StatisticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/statistics")
@CrossOrigin(origins = "http://localhost:3000")
public class StatisticsController {

    @Autowired
    private StatisticsService statisticsService;

    // Global statistics
    @GetMapping("/global")
    public ResponseEntity<StatisticsDTO> getGlobalStatistics() {
        return ResponseEntity.ok(statisticsService.getGlobalStatistics());
    }

    // Statistics by period
    @GetMapping("/by-period")
    public ResponseEntity<List<StatisticsDTO>> getStatisticsByPeriod(
            @RequestParam String periodType,
            @RequestParam String startDate,
            @RequestParam String endDate) {
        return ResponseEntity.ok(statisticsService.getStatisticsByPeriod(periodType, startDate, endDate));
    }

    // Export statistics
    @GetMapping("/export")
    public ResponseEntity<byte[]> exportStatistics(
            @RequestParam String format,
            @RequestParam String periodType) {
        return ResponseEntity.ok().body(statisticsService.exportStatistics(format, periodType));
    }

    // Comparative statistics
    @GetMapping("/compare")
    public ResponseEntity<StatisticsDTO> getComparativeStatistics(
            @RequestParam String period1,
            @RequestParam String period2) {
        return ResponseEntity.ok(statisticsService.compareStatistics(period1, period2));
    }
}