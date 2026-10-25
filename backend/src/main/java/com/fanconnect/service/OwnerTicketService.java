package com.fanconnect.service;

import com.fanconnect.dto.response.TicketVerificationResponse;

public interface OwnerTicketService {

    TicketVerificationResponse verifyTicket(String rawTicketCode);

    TicketVerificationResponse checkInTicket(String rawTicketCode);
}