package com.wastecollect.backend.service;

import com.wastecollect.common.dto.DisputeDTO;
import com.wastecollect.common.models.Dispute;
import com.wastecollect.backend.exception.ResourceException;
import com.wastecollect.backend.repository.DisputeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DisputeService {

    @Autowired
    private DisputeRepository disputeRepository;

    public void createDispute(DisputeDTO dispute) {
        Dispute newDispute = new Dispute(
                dispute.getDescription(),
                dispute.getStatus(),
                dispute.getCreatedAt(),
                dispute.getUpdatedAt()
        );
        disputeRepository.save(newDispute);
    }

    public List<DisputeDTO> getAllDisputes() {
        List<Dispute> disputes = disputeRepository.findAll();
        return disputes.stream()
                .map(d -> new DisputeDTO(
                        d.getId(),
                        d.getDescription(),
                        d.getStatus(),
                        d.getCreatedAt(),
                        d.getUpdatedAt()
                ))
                .collect(Collectors.toList());
    }

	/*
	 * public void resolveDispute(Long id, DisputeDTO resolution) { Dispute dispute
	 * = disputeRepository.findById(id).orElse(null); if (dispute != null) {
	 * dispute.setStatus(resolution.getStatus());
	 * dispute.setUpdatedAt(resolution.getUpdatedAt());
	 * disputeRepository.save(dispute); } }
	 */
    
    public void resolveDispute(Long id, DisputeDTO resolution) {
        Dispute dispute = disputeRepository.findById(id)
                            .orElseThrow(() -> new ResourceException("Dispute", id.toString())); // Use custom exception
        dispute.setStatus(resolution.getStatus());
        dispute.setUpdatedAt(resolution.getUpdatedAt());
        disputeRepository.save(dispute);
    }

    public DisputeDTO getDisputeStatistics() {
        // Logic to get dispute statistics
        return new DisputeDTO();
    }

    public List<DisputeDTO> getDisputeHistoryForUser(Long userId) {
        List<Dispute> disputes = disputeRepository.findByUserId(userId);
        return disputes.stream()
                .map(d -> new DisputeDTO(
                        d.getId(),
                        d.getDescription(),
                        d.getStatus(),
                        d.getCreatedAt(),
                        d.getUpdatedAt()
                ))
                .collect(Collectors.toList());
    }
}