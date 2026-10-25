package com.fanconnect.util;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class TicketCodeParserTest {

    @Test
    void normalize_plainCode() {
        assertEquals("FC-AB12CD34", TicketCodeParser.normalize("FC-AB12CD34"));
    }

    @Test
    void normalize_qrPayload() {
        assertEquals("FC-AB12CD34", TicketCodeParser.normalize("FANCONNECT|TICKET|FC-AB12CD34"));
    }

    @Test
    void normalize_trimsWhitespace() {
        assertEquals("FC-AB12CD34", TicketCodeParser.normalize("  FC-AB12CD34  "));
    }

    @Test
    void normalize_pipeSuffix() {
        assertEquals("FC-XYZ", TicketCodeParser.normalize("PREFIX|SUFFIX|FC-XYZ"));
    }

    @Test
    void normalize_blankReturnsNull() {
        assertNull(TicketCodeParser.normalize(null));
        assertNull(TicketCodeParser.normalize(""));
        assertNull(TicketCodeParser.normalize("   "));
    }
}