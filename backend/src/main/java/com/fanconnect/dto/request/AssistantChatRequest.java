package com.fanconnect.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssistantChatRequest {

    @NotBlank(message = "Le message ne peut pas être vide")
    @Size(max = 800, message = "Message trop long (800 caractères max)")
    private String message;

    private String city;
    private Long matchId;
    private Double latitude;
    private Double longitude;
}
