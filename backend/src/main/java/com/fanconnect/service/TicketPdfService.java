package com.fanconnect.service;

import com.fanconnect.model.entity.Reservation;

public interface TicketPdfService {

    byte[] generateTicketPdf(Reservation reservation);
}