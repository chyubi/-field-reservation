package com.fieldreservation.backend.service;

import com.fieldreservation.backend.config.AppProperties;
import com.fieldreservation.backend.dto.LoginRequest;
import com.fieldreservation.backend.dto.LoginResponse;
import com.fieldreservation.backend.exception.ApplicationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AdminAuthService {

    private final AppProperties appProperties;
    private final PasswordEncoder passwordEncoder;

    public AdminAuthService(AppProperties appProperties, PasswordEncoder passwordEncoder) {
        this.appProperties = appProperties;
        this.passwordEncoder = passwordEncoder;
    }

    public LoginResponse login(LoginRequest request) {
        if (!passwordEncoder.matches(request.password(), appProperties.getAdmin().getPasswordHash())) {
            throw new ApplicationException("ADMIN_AUTH_FAILED", "관리자 비밀번호가 올바르지 않습니다.", HttpStatus.UNAUTHORIZED);
        }
        return new LoginResponse(appProperties.getAdmin().getToken());
    }

    public void assertAuthorized(String adminToken) {
        if (!appProperties.getAdmin().getToken().equals(adminToken)) {
            throw new ApplicationException("ADMIN_FORBIDDEN", "관리자 권한이 없습니다.", HttpStatus.UNAUTHORIZED);
        }
    }
}
