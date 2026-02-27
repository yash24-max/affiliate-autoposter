package com.autoposter.auth.service;

import com.autoposter.auth.dto.request.RegisterRequest;
import com.autoposter.auth.entity.User;
import com.autoposter.auth.entity.UserCredential;
import com.autoposter.auth.repository.UserCredentialRepository;
import com.autoposter.auth.repository.UserRepository;
import com.autoposter.auth.utils.PasswordEncoderUtils;
import com.autoposter.common.dto.ApiResponse;
import com.autoposter.common.exception.AppException;
import com.autoposter.common.exception.ErrorCode;
import com.autoposter.common.utils.DateTimeUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImplementation implements AuthService {

    private final UserRepository           userRepository;
    private final PasswordEncoderUtils     passwordEncoderUtils;
    private final UserCredentialRepository userCredentialRepository;
    private final MailService              mailService;

    @Override
    @Transactional
    public ApiResponse<?> register(RegisterRequest registerRequest) {
        if (userCredentialRepository.existsByEmail(registerRequest.getEmail())) {
            throw new AppException(ErrorCode.USER_ALREADY_EXISTS, "User Already Exist");
        }

        // Prepare User Profile
        User user = User.builder()
                .name(registerRequest.getName())
                .email(registerRequest.getEmail())
                .createdAt(DateTimeUtils.now())
                .updatedAt(DateTimeUtils.now())
                .build();

        // Prepare User Credential
        UserCredential userCredential = UserCredential.builder()
                .user(user) // Link to user object
                .email(registerRequest.getEmail())
                .password(passwordEncoderUtils.encryptPassword(registerRequest.getPassword()))
                .isEnabled(false)
                .verificationToken(UUID.randomUUID().toString())
                .createdAt(DateTimeUtils.now())
                .updatedAt(DateTimeUtils.now())
                .build();

        user.setCredential(userCredential);

        try {
            userRepository.save(user);
        } catch (Exception e) {
            throw new AppException(ErrorCode.INTERNAL_ERROR, "Failed to save user: " + e.getMessage());
        }

        try {
            mailService.sendVerificationEmail(user.getEmail(), userCredential.getVerificationToken());
        } catch (Exception e) {
            log.error("Failed to send verification email to {}: {}", user.getEmail(), e.getMessage());
        }

        return ApiResponse.ok("User registered successfully. Please check your email " + user.getEmail() + " for verification link.");
    }

    @Override
    public ApiResponse<?> verify(String verificationToken) {
        if (StringUtils.isBlank(verificationToken)) {
            throw new AppException(ErrorCode.EMAIL_NOT_VERIFIED, "Invalid Token");
        }

        UserCredential userCredential = userCredentialRepository.findByVerificationToken(verificationToken)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Invalid or expired verification token"));

        if (userCredential.isEnabled()) {
            ApiResponse.ok("Account is already verified !!");
        }

        userCredential.setEnabled(true);
        userCredential.setVerificationToken(null);
        userCredential.setUpdatedAt(DateTimeUtils.now());
        try {
            userCredentialRepository.save(userCredential);
        } catch (Exception e) {
            throw new AppException(ErrorCode.INTERNAL_ERROR, "Failed to save user: " + e.getMessage());
        }
        return ApiResponse.ok("Account verified successfully");
    }
}
