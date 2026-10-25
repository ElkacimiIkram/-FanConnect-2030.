package com.fanconnect.controller;

import com.fanconnect.dto.request.AssistantChatRequest;
import com.fanconnect.dto.response.ApiResponse;
import com.fanconnect.dto.response.AssistantChatResponse;
import com.fanconnect.service.FanAssistantService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/assistant")
@RequiredArgsConstructor
@Tag(name = "FanBot", description = "Assistant IA FanConnect 2030 (Grok + fallback local)")
public class AssistantController {

    private final FanAssistantService fanAssistantService;

    @GetMapping("/suggestions")
    @Operation(summary = "Suggested questions for the FanBot widget")
    public ResponseEntity<ApiResponse<List<String>>> suggestions() {
        return ResponseEntity.ok(ApiResponse.success(fanAssistantService.suggestions()));
    }

    @PostMapping("/chat")
    @Operation(summary = "Ask FanBot for a match and a café recommendation")
    public ResponseEntity<ApiResponse<AssistantChatResponse>> chat(
            @Valid @RequestBody AssistantChatRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(fanAssistantService.chat(request)));
    }
}
