package com.wastecollect.backend.controller;

import com.wastecollect.common.dto.DisputeDTO;
import com.wastecollect.backend.service.DisputeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/dispute")
@CrossOrigin(origins = "http://localhost:3000")
public class DisputeController {

    @Autowired
    private DisputeService disputeService;

    // Dispute creation and management
    @PostMapping("/create")
    public ResponseEntity<String> createDispute(@RequestBody DisputeDTO dispute) {
        disputeService.createDispute(dispute);
        return ResponseEntity.ok("Dispute created successfully");
    }

    @GetMapping("/list")
    public ResponseEntity<List<DisputeDTO>> listDisputes() {
        return ResponseEntity.ok(disputeService.getAllDisputes());
    }

    @PutMapping("/resolve/{id}")
    public ResponseEntity<String> resolveDispute(@PathVariable Long id, @RequestBody DisputeDTO resolution) {
        disputeService.resolveDispute(id, resolution);
        return ResponseEntity.ok("Dispute resolved successfully");
    }

    // Dispute statistics
    @GetMapping("/statistics")
    public ResponseEntity<DisputeDTO> getDisputeStatistics() {
        return ResponseEntity.ok(disputeService.getDisputeStatistics());
    }

    // Dispute history for a user
    @GetMapping("/history/user/{userId}")
    public ResponseEntity<List<DisputeDTO>> getDisputeHistory(@PathVariable Long userId) {
        return ResponseEntity.ok(disputeService.getDisputeHistoryForUser(userId));
    }
}