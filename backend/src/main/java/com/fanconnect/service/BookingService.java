package com.fanconnect.service;

import com.fanconnect.dto.request.ConfirmPaymentRequest;
import com.fanconnect.dto.request.CreateBusinessBookingRequest;
import com.fanconnect.dto.response.PaymentIntentResponse;
import com.fanconnect.dto.response.PaymentResponse;
import com.fanconnect.dto.response.ReservationResponse;
import com.fanconnect.dto.response.TableAvailabilityResponse;

import java.util.List;

public interface BookingService {

    List<TableAvailabilityResponse> getAvailableTables(Long businessId, Long spaceId, Long matchId);

    ReservationResponse createBusinessBooking(CreateBusinessBookingRequest request);

    PaymentIntentResponse createPaymentIntent(Long reservationId);

    PaymentResponse payForBooking(Long reservationId, ConfirmPaymentRequest request);

    ReservationResponse getTicket(Long reservationId);

    byte[] downloadTicketPdf(Long reservationId);

    List<ReservationResponse> listMyBookings();

    ReservationResponse getBooking(Long reservationId);

    void cancelBooking(Long reservationId);
}