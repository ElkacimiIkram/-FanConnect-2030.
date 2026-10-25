package com.fanconnect.service;

import com.fanconnect.dto.request.CreateUserRequest;
import com.fanconnect.dto.request.UpdateUserRequest;
import com.fanconnect.dto.response.UserResponse;

public interface UserService {

    UserResponse createUser(CreateUserRequest request);

    UserResponse getCurrentUser();

    UserResponse updateProfile(UpdateUserRequest request);

    void deleteAccount();
}