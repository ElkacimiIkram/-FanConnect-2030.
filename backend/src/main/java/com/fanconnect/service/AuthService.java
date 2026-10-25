package com.fanconnect.service;

import com.fanconnect.dto.request.LoginRequest;
import com.fanconnect.dto.request.RegisterRequest;
import com.fanconnect.dto.response.AuthResponse;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);
}