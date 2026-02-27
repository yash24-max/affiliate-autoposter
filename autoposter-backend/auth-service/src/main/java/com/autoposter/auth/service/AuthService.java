package com.autoposter.auth.service;

import com.autoposter.auth.dto.request.RegisterRequest;
import com.autoposter.common.dto.ApiResponse;

public interface AuthService {

    ApiResponse<?> register(RegisterRequest registerRequest);

    ApiResponse<?> verify(String verificationToken);
}
