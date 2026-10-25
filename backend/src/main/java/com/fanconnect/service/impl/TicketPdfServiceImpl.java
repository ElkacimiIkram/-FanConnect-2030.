package com.fanconnect.service.impl;

import com.fanconnect.model.entity.Reservation;
import com.fanconnect.service.TicketPdfService;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Image;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

@Slf4j
@Service
public class TicketPdfServiceImpl implements TicketPdfService {

    private static final DateTimeFormatter DATE_FORMAT =
            DateTimeFormatter.ofPattern("dd MMM yyyy HH:mm").withZone(ZoneId.systemDefault());

    @Override
    public byte[] generateTicketPdf(Reservation reservation) {
        try (ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, output);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
            Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 11);

            document.add(new Paragraph("FanConnect 2030", titleFont));
            document.add(new Paragraph("Match-day reservation ticket", bodyFont));
            document.add(new Paragraph(" "));

            document.add(line("Ticket code", reservation.getTicketCode(), headerFont, bodyFont));

            if (reservation.getMatch() != null) {
                document.add(line("Match",
                        reservation.getMatch().getHomeTeam() + " vs " + reservation.getMatch().getAwayTeam(),
                        headerFont, bodyFont));
                document.add(line("Competition", reservation.getMatch().getCompetition(), headerFont, bodyFont));
            }

            if (reservation.getBusiness() != null) {
                document.add(line("Venue", reservation.getBusiness().getName(), headerFont, bodyFont));
                document.add(line("Address", reservation.getBusiness().getAddress()
                        + ", " + reservation.getBusiness().getCity(), headerFont, bodyFont));
            }

            if (reservation.getSpace() != null) {
                document.add(line("Space", reservation.getSpace().getName(), headerFont, bodyFont));
            }

            if (reservation.getTable() != null) {
                document.add(line("Table", reservation.getTable().getTableNumber(), headerFont, bodyFont));
            }

            document.add(line("Party size", String.valueOf(reservation.getPartySize()), headerFont, bodyFont));
            document.add(line("Date", DATE_FORMAT.format(reservation.getReservationDateTime()
                    .atZone(ZoneId.systemDefault())), headerFont, bodyFont));

            if (reservation.getTotalPrice() != null) {
                document.add(line("Amount paid", reservation.getTotalPrice() + " MAD", headerFont, bodyFont));
            }

            document.add(new Paragraph(" "));
            document.add(qrImage(reservation.getTicketCode()));
            document.add(new Paragraph("Scan to verify at the venue", bodyFont));

            document.close();
            return output.toByteArray();
        } catch (Exception ex) {
            log.error("Failed to generate ticket PDF", ex);
            throw new IllegalStateException("Could not generate ticket PDF");
        }
    }

    private Paragraph line(String label, String value, Font headerFont, Font bodyFont) {
        Paragraph paragraph = new Paragraph();
        paragraph.add(new Paragraph(label + ": ", headerFont));
        paragraph.add(new Paragraph(value, bodyFont));
        paragraph.setSpacingAfter(6f);
        return paragraph;
    }

    private Image qrImage(String ticketCode) throws Exception {
        String payload = "FANCONNECT|TICKET|" + ticketCode;
        BitMatrix matrix = new QRCodeWriter().encode(payload, BarcodeFormat.QR_CODE, 160, 160);
        ByteArrayOutputStream qrOut = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(matrix, "PNG", qrOut);
        Image image = Image.getInstance(qrOut.toByteArray());
        image.scaleToFit(120, 120);
        image.setAlignment(Element.ALIGN_CENTER);
        return image;
    }
}