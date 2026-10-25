package com.fanconnect.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssistantChatResponse {

    private String reply;
    private String source;
    private String intent;
    private boolean llmEnabled;
    private List<AssistantMatchCardResponse> matches;
    private List<AssistantVenueCardResponse> venues;
    private List<String> suggestions;
}
