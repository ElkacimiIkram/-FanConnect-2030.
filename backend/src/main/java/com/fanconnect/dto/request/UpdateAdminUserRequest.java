package com.fanconnect.dto.request;

import com.fanconnect.model.enums.Role;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateAdminUserRequest {

    @Size(max = 100)
    private String firstName;

    @Size(max = 100)
    private String lastName;

    @Size(max = 20)
    private String phone;

    private Role role;

    private Boolean enabled;
}