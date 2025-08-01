package com.wastecollect.backend.dto;

import jakarta.validation.Valid;

public class ResetPasswordRequest {
    @Valid
    private String token;
    @Valid
    private String newPassword;

    // Getters and Setters
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getNewPassword() { return newPassword; }
    public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
}