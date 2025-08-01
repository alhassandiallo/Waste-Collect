package com.wastecollect.backend.service;

import com.wastecollect.common.dto.StatisticsDTO;
import com.wastecollect.common.models.Statistics;
import com.wastecollect.backend.exception.ResourceNotFoundException;
import com.wastecollect.backend.repository.StatisticsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime; // Import LocalDateTime
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class StatisticsService {

    @Autowired
    private StatisticsRepository statisticsRepository;

    public StatisticsDTO getGlobalStatistics() {
        // Fix 1: Handle Optional return type for findGlobalStatistics()
        Optional<Statistics> statisticsOptional = statisticsRepository.findGlobalStatistics();
        Statistics statistics = statisticsOptional.orElseThrow(
            () -> new ResourceNotFoundException("Global statistics not found.") // Or return a default/empty DTO
        );
        return new StatisticsDTO(
                statistics.getId(),
                statistics.getPeriodType(),
                statistics.getStartDate(),
                statistics.getEndDate(),
                statistics.getTotalCollections(),
                statistics.getTotalWasteCollected(),
                statistics.getAverageWastePerCollection(),
                statistics.getActiveHouseholds(),
                statistics.getActiveCollectors()
        );
    }

    public List<StatisticsDTO> getStatisticsByPeriod(String periodType, String startDateStr, String endDateStr) { // Renamed parameters to avoid confusion
        // Fix 2: Parse String dates to LocalDateTime
        LocalDateTime startDate = LocalDateTime.parse(startDateStr); // Assuming ISO_LOCAL_DATE_TIME format or handle parsing
        LocalDateTime endDate = LocalDateTime.parse(endDateStr);     // Assuming ISO_LOCAL_DATE_TIME format or handle parsing

        List<Statistics> statisticsList = statisticsRepository.findByPeriod(periodType, startDate, endDate);
        return statisticsList.stream()
                .map(statistics -> new StatisticsDTO(
                        statistics.getId(),
                        statistics.getPeriodType(),
                        statistics.getStartDate(),
                        statistics.getEndDate(),
                        statistics.getTotalCollections(),
                        statistics.getTotalWasteCollected(),
                        statistics.getAverageWastePerCollection(),
                        statistics.getActiveHouseholds(),
                        statistics.getActiveCollectors()
                ))
                .collect(Collectors.toList());
    }

    public byte[] exportStatistics(String format, String periodType) {
        // Logic to export statistics
        return new byte[0];
    }

    public StatisticsDTO compareStatistics(String period1, String period2) {
        // Logic to compare statistics
        return new StatisticsDTO();
    }
    
    public Optional<Statistics> getLatestStatistics() {
        // Get only the first result. The findLatestStatistics(Pageable) method is the correct one.
        // The findTopByOrderByStartDateDescIdDesc() is preferred for a single latest statistic.
        return statisticsRepository.findTopByOrderByStartDateDescIdDesc();
    }

}
