package com.fanconnect.service;

import com.fanconnect.dto.request.AssistantChatRequest;
import com.fanconnect.dto.response.AssistantChatResponse;

import java.util.List;

public interface FanAssistantService {

    AssistantChatResponse chat(AssistantChatRequest request);

    List<String> suggestions();
}
